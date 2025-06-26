
export interface Contact {
  id: string;
  name: string;
  email: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export type EmailAccountStatus = 'connected' | 'error' | 'disconnected';
export type EmailAccountType = 'smtp' | 'imap' | 'pop3';

export interface EmailAccount {
  id: string;
  user_id: string;
  email: string;
  name: string;
  type: string;
  host: string;
  port: number;
  username: string;
  secure: boolean;
  smtp_secure: boolean;
  is_active: boolean;
  is_default: boolean;
  status: string | null;
  last_checked: string | null;
  created_at: string;
  updated_at: string;
  domain_verified: boolean;
  // Optional fields for extended functionality
  display_name?: string;
  imap_host?: string;
  imap_port?: number;
  imap_username?: string;
  imap_secure?: boolean;
  smtp_host?: string;
  smtp_port?: number;
  smtp_username?: string;
  smtp_password?: string;
  password?: string;
  sync_frequency?: number;
  max_emails_per_sync?: number;
  last_sync_at?: string;
  // Additional fields for mock data compatibility
  provider?: string;
  userId?: string;
  createdAt?: string;
  lastSyncAt?: string;
  errorMessage?: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  isPrebuilt: boolean;
  createdAt?: string;
  updatedAt?: string;
  userId?: string;
  tags?: string[];
  content?: string; // For backward compatibility
}

export interface CampaignStats {
  sent: number;
  opened: number;
  clicked: number;
  bounced: number;
}

export interface Campaign {
  id: string;
  name: string;
  subject: string;
  body: string;
  senderEmailAccountId: string;
  contactListId: string;
  status: 'draft' | 'sending' | 'sent' | 'cancelled' | 'failed';
  sentAt: string | null;
  stats: CampaignStats;
  // Additional fields for mock data compatibility
  templateId?: string;
  scheduledDate?: string | null;
  sentDate?: string | null;
  createdAt?: string;
  updatedAt?: string;
  userId?: string;
  recipientCount?: number;
  openRate?: number;
  clickRate?: number;
  tags?: string[];
  accountId?: string;
}

export interface ContactList {
  id: string;
  name: string;
  contacts: Contact[];
}
