
import { Campaign } from '@/types/email';

// For now, return empty array since we don't have campaigns in the database yet
export const getCampaigns = async (): Promise<Campaign[]> => {
  return [];
};
