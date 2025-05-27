import { supabase } from '@/lib/supabase';

const GMAIL_OAUTH_CONFIG = {
  clientId: '242794493271-madsh1jdt8cdm9tk8gk8v5fpr8em2jgl.apps.googleusercontent.com',
  clientSecret: import.meta.env.VITE_GMAIL_CLIENT_SECRET,
  redirectUri: `${import.meta.env.VITE_APP_URL}/api/auth/gmail/callback`,
  scopes: [
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/gmail.send',
    'https://www.googleapis.com/auth/gmail.modify'
  ]
};

export class GmailAuthService {
  private static instance: GmailAuthService;

  private constructor() {}

  public static getInstance(): GmailAuthService {
    if (!GmailAuthService.instance) {
      GmailAuthService.instance = new GmailAuthService();
    }
    return GmailAuthService.instance;
  }

  getAuthUrl(): string {
    const params = new URLSearchParams({
      client_id: GMAIL_OAUTH_CONFIG.clientId,
      redirect_uri: GMAIL_OAUTH_CONFIG.redirectUri,
      response_type: 'code',
      scope: GMAIL_OAUTH_CONFIG.scopes.join(' '),
      access_type: 'offline',
      prompt: 'consent'
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  async handleCallback(code: string): Promise<{
    success: boolean;
    error?: string;
    account?: {
      email: string;
      accessToken: string;
      refreshToken: string;
      expiresAt: Date;
    };
  }> {
    try {
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          code,
          client_id: GMAIL_OAUTH_CONFIG.clientId,
          client_secret: GMAIL_OAUTH_CONFIG.clientSecret,
          redirect_uri: GMAIL_OAUTH_CONFIG.redirectUri,
          grant_type: 'authorization_code',
        }),
      });

      if (!tokenResponse.ok) {
        throw new Error('Failed to get access token');
      }

      const tokenData = await tokenResponse.json();
      const { access_token, refresh_token, expires_in } = tokenData;

      // Get user's email address
      const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      });

      if (!userResponse.ok) {
        throw new Error('Failed to get user info');
      }

      const userData = await userResponse.json();
      const email = userData.email;

      return {
        success: true,
        account: {
          email,
          accessToken: access_token,
          refreshToken: refresh_token,
          expiresAt: new Date(Date.now() + expires_in * 1000),
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to authenticate with Gmail',
      };
    }
  }

  async refreshToken(refreshToken: string): Promise<{
    success: boolean;
    error?: string;
    accessToken?: string;
    expiresAt?: Date;
  }> {
    try {
      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: GMAIL_OAUTH_CONFIG.clientId,
          client_secret: GMAIL_OAUTH_CONFIG.clientSecret,
          refresh_token: refreshToken,
          grant_type: 'refresh_token',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to refresh token');
      }

      const data = await response.json();
      const { access_token, expires_in } = data;

      return {
        success: true,
        accessToken: access_token,
        expiresAt: new Date(Date.now() + expires_in * 1000),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to refresh token',
      };
    }
  }
} 