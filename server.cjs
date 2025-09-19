const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const cors = require('cors');
const { z, ZodError } = require('zod');
const { encrypt, decrypt } = require('./crypto-utils.cjs');
const { createClient } = require('@supabase/supabase-js');

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
