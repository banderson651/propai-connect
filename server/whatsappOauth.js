import express from 'express';
import axios from 'axios';

const router = express.Router();

// Redirect user to Facebook OAuth for WhatsApp Business
router.get('/auth', (req, res) => {
  const clientId = process.env.FB_APP_ID;
  const redirectUri = process.env.FB_REDIRECT_URI;
  const scopes = [
    'whatsapp_business_management',
    'whatsapp_business_messaging',
    'business_management',
    'pages_show_list',
    'pages_messaging',
    'public_profile',
    'email',
  ];
  const authUrl = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${clientId}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&scope=${scopes.join(',')}` +
    `&response_type=code`;
  res.redirect(authUrl);
});

// Facebook OAuth callback
router.get('/callback', async (req, res) => {
  const code = req.query.code;
  const clientId = process.env.FB_APP_ID;
  const clientSecret = process.env.FB_APP_SECRET;
  const redirectUri = process.env.FB_REDIRECT_URI;

  if (!code) {
    return res.status(400).send('Missing code');
  }

  try {
    // Exchange code for access token
    const tokenRes = await axios.get('https://graph.facebook.com/v19.0/oauth/access_token', {
      params: {
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        code,
      },
    });
    const accessToken = tokenRes.data.access_token;

    // Optionally, get user info, business accounts, etc.
    // const userRes = await axios.get('https://graph.facebook.com/v19.0/me', {
    //   params: { access_token: accessToken },
    // });

    // For demo, just return the access token
    res.send(`<h2>WhatsApp Business Manager Connected!</h2><p>Access Token: <code>${accessToken}</code></p>`);
  } catch (error) {
    res.status(500).send('OAuth Error: ' + (error.response?.data?.error?.message || error.message));
  }
});

export default router;
