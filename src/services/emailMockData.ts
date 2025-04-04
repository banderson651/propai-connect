
import { EmailAccount, EmailTemplate, EmailCampaign } from '@/types/email';

export const mockAccounts: EmailAccount[] = [
  {
    id: '1',
    user_id: 'user-1',
    name: 'Work Email',
    email: 'work@example.com',
    type: 'IMAP',
    host: 'imap.example.com',
    port: 993,
    username: 'work@example.com',
    password: 'password123',
    secure: true,
    status: 'connected',
    last_checked: new Date().toISOString(),
    smtp_host: 'smtp.example.com',
    smtp_port: 587,
    smtp_username: 'work@example.com',
    smtp_password: 'password123',
    smtp_secure: true,
    display_name: 'Work Email',
    is_default: true,
    is_active: true,
    imap_host: 'imap.example.com',
    imap_port: 993,
    imap_username: 'work@example.com',
    imap_password: 'password123',
    imap_secure: true,
    last_sync_at: new Date().toISOString(),
    sync_frequency: 5,
    max_emails_per_sync: 100
  },
  {
    id: '2',
    user_id: 'user-1',
    name: 'Personal Email',
    email: 'personal@example.com',
    type: 'IMAP',
    host: 'imap.gmail.com',
    port: 993,
    username: 'personal@example.com',
    password: 'password456',
    secure: true,
    status: 'disconnected',
    last_checked: new Date().toISOString(),
    smtp_host: 'smtp.gmail.com',
    smtp_port: 587,
    smtp_username: 'personal@example.com',
    smtp_password: 'password456',
    smtp_secure: true,
    display_name: 'Personal Gmail',
    is_default: false,
    is_active: false,
    imap_host: 'imap.gmail.com',
    imap_port: 993,
    imap_username: 'personal@example.com',
    imap_password: 'password456',
    imap_secure: true,
    last_sync_at: new Date().toISOString(),
    sync_frequency: 10,
    max_emails_per_sync: 200
  },
  {
    id: '3',
    user_id: 'user-1',
    name: 'Business Email',
    email: 'business@example.com',
    type: 'POP3',
    host: 'pop.example.com',
    port: 995,
    username: 'business@example.com',
    password: 'password789',
    secure: true,
    status: 'error',
    last_checked: new Date().toISOString(),
    smtp_host: 'smtp.example.com',
    smtp_port: 587,
    smtp_username: 'business@example.com',
    smtp_password: 'password789',
    smtp_secure: true,
    display_name: 'Business Account',
    is_default: false,
    is_active: true,
    imap_host: 'pop.example.com',
    imap_port: 995,
    imap_username: 'business@example.com',
    imap_password: 'password789',
    imap_secure: true,
    last_sync_at: new Date().toISOString(),
    sync_frequency: 15,
    max_emails_per_sync: 150
  }
];

export const mockTemplates: EmailTemplate[] = [
  {
    id: '1',
    user_id: 'user-1',
    name: 'Welcome Template',
    subject: 'Welcome to our service',
    content: '<p>Dear {{name}},</p><p>Welcome to our service! We are excited to have you on board.</p>',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    variables: ['name'],
    body: '<p>Dear {{name}},</p><p>Welcome to our service! We are excited to have you on board.</p>'
  },
  {
    id: '2',
    user_id: 'user-1',
    name: 'Follow-up Template',
    subject: 'Following up on our conversation',
    content: '<p>Hello {{name}},</p><p>I wanted to follow up on our conversation about {{topic}}.</p>',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    variables: ['name', 'topic'],
    body: '<p>Hello {{name}},</p><p>I wanted to follow up on our conversation about {{topic}}.</p>'
  },
  {
    id: '3',
    user_id: 'user-1',
    name: 'Property Update',
    subject: 'Update on your property at {{address}}',
    content: '<p>Dear {{name}},</p><p>Here is an update regarding your property at {{address}}:</p><p>{{update_details}}</p>',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    variables: ['name', 'address', 'update_details'],
    body: '<p>Dear {{name}},</p><p>Here is an update regarding your property at {{address}}:</p><p>{{update_details}}</p>'
  }
];

// Fix missing campaign mock data
export const mockCampaigns: Campaign[] = [
  {
    id: '1',
    name: 'Welcome Campaign',
    status: 'completed',
    createdAt: new Date().toISOString(),
    stats: {
      sent: 120,
      delivered: 118,
      opened: 95,
      clicked: 67,
      openRate: 81,
      clickRate: 57
    }
  },
  {
    id: '2',
    name: 'Monthly Newsletter',
    status: 'running',
    createdAt: new Date().toISOString(),
    stats: {
      sent: 250,
      delivered: 245,
      opened: 180,
      clicked: 120,
      openRate: 73,
      clickRate: 49
    }
  }
];
