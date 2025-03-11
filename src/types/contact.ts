
export type ContactTag = 
  | 'buyer' 
  | 'seller' 
  | 'agent' 
  | 'investor' 
  | 'first-time-buyer'
  | 'luxury'
  | 'commercial'
  | 'residential'
  | 'hot-lead'
  | 'cold-lead'
  | 'warm-lead'
  | string;

export type InteractionType = 'call' | 'email' | 'meeting' | 'note' | 'other';

export interface Contact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  tags: ContactTag[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Interaction {
  id: string;
  contactId: string;
  type: InteractionType;
  date: string;
  content: string;
  subject?: string;
  createdAt: string;
  updatedAt: string;
}
