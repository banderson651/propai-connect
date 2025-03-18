
export type EmailAccountType = 'IMAP' | 'POP3';

export type EmailConnectionStatus = 'connected' | 'disconnected' | 'error';

export interface EmailAccount {
  id: string;
  name: string;
  email: string;
  type: EmailAccountType;
  host: string;
  port: number;
  username: string;
  password: string; // Note: In a real app, this would be securely stored
  status: EmailConnectionStatus;
  lastChecked: string;
  secure?: boolean; // Added for secure connections
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

export interface EmailTestResult {
  success: boolean;
  message: string;
}
