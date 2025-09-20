import { Campaign } from '@/types/email';
import { getEmailCampaigns } from './index';

export const getCampaigns = async (): Promise<Campaign[]> => {
  try {
    const campaigns = await getEmailCampaigns();
    return campaigns;
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    return [];
  }
};
