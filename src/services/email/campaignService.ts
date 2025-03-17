
import { Campaign } from '@/types/email';
import { mockCampaigns } from '../emailMockData';
import { v4 as uuidv4 } from 'uuid';

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
