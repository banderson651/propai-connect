
import { EmailAccount, EmailTemplate, Campaign, EmailTestResult } from '@/types/email';
import { mockEmailAccounts, mockEmailTemplates, mockCampaigns } from './emailMockData';
import { v4 as uuidv4 } from 'uuid';

// Email Accounts
export const getEmailAccounts = (): Promise<EmailAccount[]> => {
  return Promise.resolve([...mockEmailAccounts]);
};

export const getEmailAccountById = (id: string): Promise<EmailAccount | undefined> => {
  const account = mockEmailAccounts.find(account => account.id === id);
  return Promise.resolve(account);
};

export const createEmailAccount = (account: Omit<EmailAccount, 'id' | 'status' | 'lastChecked'>): Promise<EmailAccount> => {
  const newAccount: EmailAccount = {
    ...account,
    id: uuidv4(),
    status: 'connected',
    lastChecked: new Date().toISOString(),
  };
  mockEmailAccounts.push(newAccount);
  return Promise.resolve(newAccount);
};

export const updateEmailAccount = (id: string, updates: Partial<EmailAccount>): Promise<EmailAccount | undefined> => {
  const index = mockEmailAccounts.findIndex(account => account.id === id);
  if (index === -1) return Promise.resolve(undefined);
  
  mockEmailAccounts[index] = { ...mockEmailAccounts[index], ...updates };
  return Promise.resolve(mockEmailAccounts[index]);
};

export const deleteEmailAccount = (id: string): Promise<boolean> => {
  const index = mockEmailAccounts.findIndex(account => account.id === id);
  if (index === -1) return Promise.resolve(false);
  
  mockEmailAccounts.splice(index, 1);
  return Promise.resolve(true);
};

// Test Email Connection
export const testEmailConnection = (account: EmailAccount): Promise<EmailTestResult> => {
  // In a real app, this would actually test the connection to the email server
  // For this mock implementation, we'll simulate a successful connection most of the time
  // with occasional failures to demonstrate error handling
  
  return new Promise((resolve) => {
    // Simulate network delay
    setTimeout(() => {
      // Randomly determine if the connection is successful (80% success rate)
      const isSuccessful = Math.random() < 0.8;
      
      if (isSuccessful) {
        resolve({
          success: true,
          message: 'Connection successful! Your email account is properly configured.'
        });
      } else {
        // Generate a random error message
        const errorMessages = [
          'Authentication failed. Please check your username and password.',
          'Unable to connect to mail server. Please verify host and port settings.',
          'Connection timed out. The mail server is not responding.',
          'TLS/SSL negotiation failed. Please check your security settings.'
        ];
        const randomError = errorMessages[Math.floor(Math.random() * errorMessages.length)];
        
        resolve({
          success: false,
          message: randomError
        });
      }
    }, 1500); // Simulate a 1.5 second delay for network request
  });
};

export const sendTestEmail = (accountId: string, recipient: string): Promise<EmailTestResult> => {
  const account = mockEmailAccounts.find(acc => acc.id === accountId);
  if (!account) {
    return Promise.resolve({
      success: false,
      message: 'Email account not found'
    });
  }
  
  // In a real app, this would actually send a test email
  // For this mock implementation, we'll simulate success most of the time
  return new Promise((resolve) => {
    setTimeout(() => {
      const isSuccessful = Math.random() < 0.9; // 90% success rate for test emails
      
      if (isSuccessful) {
        resolve({
          success: true,
          message: `Test email sent to ${recipient} from ${account.email} successfully!`
        });
      } else {
        resolve({
          success: false,
          message: 'Failed to send test email. Please check your email settings and try again.'
        });
      }
    }, 2000); // Simulate a 2 second delay
  });
};

// Email Templates
export const getEmailTemplates = (): Promise<EmailTemplate[]> => {
  return Promise.resolve([...mockEmailTemplates]);
};

export const getEmailTemplateById = (id: string): Promise<EmailTemplate | undefined> => {
  const template = mockEmailTemplates.find(template => template.id === id);
  return Promise.resolve(template);
};

export const createEmailTemplate = (template: Omit<EmailTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<EmailTemplate> => {
  const now = new Date().toISOString();
  const newTemplate: EmailTemplate = {
    ...template,
    id: uuidv4(),
    createdAt: now,
    updatedAt: now,
  };
  mockEmailTemplates.push(newTemplate);
  return Promise.resolve(newTemplate);
};

export const updateEmailTemplate = (id: string, updates: Partial<EmailTemplate>): Promise<EmailTemplate | undefined> => {
  const index = mockEmailTemplates.findIndex(template => template.id === id);
  if (index === -1) return Promise.resolve(undefined);
  
  mockEmailTemplates[index] = { 
    ...mockEmailTemplates[index], 
    ...updates, 
    updatedAt: new Date().toISOString() 
  };
  return Promise.resolve(mockEmailTemplates[index]);
};

export const deleteEmailTemplate = (id: string): Promise<boolean> => {
  const index = mockEmailTemplates.findIndex(template => template.id === id);
  if (index === -1) return Promise.resolve(false);
  
  mockEmailTemplates.splice(index, 1);
  return Promise.resolve(true);
};

// Campaigns
export const getCampaigns = (): Promise<Campaign[]> => {
  return Promise.resolve([...mockCampaigns]);
};

export const getCampaignById = (id: string): Promise<Campaign | undefined> => {
  const campaign = mockCampaigns.find(campaign => campaign.id === id);
  return Promise.resolve(campaign);
};

export const createCampaign = (campaign: Omit<Campaign, 'id' | 'createdAt' | 'updatedAt' | 'stats'>): Promise<Campaign> => {
  const now = new Date().toISOString();
  const newCampaign: Campaign = {
    ...campaign,
    id: uuidv4(),
    createdAt: now,
    updatedAt: now,
    stats: {
      sent: 0,
      delivered: 0,
      opened: 0,
      clicked: 0,
      bounced: 0,
      failed: 0,
      openRate: 0,
      clickRate: 0,
    }
  };
  mockCampaigns.push(newCampaign);
  return Promise.resolve(newCampaign);
};

export const updateCampaign = (id: string, updates: Partial<Campaign>): Promise<Campaign | undefined> => {
  const index = mockCampaigns.findIndex(campaign => campaign.id === id);
  if (index === -1) return Promise.resolve(undefined);
  
  mockCampaigns[index] = { 
    ...mockCampaigns[index], 
    ...updates, 
    updatedAt: new Date().toISOString() 
  };
  return Promise.resolve(mockCampaigns[index]);
};

export const deleteCampaign = (id: string): Promise<boolean> => {
  const index = mockCampaigns.findIndex(campaign => campaign.id === id);
  if (index === -1) return Promise.resolve(false);
  
  mockCampaigns.splice(index, 1);
  return Promise.resolve(true);
};

// Campaign Actions
export const startCampaign = (id: string): Promise<Campaign | undefined> => {
  const index = mockCampaigns.findIndex(campaign => campaign.id === id);
  if (index === -1) return Promise.resolve(undefined);
  
  const now = new Date().toISOString();
  mockCampaigns[index] = { 
    ...mockCampaigns[index], 
    status: 'running',
    startedAt: now,
    updatedAt: now 
  };
  
  // Simulate sending emails for this campaign
  simulateCampaignEmails(mockCampaigns[index]);
  
  return Promise.resolve(mockCampaigns[index]);
};

export const pauseCampaign = (id: string): Promise<Campaign | undefined> => {
  const index = mockCampaigns.findIndex(campaign => campaign.id === id);
  if (index === -1) return Promise.resolve(undefined);
  
  mockCampaigns[index] = { 
    ...mockCampaigns[index], 
    status: 'paused',
    updatedAt: new Date().toISOString() 
  };
  return Promise.resolve(mockCampaigns[index]);
};

export const resumeCampaign = (id: string): Promise<Campaign | undefined> => {
  const index = mockCampaigns.findIndex(campaign => campaign.id === id);
  if (index === -1) return Promise.resolve(undefined);
  
  mockCampaigns[index] = { 
    ...mockCampaigns[index], 
    status: 'running',
    updatedAt: new Date().toISOString() 
  };
  
  // Simulate sending more emails when resumed
  simulateCampaignEmails(mockCampaigns[index]);
  
  return Promise.resolve(mockCampaigns[index]);
};

export const stopCampaign = (id: string): Promise<Campaign | undefined> => {
  const index = mockCampaigns.findIndex(campaign => campaign.id === id);
  if (index === -1) return Promise.resolve(undefined);
  
  const now = new Date().toISOString();
  mockCampaigns[index] = { 
    ...mockCampaigns[index], 
    status: 'completed',
    completedAt: now,
    updatedAt: now 
  };
  return Promise.resolve(mockCampaigns[index]);
};

// Campaign Email Outbox
let sentEmails: Array<{
  id: string;
  campaignId: string;
  emailAccountId: string;
  recipient: string;
  subject: string;
  body: string;
  sentAt: string;
  status: 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'failed';
}> = [];

export const getCampaignEmails = (campaignId: string): Promise<any[]> => {
  return Promise.resolve(sentEmails.filter(email => email.campaignId === campaignId));
};

export const getAllSentEmails = (): Promise<any[]> => {
  return Promise.resolve([...sentEmails]);
};

// Simulate sending emails for a campaign
const simulateCampaignEmails = (campaign: Campaign) => {
  const emailAccount = mockEmailAccounts.find(account => account.id === campaign.emailAccountId);
  const template = mockEmailTemplates.find(template => template.id === campaign.templateId);
  
  if (!emailAccount || !template) return;
  
  // Get the number of recipients still to process
  const remainingContacts = campaign.contactIds.length - campaign.stats.sent;
  
  // Determine how many emails to send in this batch based on sending rate
  // For simulation, we'll pretend each batch is 1 hour worth of emails
  const batchSize = Math.min(campaign.sendingRate, remainingContacts);
  
  // Update campaign stats with new batch
  const campaignIndex = mockCampaigns.findIndex(c => c.id === campaign.id);
  if (campaignIndex >= 0) {
    mockCampaigns[campaignIndex].stats.sent += batchSize;
    
    // Simulate some email metrics (80% delivered, 40% opened, 10% clicked, 5% bounced, 15% failed)
    const delivered = Math.floor(batchSize * 0.8);
    const opened = Math.floor(batchSize * 0.4);
    const clicked = Math.floor(batchSize * 0.1);
    const bounced = Math.floor(batchSize * 0.05);
    const failed = Math.floor(batchSize * 0.15);
    
    mockCampaigns[campaignIndex].stats.delivered += delivered;
    mockCampaigns[campaignIndex].stats.opened += opened;
    mockCampaigns[campaignIndex].stats.clicked += clicked;
    mockCampaigns[campaignIndex].stats.bounced += bounced;
    mockCampaigns[campaignIndex].stats.failed += failed;
    
    // Calculate rates
    const totalSent = mockCampaigns[campaignIndex].stats.sent;
    mockCampaigns[campaignIndex].stats.openRate = totalSent > 0 
      ? (mockCampaigns[campaignIndex].stats.opened / totalSent) * 100 
      : 0;
    mockCampaigns[campaignIndex].stats.clickRate = totalSent > 0 
      ? (mockCampaigns[campaignIndex].stats.clicked / totalSent) * 100 
      : 0;
  }
  
  // Create email records for the outbox
  for (let i = 0; i < batchSize; i++) {
    const statusOptions = ['sent', 'delivered', 'opened', 'clicked', 'bounced', 'failed'];
    const randomStatus = statusOptions[Math.floor(Math.random() * statusOptions.length)] as 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'failed';
    
    sentEmails.push({
      id: uuidv4(),
      campaignId: campaign.id,
      emailAccountId: emailAccount.id,
      recipient: `recipient${i}@example.com`,
      subject: template.subject,
      body: template.body,
      sentAt: new Date().toISOString(),
      status: randomStatus
    });
  }
};
