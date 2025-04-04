
import { EmailCampaign, Campaign, CampaignStatus } from '@/types/email';
import { supabase } from '@/lib/supabase';

// Get all campaigns
export const getCampaigns = async (): Promise<Campaign[]> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    const { data, error } = await supabase
      .from('email_campaigns')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return data.map(campaign => ({
      id: campaign.id,
      name: campaign.name,
      status: campaign.status as CampaignStatus,
      createdAt: campaign.created_at,
      stats: campaign.statistics || {
        sent: 0,
        delivered: 0,
        opened: 0,
        clicked: 0,
        openRate: 0,
        clickRate: 0
      }
    }));
  } catch (error) {
    console.error('Error fetching email campaigns:', error);
    // Return mock data for development
    return [
      {
        id: '1',
        name: 'Welcome Campaign',
        status: 'completed',
        createdAt: new Date().toISOString(),
        stats: {
          sent: 100,
          delivered: 95,
          opened: 80,
          clicked: 40,
          openRate: 84,
          clickRate: 42
        }
      },
      {
        id: '2',
        name: 'Monthly Newsletter',
        status: 'running',
        createdAt: new Date().toISOString(),
        stats: {
          sent: 500,
          delivered: 490,
          opened: 350,
          clicked: 200,
          openRate: 71,
          clickRate: 40
        }
      }
    ];
  }
};

// Campaign actions
export const startCampaign = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('email_campaigns')
      .update({ status: 'running' })
      .eq('id', id);
    
    if (error) throw error;
  } catch (error) {
    console.error(`Error starting campaign with ID ${id}:`, error);
    throw error;
  }
};

export const pauseCampaign = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('email_campaigns')
      .update({ status: 'paused' })
      .eq('id', id);
    
    if (error) throw error;
  } catch (error) {
    console.error(`Error pausing campaign with ID ${id}:`, error);
    throw error;
  }
};

export const resumeCampaign = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('email_campaigns')
      .update({ status: 'running' })
      .eq('id', id);
    
    if (error) throw error;
  } catch (error) {
    console.error(`Error resuming campaign with ID ${id}:`, error);
    throw error;
  }
};

export const stopCampaign = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('email_campaigns')
      .update({ status: 'completed' })
      .eq('id', id);
    
    if (error) throw error;
  } catch (error) {
    console.error(`Error stopping campaign with ID ${id}:`, error);
    throw error;
  }
};
