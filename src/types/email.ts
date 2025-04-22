export type EmailAccountType = 'gmail' | 'smtp';

export interface EmailAccount {
  id: string;
  name: string;
  email: string;
  type: EmailAccountType;
  host?: string;
  port?: number;
  username?: string;
  password?: string;
  smtp_secure?: boolean;
  is_default?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface EmailCampaign {
  id: string;
  name: string;
  subject: string;
  template_id: string;
  sender_id: string;
  contact_ids: string[];
  status: 'draft' | 'scheduled' | 'sent' | 'failed';
  scheduled_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  html: string;
  created_at?: string;
  updated_at?: string;
}
