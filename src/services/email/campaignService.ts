
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

// Get a campaign by ID
export const getCampaignById = async (id: string): Promise<Campaign | null> => {
  try {
    const { data, error } = await supabase
      .from('email_campaigns')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    if (!data) return null;
    
    return {
      id: data.id,
      name: data.name,
      status: data.status as CampaignStatus,
      createdAt: data.created_at,
      startedAt: data.started_at,
      completedAt: data.completed_at,
      emailAccountId: data.email_account_id,
      templateId: data.template_id,
      contactIds: data.contact_ids || [],
      sendingRate: data.sending_rate || 20,
      stats: data.statistics || {
        sent: 0,
        delivered: 0,
        opened: 0,
        clicked: 0,
        openRate: 0,
        clickRate: 0
      }
    };
  } catch (error) {
    console.error(`Error fetching campaign with ID ${id}:`, error);
    // Return mock data for development
    return {
      id,
      name: 'Sample Campaign',
      status: 'running',
      createdAt: new Date().toISOString(),
      startedAt: new Date().toISOString(),
      emailAccountId: '1',
      templateId: '1',
      contactIds: ['1', '2', '3'],
      sendingRate: 20,
      stats: {
        sent: 100,
        delivered: 95,
        opened: 80,
        clicked: 40,
        openRate: 84,
        clickRate: 42
      }
    };
  }
};

// Create a new campaign
export const createCampaign = async (campaignData: any): Promise<Campaign> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    const campaign = {
      user_id: user.id,
      name: campaignData.name,
      status: campaignData.status || 'draft',
      email_account_id: campaignData.emailAccountId,
      template_id: campaignData.templateId,
      contact_ids: campaignData.contactIds,
      sending_rate: campaignData.sendingRate,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('email_campaigns')
      .insert([campaign])
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      name: data.name,
      status: data.status as CampaignStatus,
      createdAt: data.created_at,
      emailAccountId: data.email_account_id,
      templateId: data.template_id,
      contactIds: data.contact_ids || [],
      sendingRate: data.sending_rate || 20,
      stats: {
        sent: 0,
        delivered: 0,
        opened: 0,
        clicked: 0,
        openRate: 0,
        clickRate: 0
      }
    };
  } catch (error) {
    console.error('Error creating campaign:', error);
    // Return mock data for development
    return {
      id: crypto.randomUUID(),
      name: campaignData.name,
      status: 'draft',
      createdAt: new Date().toISOString(),
      emailAccountId: campaignData.emailAccountId,
      templateId: campaignData.templateId,
      contactIds: campaignData.contactIds,
      sendingRate: campaignData.sendingRate,
      stats: {
        sent: 0,
        delivered: 0,
        opened: 0,
        clicked: 0,
        openRate: 0,
        clickRate: 0
      }
    };
  }
};

// Delete a campaign
export const deleteCampaign = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('email_campaigns')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  } catch (error) {
    console.error(`Error deleting campaign with ID ${id}:`, error);
    throw error;
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
