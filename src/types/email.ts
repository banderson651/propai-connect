
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
  htmlBody?: string;
  textBody?: string | null;
  description?: string | null;
  placeholders?: string[];
  metadata?: Record<string, unknown>;
  isPrebuilt: boolean;
  createdAt?: string;
  updatedAt?: string;
  userId?: string;
  tags?: string[];
  content?: string; // For backward compatibility
}

export interface CampaignMetrics {
  queued: number;
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
  failed: number;
  unsubscribed: number;
}

export interface CampaignSendSettings {
  batchSize: number;
  intervalSeconds: number;
  hourlyCap: number | null;
  dailyCap: number | null;
}

export interface Campaign {
  id: string;
  name: string;
  subject: string;
  htmlBody: string;
  textBody?: string | null;
  emailAccountId: string;
  status: 'draft' | 'scheduled' | 'sending' | 'paused' | 'completed' | 'failed' | 'cancelled';
  scheduledAt: string | null;
  startedAt?: string | null;
  completedAt?: string | null;
  cancelledAt?: string | null;
  metrics: CampaignMetrics;
  totalRecipients: number;
  templateId?: string | null;
  fromName?: string | null;
  replyTo?: string | null;
  sendSettings: CampaignSendSettings;
  createdAt?: string;
  updatedAt?: string;
  metadata?: Record<string, unknown>;
}

export interface CampaignAnalytics {
  totals: {
    recipients: number;
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    bounced: number;
    failed: number;
    unsubscribed: number;
  };
  rates: {
    deliveryRate: number;
    openRate: number;
    clickRate: number;
    bounceRate: number;
    failureRate: number;
  };
  timeline: Array<{
    date: string;
    counts: Record<string, number>;
  }>;
}

export interface ContactList {
  id: string;
  name: string;
  contacts: Contact[];
}
