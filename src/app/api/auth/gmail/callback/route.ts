import { NextResponse } from 'next/server';
import { GmailAuthService } from '@/services/email/gmailAuthService';
import { EmailAccountService } from '@/services/email/accountService';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/email?error=${encodeURIComponent(error)}`
      );
    }

    if (!code) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/email?error=No authorization code provided`
      );
    }

    const gmailAuth = GmailAuthService.getInstance();
    const result = await gmailAuth.handleCallback(code);

    if (!result.success || !result.account) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/email?error=${encodeURIComponent(result.error || 'Authentication failed')}`
      );
    }

    const { email, accessToken, refreshToken, expiresAt } = result.account;

    // Create Gmail account in database
    const emailService = EmailAccountService.getInstance();
    const supabase = createClient();

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('User not authenticated');
    }

    const account = await emailService.createAccount({
      user_id: user.id,
      email,
      display_name: email.split('@')[0],
      is_default: false,
      is_active: true,
      sync_frequency: 5,
      max_emails_per_sync: 100,
      // Gmail-specific settings
      imap_host: 'imap.gmail.com',
      imap_port: 993,
      imap_username: email,
      imap_password: accessToken,
      imap_secure: true,
      smtp_host: 'smtp.gmail.com',
      smtp_port: 587,
      smtp_username: email,
      smtp_password: accessToken,
      smtp_secure: true,
      // OAuth tokens
      oauth_provider: 'gmail',
      oauth_access_token: accessToken,
      oauth_refresh_token: refreshToken,
      oauth_expires_at: expiresAt.toISOString(),
    });

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/email?success=Gmail account added successfully`
    );
  } catch (error) {
    console.error('Gmail callback error:', error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/email?error=${encodeURIComponent(
        error instanceof Error ? error.message : 'Failed to add Gmail account'
      )}`
    );
  }
} 