import { Contact } from './contact'; // Assuming Contact type is defined in contact.ts

export interface EmailAccount {
  id: string;
  email: string;
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPass: string;
  domainVerified: boolean;
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