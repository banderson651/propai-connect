import express from 'express';
import nodemailer from 'nodemailer';
import cors from 'cors';

const router = express.Router();

// Add/test account endpoint
router.post('/add-account', async (req, res) => {
  const { host, port, secure, username, password, from } = req.body;
  try {
    const transporter = nodemailer.createTransport({ host, port, secure, auth: { user: username, pass: password } });
    await transporter.verify();
    // In production: Save account to DB here
    res.json({ success: true, message: 'Connection successful. Account can be used for outgoing emails.' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Test connection endpoint
router.post('/test-account', async (req, res) => {
  const { host, port, secure, username, password } = req.body;
  try {
    const transporter = nodemailer.createTransport({ host, port, secure, auth: { user: username, pass: password } });
    await transporter.verify();
    res.json({ success: true, message: 'SMTP connection successful.' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Send test email endpoint
router.post('/send-test', async (req, res) => {
  const { host, port, secure, username, password, to, from } = req.body;
  try {
    const transporter = nodemailer.createTransport({ host, port, secure, auth: { user: username, pass: password } });
    await transporter.sendMail({
      from,
      to,
      subject: 'Test Email from CRM',
      text: 'This is a test email to verify your outgoing email setup.',
    });
    res.json({ success: true, message: 'Test email sent successfully.' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

export default router;
