const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const cors = require('cors');
const { z, ZodError } = require('zod');
const { encrypt, decrypt } = require('./crypto-utils.cjs');
const { createClient } = require('@supabase/supabase-js');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 5000;

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL) {
  throw new Error('Missing SUPABASE_URL environment variable');
}

if (!SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
}

const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY // Use service role for admin access
);

const allowedOrigins = (process.env.CLIENT_ORIGINS || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const PUBLIC_API_BASE_URL = process.env.PUBLIC_API_BASE_URL || process.env.SERVER_PUBLIC_URL || '';
const TRACKING_BASE_URL = PUBLIC_API_BASE_URL ? PUBLIC_API_BASE_URL.replace(/\/$/, '') : '';
const TRACKING_PIXEL = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAAWgmWQ0AAAAASUVORK5CYII=',
  'base64'
);
const DEFAULT_BATCH_SIZE = 50;
const DEFAULT_INTERVAL_SECONDS = 60;
const MAX_BATCH_SIZE = 500;
const campaignSendControllers = new Map();
const campaignScheduler = {
  intervalId: null,
  running: false,
};

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const countRecipientEventsSince = async (campaignId, since, statusList = ['sent']) => {
  const { count, error } = await supabase
    .from('email_campaign_recipients')
    .select('id', { count: 'exact', head: true })
    .eq('campaign_id', campaignId)
    .in('status', statusList)
    .gte('sent_at', since);

  if (error) {
    console.error('Failed to count recipients for rate limiting', error);
    return 0;
  }

  return count || 0;
};

const isSendCapExceeded = async (campaignId, limit, windowMs) => {
  if (!limit) return false;
  const sinceIso = new Date(Date.now() - windowMs).toISOString();
  const count = await countRecipientEventsSince(campaignId, sinceIso, ['sent', 'delivered', 'opened', 'clicked']);
  return count >= limit;
};

const startCampaignDispatch = async (campaignId, userId, options = {}) => {
  if (campaignSendControllers.has(campaignId)) {
    return { status: 'already_running' };
  }

  const controller = { cancelled: false };
  controller.stop = () => {
    controller.cancelled = true;
  };
  campaignSendControllers.set(campaignId, controller);

  (async () => {
    try {
      let campaign = await fetchCampaignForUser(campaignId, userId);

      if (!options.force && ['completed', 'sending'].includes(campaign.status)) {
        campaignSendControllers.delete(campaignId);
        return;
      }

      const account = await fetchEmailAccountForUser(campaign.email_account_id, userId);
      const smtpPass = decrypt(account.smtp_password_encrypted);
      const transporter = createTransporter(account, smtpPass);

      try {
        await transporter.verify();
      } catch (verifyError) {
        throw new Error(`SMTP verification failed: ${verifyError.message}`);
      }

      const nowIso = new Date().toISOString();
      await supabase
        .from('email_campaigns')
        .update({
          status: 'sending',
          started_at: campaign.started_at || nowIso,
          updated_at: nowIso,
        })
        .eq('id', campaignId);

      const rawSettings = campaign.send_settings || {};
      const normalizedSettings = {
        batch_size: Math.min(Math.max(1, rawSettings.batch_size ?? DEFAULT_BATCH_SIZE), MAX_BATCH_SIZE),
        interval_seconds: rawSettings.interval_seconds ?? DEFAULT_INTERVAL_SECONDS,
        hourly_cap: rawSettings.hourly_cap ?? account.hourly_send_limit ?? null,
        daily_cap: rawSettings.daily_cap ?? account.daily_send_limit ?? null,
      };

      while (!controller.cancelled) {
        if (await isSendCapExceeded(campaignId, normalizedSettings.daily_cap, 24 * 60 * 60 * 1000)) {
          await supabase
            .from('email_campaigns')
            .update({ status: 'paused', updated_at: new Date().toISOString() })
            .eq('id', campaignId);
          break;
        }

        if (await isSendCapExceeded(campaignId, normalizedSettings.hourly_cap, 60 * 60 * 1000)) {
          await supabase
            .from('email_campaigns')
            .update({ status: 'paused', updated_at: new Date().toISOString() })
            .eq('id', campaignId);
          break;
        }

        const recipients = await fetchRecipientsForCampaign(campaignId, {
          statuses: ['pending', 'queued', 'failed'],
          limit: normalizedSettings.batch_size,
        });

        if (!recipients.length) {
          break;
        }

        for (const recipient of recipients) {
          if (controller.cancelled) {
            break;
          }

          const metadata = recipient.metadata || {};
          const trackingToken = ensureRecipientToken({ ...recipient, metadata });
          if (!recipient.metadata?.tracking_token) {
            await supabase
              .from('email_campaign_recipients')
              .update({ metadata })
              .eq('id', recipient.id);
          }

          const substitutionData = {
            ...recipient.substitution_data,
            recipientEmail: recipient.email,
            recipientName: recipient.name || recipient.email,
            name: recipient.name || '',
            email: recipient.email,
          };

          const trackingUrl = buildTrackingPixelUrl(trackingToken);
          const clickTrackingBaseUrl = buildClickTrackingBaseUrl(trackingToken);

          if (trackingUrl) {
            substitutionData.trackingPixelUrl = trackingUrl;
          }
          if (clickTrackingBaseUrl) {
            substitutionData.clickTrackingBaseUrl = clickTrackingBaseUrl;
          }

          const htmlBody = applyTemplateVariables(campaign.html_body, substitutionData);
          const textBody = applyTemplateVariables(campaign.text_body, substitutionData);
          const subject = applyTemplateVariables(campaign.subject, substitutionData);
          const htmlWithTracking = injectTrackingPixel(htmlBody, trackingUrl);

          try {
            await updateRecipientStatus(recipient.id, {
              status: 'sending',
              send_attempts: (recipient.send_attempts || 0) + 1,
              last_error: null,
              scheduled_at: recipient.scheduled_at || new Date().toISOString(),
            });

            await transporter.sendMail({
              from: campaign.from_name
                ? `${campaign.from_name} <${account.email}>`
                : account.email,
              to: recipient.email,
              replyTo: campaign.reply_to || account.reply_to || account.email,
              subject,
              html: htmlWithTracking,
              text: textBody || undefined,
            });

            const sentAtIso = new Date().toISOString();
            await updateRecipientStatus(recipient.id, {
              status: 'sent',
              sent_at: sentAtIso,
            });
            await recordCampaignEvent(campaignId, recipient.id, 'sent', { transport: 'smtp' });
            await incrementCampaignMetrics(campaignId, { sent: 1 });
            await supabase
              .from('email_accounts')
              .update({ last_sent_at: sentAtIso, last_smtp_error: null })
              .eq('id', account.id);
          } catch (error) {
            console.error('Error sending campaign email', {
              campaignId,
              recipientId: recipient.id,
              error,
            });
            await updateRecipientStatus(recipient.id, {
              status: 'failed',
              last_error: error.message,
              send_attempts: (recipient.send_attempts || 0) + 1,
            });
            await recordCampaignEvent(campaignId, recipient.id, 'failed', {
              message: error.message,
            });
            await incrementCampaignMetrics(campaignId, { failed: 1 });
            await supabase
              .from('email_accounts')
              .update({ last_smtp_error: error.message })
              .eq('id', account.id);
          }
        }

        if (controller.cancelled) {
          break;
        }

        if (normalizedSettings.interval_seconds > 0) {
          await delay(normalizedSettings.interval_seconds * 1000);
        }
      }

      const { count: remaining, error: remainingError } = await supabase
        .from('email_campaign_recipients')
        .select('id', { count: 'exact', head: true })
        .eq('campaign_id', campaignId)
        .in('status', ['pending', 'queued', 'sending']);

      if (remainingError) {
        console.error('Failed to evaluate remaining recipients', remainingError);
      }

      const updatePayload = {};
      if (controller.cancelled) {
        updatePayload.status = 'paused';
      } else if (!remaining) {
        updatePayload.status = 'completed';
        updatePayload.completed_at = new Date().toISOString();
      } else {
        updatePayload.status = 'failed';
      }
      updatePayload.updated_at = new Date().toISOString();

      await supabase
        .from('email_campaigns')
        .update(updatePayload)
        .eq('id', campaignId);
    } catch (error) {
      console.error('Campaign dispatch worker crashed', {
        campaignId,
        error,
      });
      await supabase
        .from('email_campaigns')
        .update({ status: 'failed', updated_at: new Date().toISOString() })
        .eq('id', campaignId);
    } finally {
      campaignSendControllers.delete(campaignId);
    }
  })();

  return { status: 'started' };
};

const startCampaignScheduler = () => {
  if (campaignScheduler.running) {
    return;
  }

  campaignScheduler.running = true;
  const intervalMs = Number(process.env.CAMPAIGN_SCHEDULER_INTERVAL_MS || 60000);

  campaignScheduler.intervalId = setInterval(async () => {
    try {
      const nowIso = new Date().toISOString();
      const { data, error } = await supabase
        .from('email_campaigns')
        .select('id, user_id, scheduled_at')
        .eq('status', 'scheduled')
        .lte('scheduled_at', nowIso)
        .order('scheduled_at', { ascending: true })
        .limit(5);

      if (error) {
        console.error('Scheduler failed to load due campaigns', error);
        return;
      }

      for (const campaign of data || []) {
        await startCampaignDispatch(campaign.id, campaign.user_id, { force: false });
      }
    } catch (error) {
      console.error('Campaign scheduler tick failed', error);
    }
  }, intervalMs);
};

if (process.env.DISABLE_CAMPAIGN_SCHEDULER !== 'true') {
  startCampaignScheduler();
}

const stopCampaignScheduler = () => {
  if (campaignScheduler.intervalId) {
    clearInterval(campaignScheduler.intervalId);
    campaignScheduler.intervalId = null;
    campaignScheduler.running = false;
  }
};

process.on('SIGTERM', stopCampaignScheduler);
process.on('SIGINT', stopCampaignScheduler);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
        return callback(null, origin);
      }
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  })
);
app.use(bodyParser.json());

const authenticateRequest = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.toLowerCase().startsWith('bearer ')) {
      return res.status(401).json({ success: false, message: 'Missing or invalid authorization header' });
    }

    const token = authHeader.slice(7).trim();
    if (!token) {
      return res.status(401).json({ success: false, message: 'Missing access token' });
    }

    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data?.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    req.authToken = token;
    req.user = data.user;
    return next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
};

const saveEmailAccountSchema = z.object({
  id: z.string().uuid().optional(),
  email: z.string().email(),
  name: z.string().min(1),
  type: z.string().min(1).default('smtp'),
  host: z.string().min(1),
  port: z.coerce.number().int().positive(),
  username: z.string().min(1),
  secure: z.boolean().default(true),
  smtp_secure: z.boolean().default(true),
  is_active: z.boolean().default(true),
  is_default: z.boolean().default(false),
  status: z.string().min(1).optional(),
  last_checked: z.string().datetime({ offset: true }).nullable().optional(),
  domain_verified: z.boolean().default(false),
  smtpPass: z.string().min(1)
});

const testExistingAccountSchema = z.object({
  id: z.string().uuid()
});

const testNewAccountSchema = z.object({
  host: z.string().min(1),
  port: z.coerce.number().int().positive(),
  username: z.string().min(1),
  secure: z.boolean().default(true),
  smtpPass: z.string().min(1)
});

const sendTestEmailSchema = z.object({
  id: z.string().uuid(),
  recipient: z.string().email()
});

const sanitizeAccountResponse = (account) => {
  if (!account) return null;
  const { smtp_password_encrypted, ...rest } = account;
  return rest;
};

const emailSettingsSchema = z.object({
  smtp_host: z.string().min(1),
  smtp_port: z.coerce.number().int().positive(),
  smtp_user: z.string().min(1),
  smtp_password: z.string().min(1)
});

const gmailTokenExchangeSchema = z.object({
  code: z.string().min(1)
});

const gmailRefreshSchema = z.object({
  refreshToken: z.string().min(1)
});

const emailTemplateSchema = z.object({
  name: z.string().min(1),
  subject: z.string().min(1),
  htmlBody: z.string().min(1),
  textBody: z.string().optional(),
  description: z.string().optional(),
  placeholders: z.array(z.string().min(1)).optional(),
  metadata: z.record(z.any()).optional(),
  isPrebuilt: z.boolean().optional(),
});

const emailTemplateUpdateSchema = emailTemplateSchema.partial();

const sendSettingsSchema = z.object({
  batchSize: z.number().int().positive().max(MAX_BATCH_SIZE).optional(),
  intervalSeconds: z.number().int().positive().max(3600).optional(),
  hourlyCap: z.number().int().positive().nullable().optional(),
  dailyCap: z.number().int().positive().nullable().optional(),
});

const campaignRecipientSchema = z.object({
  contactId: z.string().uuid().nullable().optional(),
  email: z.string().email(),
  name: z.string().min(1).optional(),
  substitutionData: z.record(z.any()).optional(),
});

const emailCampaignSchema = z.object({
  name: z.string().min(1),
  subject: z.string().min(1),
  emailAccountId: z.string().uuid(),
  templateId: z.string().uuid().nullable().optional(),
  fromName: z.string().optional(),
  replyTo: z.string().email().optional(),
  htmlBody: z.string().min(1),
  textBody: z.string().optional(),
  scheduledAt: z.string().datetime({ offset: true }).nullable().optional(),
  sendSettings: sendSettingsSchema.optional(),
  recipients: z.array(campaignRecipientSchema).min(1),
  metadata: z.record(z.any()).optional(),
});

const emailCampaignUpdateSchema = emailCampaignSchema.partial();

const scheduleCampaignSchema = z.object({
  scheduledAt: z.string().datetime({ offset: true })
});

const normalizeSendSettings = (settings = {}) => ({
  batch_size: settings.batchSize ?? DEFAULT_BATCH_SIZE,
  interval_seconds: settings.intervalSeconds ?? DEFAULT_INTERVAL_SECONDS,
  hourly_cap: settings.hourlyCap ?? null,
  daily_cap: settings.dailyCap ?? null,
});

const mapSendSettingsToClient = (settings = {}) => ({
  batchSize: settings.batch_size ?? DEFAULT_BATCH_SIZE,
  intervalSeconds: settings.interval_seconds ?? DEFAULT_INTERVAL_SECONDS,
  hourlyCap: settings.hourly_cap ?? null,
  dailyCap: settings.daily_cap ?? null,
});

const buildTemplateResponse = (template) => ({
  id: template.id,
  name: template.name,
  subject: template.subject,
  body: template.html_body,
  htmlBody: template.html_body,
  textBody: template.text_body,
  description: template.description,
  placeholders: template.placeholders ?? [],
  metadata: template.metadata ?? {},
  isPrebuilt: Boolean(template.is_prebuilt),
  createdAt: template.created_at,
  updatedAt: template.updated_at,
});

const buildRecipientResponse = (recipient) => ({
  id: recipient.id,
  campaignId: recipient.campaign_id,
  contactId: recipient.contact_id,
  email: recipient.email,
  name: recipient.name,
  substitutionData: recipient.substitution_data || {},
  status: recipient.status,
  lastError: recipient.last_error,
  sendAttempts: recipient.send_attempts,
  scheduledAt: recipient.scheduled_at,
  sentAt: recipient.sent_at,
  deliveredAt: recipient.delivered_at,
  openedAt: recipient.opened_at,
  clickedAt: recipient.clicked_at,
  bouncedAt: recipient.bounced_at,
  complainedAt: recipient.complained_at,
  unsubscribedAt: recipient.unsubscribed_at,
  openCount: recipient.open_count,
  clickCount: recipient.click_count,
  metadata: recipient.metadata || {},
  createdAt: recipient.created_at,
  updatedAt: recipient.updated_at,
});

const buildCampaignResponse = (campaign) => ({
  id: campaign.id,
  name: campaign.name,
  subject: campaign.subject,
  status: campaign.status,
  emailAccountId: campaign.email_account_id,
  templateId: campaign.template_id,
  fromName: campaign.from_name,
  replyTo: campaign.reply_to,
  htmlBody: campaign.html_body,
  textBody: campaign.text_body,
  scheduledAt: campaign.scheduled_at,
  startedAt: campaign.started_at,
  completedAt: campaign.completed_at,
  cancelledAt: campaign.cancelled_at,
  sendSettings: mapSendSettingsToClient(campaign.send_settings || {}),
  metrics: campaign.metrics || {},
  metadata: campaign.metadata || {},
  createdAt: campaign.created_at,
  updatedAt: campaign.updated_at,
});

const applyTemplateVariables = (content, data = {}) => {
  if (!content) return content;
  let rendered = content;
  Object.entries(data).forEach(([key, rawValue]) => {
    const value = rawValue == null ? '' : String(rawValue);
    const pattern = new RegExp(`{{\\s*${key}\\s*}}`, 'gi');
    rendered = rendered.replace(pattern, value);
  });
  return rendered;
};

const buildTrackingPixelUrl = (token) => {
  if (!TRACKING_BASE_URL || !token) return null;
  return `${TRACKING_BASE_URL}/api/campaigns/track/open/${token}.png`;
};

const buildClickTrackingBaseUrl = (token) => {
  if (!TRACKING_BASE_URL || !token) return null;
  return `${TRACKING_BASE_URL}/api/campaigns/track/click/${token}`;
};

const injectTrackingPixel = (html, trackingUrl) => {
  if (!trackingUrl || !html) return html;
  if (html.includes(trackingUrl)) return html;
  return `${html}\n<img src="${trackingUrl}" alt="" width="1" height="1" style="display:none" />`;
};

const fetchEmailAccountForUser = async (accountId, userId) => {
  const { data, error } = await supabase
    .from('email_accounts')
    .select('*')
    .eq('id', accountId)
    .single();

  if (error || !data) {
    throw new Error('Email account not found');
  }

  if (data.user_id !== userId) {
    throw new Error('Forbidden');
  }

  return data;
};

const fetchCampaignForUser = async (campaignId, userId) => {
  const { data, error } = await supabase
    .from('email_campaigns')
    .select('*')
    .eq('id', campaignId)
    .single();

  if (error || !data) {
    throw new Error('Campaign not found');
  }

  if (data.user_id !== userId) {
    throw new Error('Forbidden');
  }

  return data;
};

const fetchRecipientsForCampaign = async (campaignId, filters = {}) => {
  let query = supabase
    .from('email_campaign_recipients')
    .select('*')
    .eq('campaign_id', campaignId)
    .order('created_at', { ascending: true });

  if (filters.statuses?.length) {
    query = query.in('status', filters.statuses);
  }

  if (typeof filters.limit === 'number') {
    query = query.limit(filters.limit);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return data || [];
};

const incrementCampaignMetrics = async (campaignId, delta) => {
  if (!delta || Object.keys(delta).length === 0) return;
  const { error } = await supabase.rpc('increment_campaign_metrics', {
    campaign_uuid: campaignId,
    delta,
  });
  if (error) {
    console.error('Failed to increment campaign metrics', error);
  }
};

const recordCampaignEvent = async (campaignId, recipientId, eventType, payload = {}) => {
  const { error } = await supabase
    .from('email_campaign_events')
    .insert({
      campaign_id: campaignId,
      recipient_id: recipientId,
      event_type: eventType,
      payload,
    });

  if (error) {
    console.error('Failed to record campaign event', error);
  }
};

const updateRecipientStatus = async (recipientId, fields) => {
  const { error } = await supabase
    .from('email_campaign_recipients')
    .update(fields)
    .eq('id', recipientId);

  if (error) {
    console.error('Failed to update recipient status', error);
  }
};

const ensureRecipientToken = (recipient) => {
  const metadata = recipient.metadata || {};
  if (!metadata.tracking_token) {
    metadata.tracking_token = uuidv4();
  }
  return metadata.tracking_token;
};

const createTransporter = (account, password) => nodemailer.createTransport({
  host: account.host,
  port: account.port,
  secure: Boolean(account.secure),
  auth: {
    user: account.username,
    pass: password,
  },
});

const GMAIL_CLIENT_ID = process.env.GMAIL_CLIENT_ID;
const GMAIL_CLIENT_SECRET = process.env.GMAIL_CLIENT_SECRET;
const GMAIL_REDIRECT_URI = process.env.GMAIL_REDIRECT_URI;

// Save or update an email account
app.post('/api/save-email-account', authenticateRequest, async (req, res) => {
  try {
    const payload = saveEmailAccountSchema.parse(req.body);
    const {
      id,
      smtpPass,
      status,
      last_checked,
      ...account
    } = payload;

    if (id) {
      const { data: existingAccount, error: existingError } = await supabase
        .from('email_accounts')
        .select('user_id')
        .eq('id', id)
        .single();

      if (existingError && existingError.code !== 'PGRST116') {
        console.error('Supabase existing account fetch error:', existingError);
        return res.status(500).json({ success: false, message: 'Failed to validate email account ownership' });
      }

      if (existingAccount && existingAccount.user_id !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Forbidden' });
      }
    }

    const encryptedPassword = encrypt(smtpPass);
    const upsertPayload = {
      ...(id ? { id } : {}),
      user_id: req.user.id,
      email: account.email,
      name: account.name || account.email,
      type: account.type,
      host: account.host,
      port: account.port,
      username: account.username,
      secure: account.secure,
      smtp_secure: account.smtp_secure,
      is_active: account.is_active,
      is_default: account.is_default,
      status: status ?? 'active',
      last_checked: last_checked ?? null,
      domain_verified: account.domain_verified,
      smtp_password_encrypted: encryptedPassword,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('email_accounts')
      .upsert(upsertPayload, { onConflict: 'id' })
      .select()
      .single(); // Assuming id is provided for update, or upsert returns the single new row

    if (error) {
      console.error('Supabase upsert error:', error);
      return res.status(500).json({ success: false, message: 'Failed to save email account' });
    }
    res.json({ success: true, message: 'Account saved', account: sanitizeAccountResponse(data) });
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email account payload',
        issues: error.errors
      });
    }
    console.error('Backend save email account error:', error);
    res.status(500).json({ success: false, message: 'Failed to save email account' });
  }
});

// Test SMTP connection using encrypted password
app.post('/api/test-smtp', authenticateRequest, async (req, res) => {
  let account;
  let smtpPass;

  const existingPayload = testExistingAccountSchema.safeParse(req.body);

  if (existingPayload.success) {
    const { id } = existingPayload.data;
    const { data, error } = await supabase
      .from('email_accounts')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return res.status(404).json({ success: false, message: 'Account not found' });
    if (data.user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    account = data;
    try {
      smtpPass = decrypt(account.smtp_password_encrypted);
    } catch (decryptError) {
      console.error('Decryption error:', decryptError);
      return res.status(500).json({ success: false, message: 'Failed to decrypt password' });
    }
  } else {
    const newAccountPayload = testNewAccountSchema.safeParse(req.body);
    if (!newAccountPayload.success) {
      return res.status(400).json({ success: false, message: 'Invalid data for SMTP test' });
    }

    const { host, port, username, secure, smtpPass: providedPass } = newAccountPayload.data;
    account = { host, port, username, secure };
    smtpPass = providedPass;
  }

  try {
    const transporter = nodemailer.createTransport({
      host: account.host,
      port: account.port,
      secure: Boolean(account.secure),
      auth: { user: account.username, pass: smtpPass }
    });
    await transporter.verify();
    res.json({ success: true, message: 'Connection successful' });
  } catch (error) {
    console.error('SMTP connection test failed:', error);
    res.json({ success: false, message: 'SMTP connection failed' });
  }
});

// Send test email using encrypted password
app.post('/api/send-test-email', authenticateRequest, async (req, res) => {
  try {
    const { id, recipient } = sendTestEmailSchema.parse(req.body);

    const { data: account, error } = await supabase
      .from('email_accounts')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !account) {
      return res.status(404).json({ success: false, message: 'Account not found' });
    }

    if (account.user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    const smtpPass = decrypt(account.smtp_password_encrypted);
    const transporter = nodemailer.createTransport({
      host: account.host,
      port: account.port,
      secure: Boolean(account.secure),
      auth: { user: account.username, pass: smtpPass }
    });
    await transporter.sendMail({
      from: account.email,
      to: recipient,
      subject: 'Test Email from PropAI Connect',
      text: 'This is a test email to verify your email account configuration.',
      html: '<p>This is a test email to verify your email account configuration.</p>'
    });
    res.json({ success: true, message: 'Test email sent successfully' });
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid test email payload',
        issues: error.errors
      });
    }
    console.error('Error sending test email:', error);
    res.json({ success: false, message: 'Failed to send test email' });
  }
});

// Email template CRUD
app.get('/api/email-templates', authenticateRequest, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('email_templates')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      templates: (data || []).map(buildTemplateResponse),
    });
  } catch (error) {
    console.error('Failed to fetch email templates', error);
    res.status(500).json({ success: false, message: 'Failed to fetch email templates' });
  }
});

app.get('/api/email-templates/:id', authenticateRequest, async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('email_templates')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return res.status(404).json({ success: false, message: 'Template not found' });
    }

    if (data.user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    res.json({ success: true, template: buildTemplateResponse(data) });
  } catch (error) {
    console.error('Failed to fetch template', error);
    res.status(500).json({ success: false, message: 'Failed to fetch template' });
  }
});

app.post('/api/email-templates', authenticateRequest, async (req, res) => {
  try {
    const payload = emailTemplateSchema.parse(req.body);
    const insertPayload = {
      user_id: req.user.id,
      name: payload.name,
      subject: payload.subject,
      html_body: payload.htmlBody,
      text_body: payload.textBody ?? null,
      description: payload.description ?? null,
      placeholders: payload.placeholders ?? [],
      metadata: payload.metadata ?? {},
      is_prebuilt: payload.isPrebuilt ?? false,
    };

    const { data, error } = await supabase
      .from('email_templates')
      .insert(insertPayload)
      .select('*')
      .single();

    if (error) {
      throw error;
    }

    res.json({ success: true, template: buildTemplateResponse(data) });
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({ success: false, message: 'Invalid template payload', issues: error.errors });
    }
    console.error('Failed to create template', error);
    res.status(500).json({ success: false, message: 'Failed to create template' });
  }
});

app.patch('/api/email-templates/:id', authenticateRequest, async (req, res) => {
  try {
    const { id } = req.params;
    const payload = emailTemplateUpdateSchema.parse(req.body);

    const updatePayload = {};
    if (payload.name !== undefined) updatePayload.name = payload.name;
    if (payload.subject !== undefined) updatePayload.subject = payload.subject;
    if (payload.htmlBody !== undefined) updatePayload.html_body = payload.htmlBody;
    if (payload.textBody !== undefined) updatePayload.text_body = payload.textBody;
    if (payload.description !== undefined) updatePayload.description = payload.description;
    if (payload.placeholders !== undefined) updatePayload.placeholders = payload.placeholders;
    if (payload.metadata !== undefined) updatePayload.metadata = payload.metadata;
    if (payload.isPrebuilt !== undefined) updatePayload.is_prebuilt = payload.isPrebuilt;

    if (Object.keys(updatePayload).length === 0) {
      return res.json({ success: true, template: null });
    }

    const { data, error } = await supabase
      .from('email_templates')
      .update(updatePayload)
      .eq('id', id)
      .eq('user_id', req.user.id)
      .select('*')
      .single();

    if (error || !data) {
      return res.status(404).json({ success: false, message: 'Template not found' });
    }

    res.json({ success: true, template: buildTemplateResponse(data) });
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({ success: false, message: 'Invalid template payload', issues: error.errors });
    }
    console.error('Failed to update template', error);
    res.status(500).json({ success: false, message: 'Failed to update template' });
  }
});

app.delete('/api/email-templates/:id', authenticateRequest, async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('email_templates')
      .delete()
      .eq('id', id)
      .eq('user_id', req.user.id);

    if (error) {
      throw error;
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Failed to delete template', error);
    res.status(500).json({ success: false, message: 'Failed to delete template' });
  }
});

// Campaign routes
app.get('/api/campaigns', authenticateRequest, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('email_campaigns')
      .select('*, email_campaign_recipients(count)')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    const campaigns = (data || []).map((campaign) => {
      const recipientsCount = Array.isArray(campaign.email_campaign_recipients)
        ? campaign.email_campaign_recipients[0]?.count ?? 0
        : 0;
      const response = buildCampaignResponse(campaign);
      response.totalRecipients = recipientsCount;
      return response;
    });

    res.json({ success: true, campaigns });
  } catch (error) {
    console.error('Failed to fetch campaigns', error);
    res.status(500).json({ success: false, message: 'Failed to fetch campaigns' });
  }
});

app.get('/api/campaigns/:id', authenticateRequest, async (req, res) => {
  try {
    const { id } = req.params;
    const includeRecipients = req.query.includeRecipients === 'true';

    const campaign = await fetchCampaignForUser(id, req.user.id);
    const response = buildCampaignResponse(campaign);

    if (includeRecipients) {
      const { data: recipientRows, error } = await supabase
        .from('email_campaign_recipients')
        .select('*')
        .eq('campaign_id', id)
        .order('created_at', { ascending: true })
        .limit(200);

      if (error) {
        throw error;
      }

      response.recipients = (recipientRows || []).map(buildRecipientResponse);
    }

    res.json({ success: true, campaign: response });
  } catch (error) {
    if (error.message === 'Campaign not found') {
      return res.status(404).json({ success: false, message: 'Campaign not found' });
    }
    if (error.message === 'Forbidden') {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    console.error('Failed to fetch campaign', error);
    res.status(500).json({ success: false, message: 'Failed to fetch campaign' });
  }
});

app.get('/api/campaigns/:id/recipients', authenticateRequest, async (req, res) => {
  try {
    const { id } = req.params;
    await fetchCampaignForUser(id, req.user.id);

    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const pageSize = Math.min(200, Math.max(1, parseInt(req.query.pageSize, 10) || 50));
    const offset = (page - 1) * pageSize;
    const statusFilter = req.query.status;

    let query = supabase
      .from('email_campaign_recipients')
      .select('*', { count: 'exact' })
      .eq('campaign_id', id)
      .order('created_at', { ascending: true })
      .range(offset, offset + pageSize - 1);

    if (typeof statusFilter === 'string' && statusFilter.length) {
      const statuses = statusFilter.split(',').map((status) => status.trim()).filter(Boolean);
      if (statuses.length === 1) {
        query = query.eq('status', statuses[0]);
      } else if (statuses.length > 1) {
        query = query.in('status', statuses);
      }
    }

    const { data, count, error } = await query;

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      recipients: (data || []).map(buildRecipientResponse),
      page,
      pageSize,
      total: count ?? 0,
    });
  } catch (error) {
    if (error.message === 'Campaign not found') {
      return res.status(404).json({ success: false, message: 'Campaign not found' });
    }
    if (error.message === 'Forbidden') {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    console.error('Failed to fetch campaign recipients', error);
    res.status(500).json({ success: false, message: 'Failed to fetch campaign recipients' });
  }
});

app.post('/api/campaigns', authenticateRequest, async (req, res) => {
  try {
    const payload = emailCampaignSchema.parse(req.body);
    const normalizedSendSettings = normalizeSendSettings(payload.sendSettings || {});
    const status = payload.scheduledAt ? 'scheduled' : 'draft';
    const recipientsCount = payload.recipients.length;

    const metricsSeed = {
      queued: status === 'scheduled' ? recipientsCount : 0,
      sent: 0,
      delivered: 0,
      opened: 0,
      clicked: 0,
      bounced: 0,
      failed: 0,
      unsubscribed: 0,
    };

    const insertPayload = {
      user_id: req.user.id,
      email_account_id: payload.emailAccountId,
      template_id: payload.templateId ?? null,
      name: payload.name,
      subject: payload.subject,
      from_name: payload.fromName ?? null,
      reply_to: payload.replyTo ?? null,
      html_body: payload.htmlBody,
      text_body: payload.textBody ?? null,
      status,
      scheduled_at: payload.scheduledAt ?? null,
      send_settings: normalizedSendSettings,
      metrics: metricsSeed,
      metadata: payload.metadata ?? {},
    };

    const { data: campaign, error: campaignError } = await supabase
      .from('email_campaigns')
      .insert(insertPayload)
      .select('*')
      .single();

    if (campaignError) {
      throw campaignError;
    }

    const recipientRows = payload.recipients.map((recipient) => ({
      campaign_id: campaign.id,
      contact_id: recipient.contactId ?? null,
      email: recipient.email.toLowerCase(),
      name: recipient.name ?? null,
      substitution_data: recipient.substitutionData ?? {},
      status: status === 'scheduled' ? 'queued' : 'pending',
      metadata: { tracking_token: uuidv4() },
    }));

    const { data: insertedRecipients, error: recipientsError } = await supabase
      .from('email_campaign_recipients')
      .insert(recipientRows)
      .select('*');

    if (recipientsError) {
      await supabase.from('email_campaigns').delete().eq('id', campaign.id);
      throw recipientsError;
    }

    const response = buildCampaignResponse(campaign);
    response.totalRecipients = recipientsCount;
    response.recipients = (insertedRecipients || []).map(buildRecipientResponse);

    if (payload.scheduledAt) {
      const scheduledDate = new Date(payload.scheduledAt);
      if (!Number.isNaN(scheduledDate.valueOf()) && scheduledDate <= new Date()) {
        await startCampaignDispatch(campaign.id, req.user.id, { force: false });
      }
    }

    res.status(201).json({ success: true, campaign: response });
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({ success: false, message: 'Invalid campaign payload', issues: error.errors });
    }
    console.error('Failed to create campaign', error);
    res.status(500).json({ success: false, message: 'Failed to create campaign' });
  }
});

app.patch('/api/campaigns/:id', authenticateRequest, async (req, res) => {
  try {
    const { id } = req.params;
    const payload = emailCampaignUpdateSchema.parse(req.body);

    const campaign = await fetchCampaignForUser(id, req.user.id);
    if (['sending', 'completed'].includes(campaign.status)) {
      return res.status(400).json({ success: false, message: 'Cannot modify a campaign that is already sending or completed' });
    }

    if (payload.recipients) {
      return res.status(400).json({ success: false, message: 'Use the recipients endpoint to modify recipients' });
    }

    const updatePayload = {};
    if (payload.name !== undefined) updatePayload.name = payload.name;
    if (payload.subject !== undefined) updatePayload.subject = payload.subject;
    if (payload.emailAccountId !== undefined) updatePayload.email_account_id = payload.emailAccountId;
    if (payload.templateId !== undefined) updatePayload.template_id = payload.templateId;
    if (payload.fromName !== undefined) updatePayload.from_name = payload.fromName;
    if (payload.replyTo !== undefined) updatePayload.reply_to = payload.replyTo;
    if (payload.htmlBody !== undefined) updatePayload.html_body = payload.htmlBody;
    if (payload.textBody !== undefined) updatePayload.text_body = payload.textBody;
    if (payload.scheduledAt !== undefined) {
      updatePayload.scheduled_at = payload.scheduledAt;
      updatePayload.status = payload.scheduledAt ? 'scheduled' : 'draft';
    }
    if (payload.sendSettings !== undefined) {
      updatePayload.send_settings = normalizeSendSettings(payload.sendSettings);
    }
    if (payload.metadata !== undefined) {
      updatePayload.metadata = payload.metadata;
    }

    if (Object.keys(updatePayload).length === 0) {
      return res.json({ success: true, campaign: buildCampaignResponse(campaign) });
    }

    const { data, error } = await supabase
      .from('email_campaigns')
      .update(updatePayload)
      .eq('id', id)
      .eq('user_id', req.user.id)
      .select('*')
      .single();

    if (error || !data) {
      return res.status(404).json({ success: false, message: 'Campaign not found' });
    }

    res.json({ success: true, campaign: buildCampaignResponse(data) });
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({ success: false, message: 'Invalid campaign payload', issues: error.errors });
    }
    if (error.message === 'Campaign not found') {
      return res.status(404).json({ success: false, message: 'Campaign not found' });
    }
    if (error.message === 'Forbidden') {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    console.error('Failed to update campaign', error);
    res.status(500).json({ success: false, message: 'Failed to update campaign' });
  }
});

app.post('/api/campaigns/:id/schedule', authenticateRequest, async (req, res) => {
  try {
    const { id } = req.params;
    const { scheduledAt } = scheduleCampaignSchema.parse(req.body);
    await fetchCampaignForUser(id, req.user.id);

    const scheduledDate = new Date(scheduledAt);
    if (Number.isNaN(scheduledDate.valueOf())) {
      return res.status(400).json({ success: false, message: 'Invalid scheduled date' });
    }

    const { data, error } = await supabase
      .from('email_campaigns')
      .update({
        scheduled_at: scheduledDate.toISOString(),
        status: 'scheduled',
      })
      .eq('id', id)
      .eq('user_id', req.user.id)
      .select('*')
      .single();

    if (error || !data) {
      return res.status(404).json({ success: false, message: 'Campaign not found' });
    }

    if (scheduledDate <= new Date()) {
      await startCampaignDispatch(id, req.user.id, { force: false });
    }

    res.json({ success: true, campaign: buildCampaignResponse(data) });
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({ success: false, message: 'Invalid schedule payload', issues: error.errors });
    }
    if (error.message === 'Campaign not found') {
      return res.status(404).json({ success: false, message: 'Campaign not found' });
    }
    if (error.message === 'Forbidden') {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    console.error('Failed to schedule campaign', error);
    res.status(500).json({ success: false, message: 'Failed to schedule campaign' });
  }
});

app.post('/api/campaigns/:id/dispatch', authenticateRequest, async (req, res) => {
  try {
    const { id } = req.params;
    await fetchCampaignForUser(id, req.user.id);
    const force = req.body?.force === true;
    const result = await startCampaignDispatch(id, req.user.id, { force });
    res.json({ success: true, status: result.status });
  } catch (error) {
    if (error.message === 'Campaign not found') {
      return res.status(404).json({ success: false, message: 'Campaign not found' });
    }
    if (error.message === 'Forbidden') {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    console.error('Failed to dispatch campaign', error);
    res.status(500).json({ success: false, message: 'Failed to dispatch campaign' });
  }
});

app.post('/api/campaigns/:id/pause', authenticateRequest, async (req, res) => {
  try {
    const { id } = req.params;
    await fetchCampaignForUser(id, req.user.id);

    const controller = campaignSendControllers.get(id);
    if (controller) {
      controller.stop();
    }

    await supabase
      .from('email_campaigns')
      .update({ status: 'paused', updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', req.user.id);

    res.json({ success: true });
  } catch (error) {
    if (error.message === 'Campaign not found') {
      return res.status(404).json({ success: false, message: 'Campaign not found' });
    }
    if (error.message === 'Forbidden') {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    console.error('Failed to pause campaign', error);
    res.status(500).json({ success: false, message: 'Failed to pause campaign' });
  }
});

app.post('/api/campaigns/:id/resume', authenticateRequest, async (req, res) => {
  try {
    const { id } = req.params;
    await fetchCampaignForUser(id, req.user.id);
    const result = await startCampaignDispatch(id, req.user.id, { force: true });
    res.json({ success: true, status: result.status });
  } catch (error) {
    if (error.message === 'Campaign not found') {
      return res.status(404).json({ success: false, message: 'Campaign not found' });
    }
    if (error.message === 'Forbidden') {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    console.error('Failed to resume campaign', error);
    res.status(500).json({ success: false, message: 'Failed to resume campaign' });
  }
});

app.get('/api/campaigns/:id/analytics', authenticateRequest, async (req, res) => {
  try {
    const { id } = req.params;
    const campaign = await fetchCampaignForUser(id, req.user.id);

    const metrics = campaign.metrics || {};
    const totals = {
      sent: Number(metrics.sent || 0),
      delivered: Number(metrics.delivered || 0),
      opened: Number(metrics.opened || 0),
      clicked: Number(metrics.clicked || 0),
      bounced: Number(metrics.bounced || 0),
      failed: Number(metrics.failed || 0),
      unsubscribed: Number(metrics.unsubscribed || 0),
    };

    const totalRecipients = totals.sent + (Number(metrics.queued || 0));

    const rates = {
      deliveryRate: totals.sent ? totals.delivered / totals.sent : 0,
      openRate: totals.sent ? totals.opened / totals.sent : 0,
      clickRate: totals.sent ? totals.clicked / totals.sent : 0,
      bounceRate: totals.sent ? totals.bounced / totals.sent : 0,
      failureRate: totals.sent ? totals.failed / totals.sent : 0,
    };

    const { data: events, error } = await supabase
      .from('email_campaign_events')
      .select('event_type, occurred_at')
      .eq('campaign_id', id)
      .order('occurred_at', { ascending: true });

    if (error) {
      throw error;
    }

    const timelineMap = new Map();
    (events || []).forEach((event) => {
      const dayKey = event.occurred_at ? event.occurred_at.slice(0, 10) : 'unknown';
      const byDay = timelineMap.get(dayKey) || {};
      byDay[event.event_type] = (byDay[event.event_type] || 0) + 1;
      timelineMap.set(dayKey, byDay);
    });

    const timeline = Array.from(timelineMap.entries()).map(([date, counts]) => ({ date, counts }));

    res.json({
      success: true,
      analytics: {
        totals: {
          ...totals,
          recipients: totalRecipients,
        },
        rates,
        timeline,
      },
    });
  } catch (error) {
    if (error.message === 'Campaign not found') {
      return res.status(404).json({ success: false, message: 'Campaign not found' });
    }
    if (error.message === 'Forbidden') {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    console.error('Failed to load campaign analytics', error);
    res.status(500).json({ success: false, message: 'Failed to load analytics' });
  }
});

// Save encrypted email settings for the current user
app.post('/api/email-settings', authenticateRequest, async (req, res) => {
  try {
    const { smtp_host, smtp_port, smtp_user, smtp_password } = emailSettingsSchema.parse(req.body);
    const encryptedPassword = encrypt(smtp_password);

    const { error } = await supabase
      .from('email_settings')
      .upsert({
        user_id: req.user.id,
        smtp_host,
        smtp_port,
        smtp_user,
        smtp_password: encryptedPassword,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      console.error('Supabase upsert email settings error:', error);
      return res.status(500).json({ success: false, message: 'Failed to save email settings' });
    }

    return res.json({ success: true, message: 'Email settings updated' });
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({ success: false, message: 'Invalid email settings data', issues: error.errors });
    }
    console.error('Backend email settings error:', error);
    return res.status(500).json({ success: false, message: 'Failed to save email settings' });
  }
});

const safeRedirectUrl = (urlCandidate) => {
  try {
    const parsed = new URL(urlCandidate);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return null;
    }
    return parsed.toString();
  } catch (error) {
    return null;
  }
};

app.get('/api/campaigns/track/open/:token.png', async (req, res) => {
  const { token } = req.params;

  try {
    if (!token) {
      throw new Error('Missing token');
    }

    const { data, error } = await supabase
      .from('email_campaign_recipients')
      .select('id, campaign_id, open_count, opened_at, status')
      .eq('metadata->>tracking_token', token)
      .limit(1);

    if (error) {
      throw error;
    }

    const recipient = data?.[0];
    if (recipient) {
      const timeNow = new Date().toISOString();
      const isFirstOpen = !recipient.opened_at;

      const updatePayload = {
        open_count: (recipient.open_count || 0) + 1,
      };
      if (isFirstOpen) {
        updatePayload.opened_at = timeNow;
        if (recipient.status === 'sent') {
          updatePayload.status = 'opened';
        }
      }

      await supabase
        .from('email_campaign_recipients')
        .update(updatePayload)
        .eq('id', recipient.id);

      if (isFirstOpen) {
        await recordCampaignEvent(recipient.campaign_id, recipient.id, 'opened', {});
        await incrementCampaignMetrics(recipient.campaign_id, { opened: 1 });
      }
    }
  } catch (error) {
    console.error('Failed to record open event', error);
  } finally {
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'no-store, max-age=0');
    res.send(TRACKING_PIXEL);
  }
});

app.get('/api/campaigns/track/click/:token', async (req, res) => {
  const { token } = req.params;
  const redirectCandidate = typeof req.query.url === 'string' ? req.query.url : undefined;
  const fallbackUrl = (process.env.CLIENT_ORIGINS || '').split(',').map((origin) => origin.trim()).filter(Boolean)[0] || 'https://example.com';
  const redirectUrl = safeRedirectUrl(redirectCandidate) || fallbackUrl;

  try {
    if (!token) {
      throw new Error('Missing token');
    }

    const { data, error } = await supabase
      .from('email_campaign_recipients')
      .select('id, campaign_id, click_count, clicked_at, status')
      .eq('metadata->>tracking_token', token)
      .limit(1);

    if (error) {
      throw error;
    }

    const recipient = data?.[0];
    if (recipient) {
      const timeNow = new Date().toISOString();
      const isFirstClick = !recipient.clicked_at;

      const updatePayload = {
        click_count: (recipient.click_count || 0) + 1,
        clicked_at: recipient.clicked_at || timeNow,
      };

      if (recipient.status === 'sent' || recipient.status === 'opened') {
        updatePayload.status = 'clicked';
      }

      await supabase
        .from('email_campaign_recipients')
        .update(updatePayload)
        .eq('id', recipient.id);

      if (isFirstClick) {
        await recordCampaignEvent(recipient.campaign_id, recipient.id, 'clicked', { url: redirectUrl });
        await incrementCampaignMetrics(recipient.campaign_id, { clicked: 1 });
      }
    }
  } catch (error) {
    console.error('Failed to record click event', error);
  } finally {
    res.redirect(redirectUrl);
  }
});

const assertGmailConfig = () => {
  if (!GMAIL_CLIENT_ID || !GMAIL_CLIENT_SECRET || !GMAIL_REDIRECT_URI) {
    throw new Error('Missing Gmail OAuth configuration');
  }
};

app.post('/api/gmail/oauth/token', authenticateRequest, async (req, res) => {
  try {
    assertGmailConfig();
    const { code } = gmailTokenExchangeSchema.parse(req.body);

    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: GMAIL_CLIENT_ID,
        client_secret: GMAIL_CLIENT_SECRET,
        redirect_uri: GMAIL_REDIRECT_URI,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      const errorBody = await tokenResponse.text();
      console.error('Gmail token exchange failed:', errorBody);
      return res.status(400).json({ success: false, message: 'Failed to exchange authorization code' });
    }

    const tokenData = await tokenResponse.json();
    const { access_token, refresh_token, expires_in } = tokenData;

    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    if (!userResponse.ok) {
      const errorBody = await userResponse.text();
      console.error('Failed to load Gmail user info:', errorBody);
      return res.status(400).json({ success: false, message: 'Failed to fetch user information from Google' });
    }

    const userData = await userResponse.json();

    return res.json({
      success: true,
      account: {
        email: userData.email,
        accessToken: access_token,
        refreshToken: refresh_token,
        expiresAt: new Date(Date.now() + expires_in * 1000).toISOString(),
      },
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({ success: false, message: 'Invalid OAuth payload', issues: error.errors });
    }
    console.error('Gmail OAuth token exchange error:', error);
    return res.status(500).json({ success: false, message: 'Failed to exchange OAuth token' });
  }
});

app.post('/api/gmail/oauth/refresh', authenticateRequest, async (req, res) => {
  try {
    assertGmailConfig();
    const { refreshToken } = gmailRefreshSchema.parse(req.body);

    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: GMAIL_CLIENT_ID,
        client_secret: GMAIL_CLIENT_SECRET,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('Gmail token refresh failed:', errorBody);
      return res.status(400).json({ success: false, message: 'Failed to refresh OAuth token' });
    }

    const data = await response.json();
    const { access_token, expires_in } = data;

    return res.json({
      success: true,
      accessToken: access_token,
      expiresAt: new Date(Date.now() + expires_in * 1000).toISOString(),
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({ success: false, message: 'Invalid refresh token payload', issues: error.errors });
    }
    console.error('Gmail OAuth refresh error:', error);
    return res.status(500).json({ success: false, message: 'Failed to refresh OAuth token' });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
}); 
