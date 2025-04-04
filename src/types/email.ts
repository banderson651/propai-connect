
export interface EmailAccount {
  id: string;
  user_id: string;
  name: string;
  email: string;
  type: EmailAccountType;
  host: string;
  port: number;
  username: string;
  password: string;
  secure: boolean;
  smtp_host: string;
  smtp_port: number;
  smtp_username: string;
  smtp_password: string;
  smtp_secure: boolean;
  status?: string;
  last_checked?: string;
  
  // Additional properties from the database schema
  display_name?: string;
  is_default?: boolean;
  is_active?: boolean;
  imap_host?: string;
  imap_port?: number;
  imap_username?: string;
  imap_password?: string;
  imap_secure?: boolean;
  last_sync_at?: string;
  sync_frequency?: number;
  max_emails_per_sync?: number;
}

export type EmailAccountType = 'IMAP' | 'POP3';

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

export interface EmailAccountCreate {
  name: string;
  email: string;
  type: EmailAccountType;
  host: string;
  port: number;
  username: string;
  password: string;
  secure: boolean;
  smtp_host: string;
  smtp_port: number;
  smtp_username: string;
  smtp_password: string;
  smtp_secure: boolean;
  
  // Additional fields
  display_name?: string;
  is_default?: boolean;
  is_active?: boolean;
  imap_host?: string;
  imap_port?: number;
  imap_username?: string;
  imap_password?: string;
  imap_secure?: boolean;
  sync_frequency?: number;
  max_emails_per_sync?: number;
}

export interface EmailAccountUpdate {
  name?: string;
  email?: string;
  type?: EmailAccountType;
  host?: string;
  port?: number;
  username?: string;
  password?: string;
  secure?: boolean;
  smtp_host?: string;
  smtp_port?: number;
  smtp_username?: string;
  smtp_password?: string;
  smtp_secure?: boolean;
  status?: string;
  last_checked?: string;
  
  // Additional fields
  display_name?: string;
  is_default?: boolean;
  is_active?: boolean;
  imap_host?: string;
  imap_port?: number;
  imap_username?: string;
  imap_password?: string;
  imap_secure?: boolean;
  last_sync_at?: string;
  sync_frequency?: number;
  max_emails_per_sync?: number;
}

export interface EmailCredentials {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

export interface SmtpCredentials {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

export interface Email {
  id: string;
  account_id: string;
  message_id: string;
  from: string;
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  text?: string;
  html?: string;
  attachments?: EmailAttachment[];
  sent_at?: string;
  received_at?: string;
  read: boolean;
  starred: boolean;
  labels: string[];
  folder: string;
  thread_id?: string;
  in_reply_to?: string;
  references?: string[];
}

export interface EmailAttachment {
  filename: string;
  content_type: string;
  size: number;
  content?: Buffer | string;
  url?: string;
}

export interface EmailDraft {
  id: string;
  account_id: string;
  from: string;
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  text?: string;
  html?: string;
  attachments?: EmailAttachment[];
  created_at: string;
  updated_at: string;
}

export interface EmailTemplate {
  id: string;
  user_id: string;
  name: string;
  subject: string;
  content: string;
  body?: string; // Added for backward compatibility
  created_at: string;
  updated_at: string;
  variables?: string[];
}

export interface EmailCampaign {
  id: string;
  user_id: string;
  name: string;
  subject: string;
  content: string;
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed';
  recipients: string[];
  scheduled_at?: string;
  sent_at?: string;
  created_at: string;
  updated_at: string;
  template_id?: string;
  account_id: string;
  statistics?: {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    bounced: number;
    complained: number;
  };
}

export interface EmailStats {
  total: number;
  unread: number;
  starred: number;
  sent: number;
  drafts: number;
  trash: number;
}

export interface EmailFolder {
  id: string;
  name: string;
  count: number;
  unread: number;
}

export interface EmailLabel {
  id: string;
  name: string;
  color: string;
  count: number;
}

// Add Campaign types to fix errors
export interface Campaign {
  id: string;
  name: string;
  status: CampaignStatus;
  createdAt: string;
  stats: {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    openRate: number;
    clickRate: number;
  };
}

export type CampaignStatus = 'draft' | 'scheduled' | 'running' | 'paused' | 'completed' | 'failed';
