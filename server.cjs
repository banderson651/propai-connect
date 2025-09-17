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

app.use(cors());
app.use(bodyParser.json());

const saveEmailAccountSchema = z.object({
  id: z.string().uuid().optional(),
  user_id: z.string().uuid(),
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

// Save or update an email account
app.post('/api/save-email-account', async (req, res) => {
  try {
    const payload = saveEmailAccountSchema.parse(req.body);
    const {
      id,
      smtpPass,
      status,
      last_checked,
      ...account
    } = payload;

    const encryptedPassword = encrypt(smtpPass);
    const upsertPayload = {
      ...(id ? { id } : {}),
      user_id: account.user_id,
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
app.post('/api/test-smtp', async (req, res) => {
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
app.post('/api/send-test-email', async (req, res) => {
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

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
}); 
