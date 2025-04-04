
import { EmailAccount, EmailTemplate, Campaign } from '@/types/email';

// Campaigns mock data
export const mockCampaigns: Campaign[] = [
  {
    id: '1',
    name: 'March Newsletter',
    status: 'completed',
    createdAt: '2023-03-01T08:00:00Z',
    startedAt: '2023-03-01T09:00:00Z',
    completedAt: '2023-03-01T09:15:00Z',
    emailAccountId: '1',
    templateId: '1',
    subject: 'March Newsletter for Real Estate',
    contactIds: ['1', '2', '3', '4'],
    sendingRate: 50,
    stats: {
      sent: 150,
      delivered: 145,
      opened: 98,
      clicked: 45,
      openRate: 67.6,
      clickRate: 31.0,
    }
  },
  {
    id: '2',
    name: 'New Listing Notification',
    status: 'running',
    createdAt: '2023-03-05T10:00:00Z',
    startedAt: '2023-03-05T10:30:00Z',
    emailAccountId: '1',
    templateId: '2',
    subject: 'New Properties Available in Your Area',
    contactIds: ['5', '6', '7'],
    sendingRate: 30,
    stats: {
      sent: 75,
      delivered: 73,
      opened: 40,
      clicked: 12,
      openRate: 54.8,
      clickRate: 16.4,
    }
  },
  {
    id: '3',
    name: 'Client Appreciation',
    status: 'scheduled',
    createdAt: '2023-03-07T14:00:00Z',
    emailAccountId: '2',
    templateId: '3',
    subject: 'Thank You for Your Business',
    contactIds: ['8', '9', '10', '11'],
    sendingRate: 60,
    stats: {
      sent: 0,
      delivered: 0,
      opened: 0,
      clicked: 0,
      openRate: 0,
      clickRate: 0,
    }
  },
  {
    id: '4',
    name: 'Spring Open House',
    status: 'draft',
    createdAt: '2023-03-10T11:00:00Z',
    emailAccountId: '2',
    templateId: '4',
    subject: 'You\'re Invited: Spring Open House Event',
    contactIds: ['12', '13', '14', '15', '16'],
    sendingRate: 40,
    stats: {
      sent: 0,
      delivered: 0,
      opened: 0,
      clicked: 0,
      openRate: 0,
      clickRate: 0,
    }
  }
];

// For demonstration purposes, we can add mock data for email accounts and templates
export const mockEmailAccounts: EmailAccount[] = [
  {
    id: '1',
    name: 'Work Email',
    email: 'john.doe@company.com',
    type: 'imap',
    host: 'imap.company.com',
    port: 993,
    username: 'john.doe',
    password: 'password123',
    security: 'ssl',
    status: 'active',
    is_default: true,
    is_active: true,
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
    display_name: 'John Doe',
    imap_host: 'imap.company.com',
    imap_port: 993,
    imap_username: 'john.doe',
    imap_password: 'password123',
    imap_secure: true,
    smtp_host: 'smtp.company.com',
    smtp_port: 587,
    smtp_username: 'john.doe',
    smtp_password: 'password123',
    smtp_secure: true,
    sync_frequency: 5,
    max_emails_per_sync: 100,
    last_sync_at: '2023-03-01T10:00:00Z'
  },
  {
    id: '2',
    name: 'Personal Gmail',
    email: 'john.personal@gmail.com',
    type: 'gmail',
    status: 'active',
    is_default: false,
    is_active: true,
    created_at: '2023-02-01T00:00:00Z',
    updated_at: '2023-02-01T00:00:00Z',
    display_name: 'John Personal',
    smtp_host: 'smtp.gmail.com',
    smtp_port: 587,
    smtp_username: 'john.personal@gmail.com',
    smtp_password: 'app_password',
    smtp_secure: true,
    sync_frequency: 15,
    max_emails_per_sync: 200,
    last_sync_at: '2023-03-02T10:00:00Z'
  },
  {
    id: '3',
    name: 'Business Outlook',
    email: 'john.business@outlook.com',
    type: 'outlook',
    status: 'inactive',
    is_default: false,
    is_active: false,
    created_at: '2023-03-01T00:00:00Z',
    updated_at: '2023-03-01T00:00:00Z',
    display_name: 'John Business',
    sync_frequency: 30,
    max_emails_per_sync: 50
  }
];

// Mock email templates
export const mockEmailTemplates: EmailTemplate[] = [
  {
    id: '1',
    name: 'Welcome Template',
    subject: 'Welcome to Our Service',
    body: '<p>Welcome to our service! We\'re glad to have you on board.</p>',
    content: '<p>Welcome to our service! We\'re glad to have you on board.</p>',
    created_at: '2023-01-15T00:00:00Z',
    updated_at: '2023-01-15T00:00:00Z'
  },
  {
    id: '2',
    name: 'Property Listing',
    subject: 'New Property Listing: {{propertyName}}',
    body: '<p>Check out this new listing: {{propertyDetails}}</p>',
    content: '<p>Check out this new listing: {{propertyDetails}}</p>',
    created_at: '2023-02-10T00:00:00Z',
    updated_at: '2023-02-10T00:00:00Z'
  },
  {
    id: '3',
    name: 'Follow-up',
    subject: 'Following Up on Your Interest',
    body: '<p>Just following up on your recent interest in our services.</p>',
    content: '<p>Just following up on your recent interest in our services.</p>',
    created_at: '2023-02-20T00:00:00Z',
    updated_at: '2023-02-20T00:00:00Z'
  }
];

// Helper function for real implementations
export const getTemplate = (id: string) => {
  return mockEmailTemplates.find(template => template.id === id);
};
