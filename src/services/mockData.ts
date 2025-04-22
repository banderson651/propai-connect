
import { Contact, Interaction, ContactTag } from '@/types/contact';
import { v4 as uuidv4 } from 'uuid';

// Mock contacts data
export const mockContacts: Contact[] = [
  {
    id: uuidv4(),
    name: 'John Smith',
    email: 'john.smith@example.com',
    phone: '(555) 123-4567',
    address: '123 Main St, Anytown, CA 90210',
    tags: ['buyer', 'first-time-buyer'],
    notes: 'Looking for a 3-bedroom house in the suburbs.',
    createdAt: new Date(2023, 5, 15).toISOString(),
    updatedAt: new Date(2023, 6, 2).toISOString(),
  },
  {
    id: uuidv4(),
    name: 'Sarah Johnson',
    email: 'sarah.j@example.com',
    phone: '(555) 987-6543',
    address: '456 Oak Ave, Somewhere, CA 94123',
    tags: ['seller', 'luxury'],
    notes: 'Selling a luxury condo downtown.',
    createdAt: new Date(2023, 4, 20).toISOString(),
    updatedAt: new Date(2023, 5, 25).toISOString(),
  },
  {
    id: uuidv4(),
    name: 'Michael Chen',
    email: 'mchen@example.com',
    phone: '(555) 555-1212',
    tags: ['investor', 'commercial'],
    notes: 'Looking for commercial properties to invest in.',
    createdAt: new Date(2023, 3, 10).toISOString(),
    updatedAt: new Date(2023, 3, 10).toISOString(),
  },
  {
    id: uuidv4(),
    name: 'Jessica Williams',
    email: 'jwilliams@example.com',
    phone: '(555) 888-9999',
    address: '789 Pine St, Elsewhere, CA 92345',
    tags: ['buyer', 'residential', 'hot-lead'],
    notes: 'Pre-approved for $750k mortgage.',
    createdAt: new Date(2023, 2, 5).toISOString(),
    updatedAt: new Date(2023, 6, 15).toISOString(),
  },
  {
    id: uuidv4(),
    name: 'Robert Davis',
    email: 'rdavis@example.com',
    phone: '(555) 777-3333',
    tags: ['agent', 'partner'],
    notes: 'Partner agent with ABC Realty.',
    createdAt: new Date(2023, 1, 12).toISOString(),
    updatedAt: new Date(2023, 1, 12).toISOString(),
  },
];

// Mock interactions data
export const mockInteractions: Interaction[] = [
  {
    id: uuidv4(),
    contactId: mockContacts[0].id,
    type: 'call',
    date: new Date(2023, 6, 2).toISOString(),
    content: 'Discussed property requirements and budget.',
    createdAt: new Date(2023, 6, 2).toISOString(),
    updatedAt: new Date(2023, 6, 2).toISOString(),
  },
  {
    id: uuidv4(),
    contactId: mockContacts[0].id,
    type: 'email',
    date: new Date(2023, 6, 5).toISOString(),
    subject: 'Property Listings',
    content: 'Sent list of properties matching their criteria.',
    createdAt: new Date(2023, 6, 5).toISOString(),
    updatedAt: new Date(2023, 6, 5).toISOString(),
  },
  {
    id: uuidv4(),
    contactId: mockContacts[1].id,
    type: 'meeting',
    date: new Date(2023, 5, 25).toISOString(),
    content: 'Met at property for initial assessment.',
    createdAt: new Date(2023, 5, 25).toISOString(),
    updatedAt: new Date(2023, 5, 25).toISOString(),
  },
  {
    id: uuidv4(),
    contactId: mockContacts[3].id,
    type: 'call',
    date: new Date(2023, 6, 15).toISOString(),
    content: 'Scheduled viewing for 3 properties this weekend.',
    createdAt: new Date(2023, 6, 15).toISOString(),
    updatedAt: new Date(2023, 6, 15).toISOString(),
  },
  {
    id: uuidv4(),
    contactId: mockContacts[3].id,
    type: 'note',
    date: new Date(2023, 6, 18).toISOString(),
    content: 'Very interested in the lakefront property. Following up next week.',
    createdAt: new Date(2023, 6, 18).toISOString(),
    updatedAt: new Date(2023, 6, 18).toISOString(),
  },
];

// Helper functions for mock data CRUD operations
export const getContacts = (): Contact[] => {
  const savedContacts = localStorage.getItem('contacts');
  return savedContacts ? JSON.parse(savedContacts) : mockContacts;
};

export const getContactById = (id: string): Contact | undefined => {
  const contacts = getContacts();
  return contacts.find(contact => contact.id === id);
};

export const saveContact = (contact: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>): Contact => {
  const contacts = getContacts();
  const now = new Date().toISOString();
  
  const newContact: Contact = {
    ...contact,
    id: uuidv4(),
    createdAt: now,
    updatedAt: now
  };
  
  contacts.push(newContact);
  localStorage.setItem('contacts', JSON.stringify(contacts));
  return newContact;
};

export const updateContact = (id: string, updates: Partial<Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>>): Contact | null => {
  const contacts = getContacts();
  const index = contacts.findIndex(contact => contact.id === id);
  
  if (index === -1) return null;
  
  const updatedContact = {
    ...contacts[index],
    ...updates,
    updatedAt: new Date().toISOString()
  };
  
  contacts[index] = updatedContact;
  localStorage.setItem('contacts', JSON.stringify(contacts));
  return updatedContact;
};

export const deleteContact = (id: string): boolean => {
  const contacts = getContacts();
  const filteredContacts = contacts.filter(contact => contact.id !== id);
  
  if (filteredContacts.length === contacts.length) return false;
  
  localStorage.setItem('contacts', JSON.stringify(filteredContacts));
  return true;
};

// Interactions CRUD
export const getInteractions = (): Interaction[] => {
  const savedInteractions = localStorage.getItem('interactions');
  return savedInteractions ? JSON.parse(savedInteractions) : mockInteractions;
};

export const getInteractionsByContactId = (contactId: string): Interaction[] => {
  const interactions = getInteractions();
  return interactions.filter(interaction => interaction.contactId === contactId);
};

export const saveInteraction = (interaction: Omit<Interaction, 'id' | 'createdAt' | 'updatedAt'>): Interaction => {
  const interactions = getInteractions();
  const now = new Date().toISOString();
  
  const newInteraction: Interaction = {
    ...interaction,
    id: uuidv4(),
    createdAt: now,
    updatedAt: now
  };
  
  interactions.push(newInteraction);
  localStorage.setItem('interactions', JSON.stringify(interactions));
  return newInteraction;
};

// NLP auto-tagging (simplified mock implementation)
export const analyzeTextForTags = (text: string): ContactTag[] => {
  const tags: ContactTag[] = [];
  
  // Very simplified NLP analysis - in a real app, this would use an actual NLP service
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes('buy') || lowerText.includes('purchase') || lowerText.includes('looking for')) {
    tags.push('buyer');
  }
  
  if (lowerText.includes('sell') || lowerText.includes('selling')) {
    tags.push('seller');
  }
  
  if (lowerText.includes('first time') || lowerText.includes('first home')) {
    tags.push('first-time-buyer');
  }
  
  if (lowerText.includes('luxury') || lowerText.includes('high-end') || lowerText.includes('premium')) {
    tags.push('luxury');
  }
  
  if (lowerText.includes('commercial') || lowerText.includes('business') || lowerText.includes('office')) {
    tags.push('commercial');
  }
  
  if (lowerText.includes('house') || lowerText.includes('condo') || lowerText.includes('apartment')) {
    tags.push('residential');
  }
  
  if (lowerText.includes('invest') || lowerText.includes('roi') || lowerText.includes('portfolio')) {
    tags.push('investor');
  }
  
  if (lowerText.includes('urgent') || lowerText.includes('asap') || lowerText.includes('immediately')) {
    tags.push('hot-lead');
  }
  
  return tags;
};
