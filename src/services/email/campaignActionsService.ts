
import { Campaign } from '@/types/email';
import { mockCampaigns, emailAccounts, mockEmailTemplates } from '../emailMockData';
import { v4 as uuidv4 } from 'uuid';

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
  const emailAccount = emailAccounts.find(account => account.id === campaign.emailAccountId);
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
