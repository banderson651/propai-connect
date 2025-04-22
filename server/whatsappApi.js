import express from 'express';
import axios from 'axios';
import { createClient } from '@supabase/supabase-js';

const router = express.Router();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// --- Helper: Save WhatsApp message to Supabase ---
async function saveWhatsAppMessage(msg, direction = 'incoming') {
  try {
    const content = msg.text?.body || msg.button?.text || msg.interactive?.button_reply?.title || '';
    const contact_id = msg.from || null;
    const status = msg.status || null;
    await supabase.from('whatsapp_messages').insert({
      contact_id,
      content,
      direction,
      status,
      raw: msg,
    });
  } catch (error) {
    console.error('Failed to save WhatsApp message:', error);
  }
}

// Send WhatsApp message endpoint
router.post('/send', async (req, res) => {
  const { to, template, parameters } = req.body;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID; // Set this in your .env file

  if (!accessToken || !phoneNumberId) {
    return res.status(500).json({ error: 'WhatsApp API credentials not set' });
  }

  try {
    const url = `https://graph.facebook.com/v22.0/${phoneNumberId}/messages`;
    const data = {
      messaging_product: 'whatsapp',
      to,
      type: 'template',
      template: {
        name: template,
        language: { code: 'en_US' },
        ...(parameters && parameters.length > 0 ? { components: [ { type: 'body', parameters } ] } : {})
      }
    };

    const response = await axios.post(url, data, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    res.json({ success: true, data: response.data });
  } catch (error) {
    res.status(500).json({ error: error.response?.data || error.message });
  }
});

// Webhook endpoint for WhatsApp callbacks
router.post('/webhook', async (req, res) => {
  // Save incoming messages and status updates to the database
  try {
    const entry = req.body.entry?.[0];
    if (!entry || !entry.changes) return res.sendStatus(200);
    for (const change of entry.changes) {
      if (change.value?.messages) {
        for (const msg of change.value.messages) {
          // Save incoming message to DB
          await saveWhatsAppMessage(msg, 'incoming');
          console.log('Received WhatsApp message:', msg);
        }
      }
      if (change.value?.statuses) {
        for (const status of change.value.statuses) {
          // Save status update to DB
          // Example: await updateWhatsAppMessageStatus(status);
          console.log('Received WhatsApp status:', status);
        }
      }
    }
    res.sendStatus(200);
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.sendStatus(500);
  }
});

// Webhook verification endpoint (Facebook/WhatsApp requirement)
router.get('/webhook', (req, res) => {
  const verifyToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN;
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token && mode === 'subscribe' && token === verifyToken) {
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// --- WhatsApp Unified Inbox API ---

// Mock data for demonstration (replace with real DB/API integration)
const conversations = [
  {
    id: 'conv1',
    contactName: 'John Doe',
    contactAvatar: '',
    lastMessage: 'Hello, how can I help you?',
    unreadCount: 2,
    assignedTo: null,
  },
  {
    id: 'conv2',
    contactName: 'Jane Smith',
    contactAvatar: '',
    lastMessage: 'Thank you for the update!',
    unreadCount: 0,
    assignedTo: null,
  },
];

const messages = {
  conv1: [
    { id: 'msg1', sender: 'John Doe', content: 'Hello, how can I help you?', timestamp: '2025-04-20 10:00' },
    { id: 'msg2', sender: 'me', content: 'Hi John, I need info about property X.', timestamp: '2025-04-20 10:01' },
  ],
  conv2: [
    { id: 'msg3', sender: 'Jane Smith', content: 'Thank you for the update!', timestamp: '2025-04-19 15:30' },
    { id: 'msg4', sender: 'me', content: 'You are welcome!', timestamp: '2025-04-19 15:32' },
  ],
};

// Get all conversations
router.get('/conversations', (req, res) => {
  res.json(conversations);
});

// Get messages for a conversation
router.get('/messages/:conversationId', (req, res) => {
  const { conversationId } = req.params;
  res.json(messages[conversationId] || []);
});

// Send a message in a conversation
router.post('/messages/:conversationId', (req, res) => {
  const { conversationId } = req.params;
  const { content } = req.body;
  const msg = {
    id: `msg${Date.now()}`,
    sender: 'me',
    content,
    timestamp: new Date().toISOString(),
  };
  if (!messages[conversationId]) messages[conversationId] = [];
  messages[conversationId].push(msg);
  // Update last message in conversation
  const conv = conversations.find((c) => c.id === conversationId);
  if (conv) {
    conv.lastMessage = content;
    conv.unreadCount = 0;
  }
  res.json(msg);
});

// Assign chat to a user
router.post('/assign', (req, res) => {
  const { conversationId, userId } = req.body;
  const conv = conversations.find((c) => c.id === conversationId);
  if (conv) {
    conv.assignedTo = userId;
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Conversation not found' });
  }
});

// --- WhatsApp Template Management API ---
let templates = [
  { id: 'tmpl1', name: 'Welcome', content: 'Welcome to PropAI! How can we help you today?', status: 'approved' },
  { id: 'tmpl2', name: 'Property Alert', content: 'A new property is available. Check it out!', status: 'pending' },
];

// Get all templates
router.get('/templates', (req, res) => {
  res.json(templates);
});

// Create a template
router.post('/templates', (req, res) => {
  const { name, content } = req.body;
  const tmpl = { id: `tmpl${Date.now()}`, name, content, status: 'pending' };
  templates.push(tmpl);
  res.json(tmpl);
});

// Update a template
router.put('/templates/:id', (req, res) => {
  const { id } = req.params;
  const { content } = req.body;
  const tmpl = templates.find(t => t.id === id);
  if (tmpl) {
    tmpl.content = content;
    tmpl.status = 'pending';
    res.json(tmpl);
  } else {
    res.status(404).json({ error: 'Template not found' });
  }
});

// Delete a template
router.delete('/templates/:id', (req, res) => {
  const { id } = req.params;
  templates = templates.filter(t => t.id !== id);
  res.json({ success: true });
});

// --- WhatsApp Campaign Management API ---
let campaigns = [
  { id: 'camp1', name: 'April Update', message: 'Check out our new properties!', status: 'scheduled', scheduledAt: '2025-04-21T10:00' },
  { id: 'camp2', name: 'Welcome', message: 'Welcome to PropAI!', status: 'sent', scheduledAt: '2025-04-18T09:00' },
];

// Get all campaigns
router.get('/campaigns', (req, res) => {
  res.json(campaigns);
});

// Create a campaign
router.post('/campaigns', (req, res) => {
  const { name, message, scheduledAt } = req.body;
  const camp = { id: `camp${Date.now()}`, name, message, status: 'scheduled', scheduledAt };
  campaigns.push(camp);
  res.json(camp);
});

// Send a campaign now
router.post('/campaigns/send', (req, res) => {
  const { id } = req.body;
  const camp = campaigns.find(c => c.id === id);
  if (camp) {
    camp.status = 'sent';
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Campaign not found' });
  }
});

// --- WhatsApp Channel Management API ---
let channels = [
  {
    id: 'chan1',
    name: 'Vamkor Technol...',
    number: '917420915365',
    status: 'FLAGGED',
    qualityScore: 'RED',
    messageLimit: '1K',
    balance: '-1219189 INR',
    twoFA: true,
  },
];

// Get all channels
router.get('/channels', (req, res) => {
  res.json(channels);
});

// Add new channel
router.post('/channels', (req, res) => {
  const { name, number, status, qualityScore, messageLimit, balance, twoFA } = req.body;
  const channel = {
    id: `chan${Date.now()}`,
    name,
    number,
    status,
    qualityScore,
    messageLimit,
    balance,
    twoFA,
  };
  channels.push(channel);
  res.json(channel);
});

// Edit channel
router.put('/channels/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const channel = channels.find(c => c.id === id);
  if (channel) {
    Object.assign(channel, updates);
    res.json(channel);
  } else {
    res.status(404).json({ error: 'Channel not found' });
  }
});

// Delete channel
router.delete('/channels/:id', (req, res) => {
  const { id } = req.params;
  channels = channels.filter(c => c.id !== id);
  res.json({ success: true });
});

// Get channel stats
router.get('/channels/:id/stats', (req, res) => {
  // Mock stats
  res.json({
    sent: 123,
    delivered: 110,
    read: 98,
    failed: 5,
    balance: '-1219189 INR',
    status: 'FLAGGED',
    qualityScore: 'RED',
    messageLimit: '1K',
    twoFA: true,
  });
});

// --- WhatsApp Analytics API ---
router.get('/analytics', (req, res) => {
  // Mock analytics data
  res.json({
    sent: 234,
    delivered: 220,
    read: 200,
    failed: 12,
    responseTimeAvg: 42, // in seconds
    daily: [
      { date: '2025-04-14', sent: 30, delivered: 28, read: 25 },
      { date: '2025-04-15', sent: 45, delivered: 44, read: 40 },
      { date: '2025-04-16', sent: 50, delivered: 48, read: 45 },
      { date: '2025-04-17', sent: 60, delivered: 58, read: 55 },
      { date: '2025-04-18', sent: 49, delivered: 42, read: 35 },
    ],
  });
});

export default router;
