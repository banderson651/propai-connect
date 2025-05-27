const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const cors = require('cors');
const { encrypt, decrypt } = require('./crypto-utils.cjs');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 5000;

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Use service role for admin access
);

app.use(cors());
app.use(bodyParser.json());

// Save or update an email account
app.post('/api/save-email-account', async (req, res) => {
  const { id, host, port, username, smtpPass, secure, email, name, type, is_active, is_default, status, last_checked, domain_verified, user_id } = req.body;

  if (!user_id) return res.status(400).json({ success: false, message: 'Missing user_id' });
  if (!smtpPass) return res.status(400).json({ success: false, message: 'Missing password' });

  try {
    const encryptedPassword = encrypt(smtpPass);

    const { data, error } = await supabase
      .from('email_accounts')
      .upsert({
        id,
        user_id,
        email,
        name: name || email,
        type: type || 'smtp',
        host,
        port,
        username,
        secure,
        smtp_secure: secure, // Assuming smtp_secure is the same as secure for simplicity
        is_active: is_active !== undefined ? is_active : true,
        is_default: is_default !== undefined ? is_default : false,
        status: status || 'active',
        last_checked: last_checked || null,
        domain_verified: domain_verified !== undefined ? domain_verified : false,
        smtp_password_encrypted: encryptedPassword,
        created_at: new Date().toISOString(), // Assuming created_at/updated_at are handled by DB, but including for upsert
        updated_at: new Date().toISOString()
      })
      .select()
      .single(); // Assuming id is provided for update, or upsert returns the single new row

    if (error) {
      console.error('Supabase upsert error:', error);
      return res.status(500).json({ success: false, message: error.message });
    }
    res.json({ success: true, message: 'Account saved', account: data });
  } catch (error) {
    console.error('Backend save email account error:', error);
    res.status(500).json({ success: false, message: 'Failed to save email account' });
  }
});

// Test SMTP connection using encrypted password
app.post('/api/test-smtp', async (req, res) => {
  const { id, user_id, host, port, username, secure } = req.body; // Allow passing partial data for new accounts

  let account;
  let smtpPass;

  if (id) {
    // Fetch existing account by ID
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
  } else if (host && port && username && req.body.smtpPass !== undefined) {
    // Use provided data for testing a *new* account before saving
    account = { host, port, username, secure };
    smtpPass = req.body.smtpPass; // Password sent in the request for *new* account test
  } else {
    return res.status(400).json({ success: false, message: 'Invalid request data for test connection' });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: account.host,
      port: account.port,
      secure: account.secure,
      auth: { user: account.username, pass: smtpPass }
    });
    await transporter.verify();
    res.json({ success: true, message: 'Connection successful' });
  } catch (error) {
    console.error('SMTP connection test failed:', error);
    res.json({ success: false, message: error.message });
  }
});

// Send test email using encrypted password
app.post('/api/send-test-email', async (req, res) => {
  const { id, recipient } = req.body;

  if (!id) return res.status(400).json({ success: false, message: 'Missing account id' });
  if (!recipient) return res.status(400).json({ success: false, message: 'Missing recipient email' });

  const { data: account, error } = await supabase
    .from('email_accounts')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !account) return res.status(404).json({ success: false, message: 'Account not found' });

  try {
    const smtpPass = decrypt(account.smtp_password_encrypted);
    const transporter = nodemailer.createTransport({
      host: account.host,
      port: account.port,
      secure: account.secure,
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
    console.error('Error sending test email:', error);
    res.json({ success: false, message: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
}); 