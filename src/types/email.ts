export type EmailAccountType = 'imap' | 'pop3' | 'smtp' | 'gmail' | 'outlook';
export type EmailAccountStatus = 'active' | 'inactive' | 'error' | 'connected' | 'disconnected';

export interface EmailAccount {
  id: string;
  name: string;
  email: string;
  type: EmailAccountType;
  host?: string;
  port?: number;
  username?: string;
  password?: string;
  security?: 'none' | 'ssl' | 'tls';
  status: EmailAccountStatus;
  error_message?: string;
  last_sync_at?: string;
  is_default: boolean;
  is_active: boolean;
  oauth_token?: string;
  oauth_refresh_token?: string;
  token_expiry?: string;
  created_at: string;
  updated_at: string;
  
  // Additional fields needed by components
  display_name?: string;
  imap_host?: string;
  imap_port?: number;
  imap_username?: string;
  imap_password?: string;
  imap_secure?: boolean;
  smtp_host?: string;
  smtp_port?: number;
  smtp_username?: string;
  smtp_password?: string;
  smtp_secure?: boolean;
  secure?: boolean;
  sync_frequency?: number;
  max_emails_per_sync?: number;
  last_checked?: string;
  user_id?: string;
}

export interface EmailTestResult {
  success: boolean;
  message: string;
  details?: {
    type: string;
    host: string;
    port: number;
    error?: string;
  };
}

export interface EmailAccountCreate extends Omit<EmailAccount, 'id' | 'created_at' | 'updated_at' | 'status'> {
  status?: EmailAccountStatus;
}

export interface EmailAccountUpdate extends Partial<Omit<EmailAccount, 'id' | 'created_at' | 'updated_at'>> {}

export interface EmailCampaign {
  id: string;
  name: string;
  status: 'draft' | 'scheduled' | 'running' | 'paused' | 'completed' | 'failed' | 'sent';
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
  content?: string; // For backward compatibility
  user_id?: string; // For database queries
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
