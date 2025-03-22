export type EmailAccountType = 'IMAP' | 'POP3';

export type EmailConnectionStatus = 'connected' | 'disconnected' | 'error';

export interface EmailAccount {
  id: string;
  user_id: string;
  email: string;
  display_name?: string;
  created_at: string;
  updated_at: string;
  
  // IMAP Settings
  imap_host: string;
  imap_port: number;
  imap_username: string;
  imap_password: string;
  imap_secure: boolean;
  
  // SMTP Settings
  smtp_host: string;
  smtp_port: number;
  smtp_username: string;
  smtp_password: string;
  smtp_secure: boolean;
  
  // Additional Settings
  is_default: boolean;
  is_active: boolean;
  last_sync_at?: string;
  sync_frequency: number;
  max_emails_per_sync: number;
}

export interface EmailAccountCreate {
  email: string;
  display_name?: string;
  
  // IMAP Settings
  imap_host: string;
  imap_port: number;
  imap_username: string;
  imap_password: string;
  imap_secure: boolean;
  
  // SMTP Settings
  smtp_host: string;
  smtp_port: number;
  smtp_username: string;
  smtp_password: string;
  smtp_secure: boolean;
  
  // Additional Settings
  is_default?: boolean;
  is_active?: boolean;
  sync_frequency?: number;
  max_emails_per_sync?: number;
}

export interface EmailAccountUpdate {
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
  is_default?: boolean;
  is_active?: boolean;
  sync_frequency?: number;
  max_emails_per_sync?: number;
}

export interface EmailTestConfig {
  type: 'IMAP' | 'SMTP';
  host: string;
  port: number;
  username: string;
  password: string;
  secure: boolean;
}

export interface EmailTestResult {
  success: boolean;
  message: string;
  details?: {
    type: 'IMAP' | 'SMTP';
    host: string;
    port: number;
    error?: string;
  };
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  createdAt: string;
  updatedAt: string;
}

export type CampaignStatus = 'draft' | 'scheduled' | 'running' | 'paused' | 'completed' | 'failed';

export interface CampaignStats {
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
  failed: number;
  openRate: number;
  clickRate: number;
}

export interface Campaign {
  id: string;
  name: string;
  status: CampaignStatus;
  emailAccountId: string;
  templateId: string;
  contactIds: string[];
  sendingRate: number; // emails per hour
  scheduled: string | null;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  stats: CampaignStats;
}
