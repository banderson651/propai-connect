
import { EmailAccount, EmailTemplate, Campaign } from '@/types/email';
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
