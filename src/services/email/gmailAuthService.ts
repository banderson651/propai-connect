import { supabase } from '@/lib/supabase';

const API_URL = import.meta.env.VITE_API_URL ?? (import.meta.env.DEV ? 'http://localhost:5000' : undefined);
const GMAIL_CLIENT_ID = import.meta.env.VITE_GMAIL_CLIENT_ID;
const defaultRedirect = typeof window !== 'undefined' ? `${window.location.origin}/api/auth/gmail/callback` : undefined;
const GMAIL_REDIRECT_URI = import.meta.env.VITE_GMAIL_REDIRECT_URI ?? defaultRedirect;

if (!API_URL) {
  throw new Error('Missing VITE_API_URL environment variable for Gmail auth requests');
}

if (!GMAIL_CLIENT_ID) {
  throw new Error('Missing VITE_GMAIL_CLIENT_ID environment variable');
}

if (!GMAIL_REDIRECT_URI) {
  throw new Error('Missing VITE_GMAIL_REDIRECT_URI environment variable');
}

const GMAIL_OAUTH_CONFIG = {
  clientId: GMAIL_CLIENT_ID,
  redirectUri: GMAIL_REDIRECT_URI,
  scopes: [
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/gmail.send',
    'https://www.googleapis.com/auth/gmail.modify'
  ]
};

const buildAuthHeaders = async () => {
  const { data, error } = await supabase.auth.getSession();
  if (error || !data.session?.access_token) {
    throw new Error('User not authenticated');
  }

  return {
    Authorization: `Bearer ${data.session.access_token}`,
    'Content-Type': 'application/json',
  } as const;
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
      const response = await fetch(`${API_URL}/api/gmail/oauth/token`, {
        method: 'POST',
        headers: await buildAuthHeaders(),
        body: JSON.stringify({ code }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to exchange Gmail authorization code');
      }

      return {
        success: true,
        account: {
          email: result.account.email,
          accessToken: result.account.accessToken,
          refreshToken: result.account.refreshToken,
          expiresAt: new Date(result.account.expiresAt),
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
      const response = await fetch(`${API_URL}/api/gmail/oauth/refresh`, {
        method: 'POST',
        headers: await buildAuthHeaders(),
        body: JSON.stringify({ refreshToken }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to refresh Gmail token');
      }

      return {
        success: true,
        accessToken: result.accessToken,
        expiresAt: new Date(result.expiresAt),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to refresh token',
      };
    }
  }
} 
