
import { EmailAccount, EmailTemplate } from '@/types/email';

// Campaigns mock data
export const mockCampaigns: any[] = [
  {
    id: '1',
    name: 'Welcome Series',
    status: 'running',
    createdAt: '2024-02-01T00:00:00.000Z',
    stats: {
      sent: 500,
      delivered: 490,
      opened: 350,
      clicked: 175,
      openRate: 71,
      clickRate: 35
    }
  },
  {
    id: '2',
    name: 'Monthly Newsletter',
    status: 'draft',
    createdAt: '2024-02-15T00:00:00.000Z',
    stats: {
      sent: 0,
      delivered: 0,
      opened: 0,
      clicked: 0,
      openRate: 0,
      clickRate: 0
    }
  },
  {
    id: '3',
    name: 'Product Announcement',
    status: 'completed',
    createdAt: '2024-01-10T00:00:00.000Z',
    stats: {
      sent: 1000,
      delivered: 980,
      opened: 700,
      clicked: 450,
      openRate: 71,
      clickRate: 46
    }
  },
  {
    id: '4',
    name: 'Special Offer',
    status: 'paused',
    createdAt: '2024-01-25T00:00:00.000Z',
    stats: {
      sent: 250,
      delivered: 245,
      opened: 150,
      clicked: 80,
      openRate: 61,
      clickRate: 33
    }
  }
];

// Email accounts mock data
export const mockEmailAccounts: EmailAccount[] = [
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
    smtp_host: 'smtp.example.com',
    smtp_port: 587,
    smtp_username: 'work@example.com',
    smtp_password: 'password123',
    smtp_secure: true,
    status: 'connected',
    last_checked: '2024-02-20T10:30:00.000Z',
    display_name: 'Work Email Account',
    is_default: true,
    is_active: true,
    imap_host: 'imap.example.com',
    imap_port: 993,
    imap_username: 'work@example.com',
    imap_password: 'password123',
    imap_secure: true,
    last_sync_at: '2024-02-20T10:30:00.000Z',
    sync_frequency: 15,
    max_emails_per_sync: 100
  },
  {
    id: '2',
    user_id: 'user-1',
    name: 'Personal Email',
    email: 'personal@gmail.com',
    type: 'IMAP',
    host: 'imap.gmail.com',
    port: 993,
    username: 'personal@gmail.com',
    password: 'gmail-password',
    secure: true,
    smtp_host: 'smtp.gmail.com',
    smtp_port: 587,
    smtp_username: 'personal@gmail.com',
    smtp_password: 'gmail-password',
    smtp_secure: true,
    status: 'connected',
    last_checked: '2024-02-20T09:45:00.000Z',
    display_name: 'Personal Gmail',
    is_default: false,
    is_active: true,
    imap_host: 'imap.gmail.com',
    imap_port: 993,
    imap_username: 'personal@gmail.com',
    imap_password: 'gmail-password',
    imap_secure: true,
    last_sync_at: '2024-02-20T09:45:00.000Z',
    sync_frequency: 30,
    max_emails_per_sync: 50
  },
  {
    id: '3',
    user_id: 'user-1',
    name: 'Marketing Email',
    email: 'marketing@company.com',
    type: 'IMAP',
    host: 'imap.company.com',
    port: 993,
    username: 'marketing@company.com',
    password: 'marketing-password',
    secure: true,
    smtp_host: 'smtp.company.com',
    smtp_port: 587,
    smtp_username: 'marketing@company.com',
    smtp_password: 'marketing-password',
    smtp_secure: true,
    status: 'error',
    last_checked: '2024-02-19T15:20:00.000Z',
    display_name: 'Marketing Account',
    is_default: false,
    is_active: false,
    imap_host: 'imap.company.com',
    imap_port: 993,
    imap_username: 'marketing@company.com',
    imap_password: 'marketing-password',
    imap_secure: true,
    last_sync_at: '2024-02-19T15:20:00.000Z',
    sync_frequency: 60,
    max_emails_per_sync: 200
  }
];

// Email templates mock data
export const mockEmailTemplates: EmailTemplate[] = [
  {
    id: '1',
    user_id: 'user-1',
    name: 'Welcome Email',
    subject: 'Welcome to our platform!',
    content: '<p>Dear {{name}},</p><p>Welcome to our platform! We\'re excited to have you on board.</p><p>Best regards,<br>The Team</p>',
    created_at: '2024-01-15T00:00:00.000Z',
    updated_at: '2024-01-15T00:00:00.000Z',
    variables: ['name']
  },
  {
    id: '2',
    user_id: 'user-1',
    name: 'Monthly Newsletter',
    subject: 'Your Monthly Newsletter - {{month}}',
    content: '<h1>Newsletter - {{month}}</h1><p>Dear {{name}},</p><p>Here\'s what\'s new this month:</p><ul><li>Feature 1</li><li>Feature 2</li><li>Feature 3</li></ul><p>Regards,<br>The Newsletter Team</p>',
    created_at: '2024-01-20T00:00:00.000Z',
    updated_at: '2024-02-01T00:00:00.000Z',
    variables: ['name', 'month']
  },
  {
    id: '3',
    user_id: 'user-1',
    name: 'Password Reset',
    subject: 'Reset Your Password',
    content: '<p>Dear {{name}},</p><p>You requested a password reset. Click the link below to reset your password:</p><p><a href="{{resetLink}}">Reset Password</a></p><p>If you didn\'t request this, please ignore this email.</p><p>Regards,<br>Support Team</p>',
    created_at: '2024-01-25T00:00:00.000Z',
    updated_at: '2024-01-25T00:00:00.000Z',
    variables: ['name', 'resetLink']
  }
];

// Add the body property to email templates for backward compatibility
export const emailTemplatesWithBody = mockEmailTemplates.map(template => ({
  ...template,
  body: template.content
}));
