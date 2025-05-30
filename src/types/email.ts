import { Contact } from './contact'; // Assuming Contact type is defined in contact.ts

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
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  isPrebuilt: boolean;
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
  status: 'draft' | 'sending' | 'sent' | 'cancelled';
  sentAt: string | null;
  stats: CampaignStats;
}

export interface ContactList {
  id: string;
  name: string;
  contacts: Contact[];
}

// Placeholder if Contact is not defined elsewhere
// export interface Contact {
//   id: string;
//   name: string;
//   email: string;
//   // Add other contact fields as needed
// }