
import { EmailAccount, EmailTemplate, Campaign } from '@/types/email';
import { v4 as uuidv4 } from 'uuid';

// Mock Email Accounts
export const mockEmailAccounts: EmailAccount[] = [
  {
    id: uuidv4(),
    user_id: uuidv4(), // Adding the required user_id field
    name: 'Work Email',
    email: 'john.doe@propai.com',
    type: 'IMAP',
    host: 'imap.propai.com',
    port: 993,
    username: 'john.doe@propai.com',
    password: '**********',
    status: 'connected',
    lastChecked: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    user_id: uuidv4(), // Adding the required user_id field
    name: 'Marketing Email',
    email: 'marketing@propai.com',
    type: 'IMAP',
    host: 'imap.propai.com',
    port: 993,
    username: 'marketing@propai.com',
    password: '**********',
    status: 'connected',
    lastChecked: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    user_id: uuidv4(), // Adding the required user_id field
    name: 'Gmail Account',
    email: 'johndoe.personal@gmail.com',
    type: 'IMAP',
    host: 'imap.gmail.com',
    port: 993,
    username: 'johndoe.personal@gmail.com',
    password: '**********',
    status: 'error',
    lastChecked: new Date().toISOString(),
  },
];

// Mock Email Templates
export const mockEmailTemplates: EmailTemplate[] = [
  {
    id: uuidv4(),
    name: 'Welcome Email',
    subject: 'Welcome to PropAI!',
    body: `
      <p>Hello {{firstName}},</p>
      <p>Thank you for your interest in our real estate services. At PropAI, we're dedicated to helping you find the perfect property that meets your needs.</p>
      <p>Would you like to schedule a call to discuss your property requirements?</p>
      <p>Best regards,<br>{{agentName}}<br>PropAI Real Estate</p>
    `,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: uuidv4(),
    name: 'New Property Alert',
    subject: 'New Properties Matching Your Criteria',
    body: `
      <p>Hello {{firstName}},</p>
      <p>We've found {{propertyCount}} new properties that match your search criteria:</p>
      <ul>
        <li>{{property1}}</li>
        <li>{{property2}}</li>
        <li>{{property3}}</li>
      </ul>
      <p>Click <a href="{{viewAllLink}}">here</a> to view all matching properties.</p>
      <p>Best regards,<br>{{agentName}}<br>PropAI Real Estate</p>
    `,
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: uuidv4(),
    name: 'Follow-up Email',
    subject: 'Following Up: Your Real Estate Journey',
    body: `
      <p>Hello {{firstName}},</p>
      <p>I wanted to follow up on our previous conversation about your property interests. Are you still looking for a {{propertyType}} in the {{location}} area?</p>
      <p>I have some new options that might interest you. Would you like me to send you more details?</p>
      <p>Best regards,<br>{{agentName}}<br>PropAI Real Estate</p>
    `,
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// Mock Campaigns
export const mockCampaigns: Campaign[] = [
  {
    id: uuidv4(),
    name: 'Welcome Sequence for Q2 Leads',
    status: 'running',
    emailAccountId: mockEmailAccounts[0].id,
    templateId: mockEmailTemplates[0].id,
    contactIds: ['id1', 'id2', 'id3'], // Will link to real IDs in a full implementation
    sendingRate: 20, // 20 emails per hour
    scheduled: null,
    startedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    completedAt: null,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    stats: {
      sent: 87,
      delivered: 85,
      opened: 42,
      clicked: 15,
      bounced: 2,
      failed: 0,
      openRate: 49.4,
      clickRate: 17.6,
    },
  },
  {
    id: uuidv4(),
    name: 'April Property Updates',
    status: 'completed',
    emailAccountId: mockEmailAccounts[1].id,
    templateId: mockEmailTemplates[1].id,
    contactIds: ['id4', 'id5', 'id6'], // Will link to real IDs in a full implementation
    sendingRate: 30, // 30 emails per hour
    scheduled: null,
    startedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    completedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    stats: {
      sent: 150,
      delivered: 147,
      opened: 98,
      clicked: 45,
      bounced: 2,
      failed: 1,
      openRate: 66.7,
      clickRate: 30.6,
    },
  },
  {
    id: uuidv4(),
    name: 'Follow-up with Interested Buyers',
    status: 'draft',
    emailAccountId: mockEmailAccounts[0].id,
    templateId: mockEmailTemplates[2].id,
    contactIds: ['id7', 'id8'], // Will link to real IDs in a full implementation
    sendingRate: 10, // 10 emails per hour
    scheduled: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    startedAt: null,
    completedAt: null,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    stats: {
      sent: 0,
      delivered: 0,
      opened: 0,
      clicked: 0,
      bounced: 0,
      failed: 0,
      openRate: 0,
      clickRate: 0,
    },
  },
];
