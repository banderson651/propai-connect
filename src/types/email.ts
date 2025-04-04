
export interface EmailAccount {
  id: string;
  name: string;
  email: string;
  type: 'imap' | 'pop3' | 'smtp' | 'gmail' | 'outlook';
  host?: string;
  port?: number;
  username?: string;
  password?: string;
  security?: 'none' | 'ssl' | 'tls';
  status: 'active' | 'inactive' | 'error';
  error_message?: string;
  last_sync_at?: string;
  is_default: boolean;
  is_active: boolean;
  oauth_token?: string;
  oauth_refresh_token?: string;
  token_expiry?: string;
  created_at: string;
  updated_at: string;
}

export interface EmailCampaign {
  id: string;
  name: string;
  status: Campaign['status'];
  emailAccountId: string;
  templateId: string;
  subject: string;
  contactIds: string[];
  sendingRate: number;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
}

export interface Campaign extends EmailCampaign {
  stats: {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    openRate: number;
    clickRate: number;
  };
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  created_at: string;
  updated_at: string;
}

export interface EmailMessage {
  id: string;
  account_id: string;
  subject: string;
  from: string;
  to: string;
  date: string;
  text: string;
  html?: string;
  read: boolean;
  flagged: boolean;
  message_id?: string;
  created_at: string;
}

export interface EmailLog {
  id: string;
  campaign_id?: string;
  email_account_id: string;
  recipient: string;
  subject: string;
  status: 'pending' | 'sent' | 'failed' | 'delivered' | 'opened' | 'clicked';
  error_message?: string;
  created_at: string;
  updated_at: string;
}
