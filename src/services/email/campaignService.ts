import { EmailCampaign, Campaign } from '@/types/email';
import { supabase } from '@/lib/supabase';
import emailService from './emailService';

export const getCampaigns = async (): Promise<Campaign[]> => {
  try {
    const { data, error } = await supabase
      .from('email_campaigns')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    if (data && data.length > 0) {
      return data.map(campaign => ({
        ...campaign,
        stats: campaign.stats || {
          sent: 0,
          delivered: 0,
          opened: 0,
          clicked: 0,
          openRate: 0,
          clickRate: 0
        }
      })) as Campaign[];
    }
    
    return [
      {
        id: '1',
        name: 'Spring Property Newsletter',
        status: 'draft',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        emailAccountId: '1',
        templateId: '1',
        subject: 'New Properties Available in Your Area',
        contactIds: ['1', '2', '3'],
        sendingRate: 50,
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
        id: '2',
        name: 'Follow-up with Hot Leads',
        status: 'completed',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        startedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        completedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
        emailAccountId: '1',
        templateId: '2',
        subject: 'Following Up On Your Property Interest',
        contactIds: ['4', '5', '6', '7'],
        sendingRate: 30,
        stats: {
          sent: 45,
          delivered: 43,
          opened: 28,
          clicked: 12,
          openRate: 65,
          clickRate: 28
        }
      },
      {
        id: '3',
        name: 'New Listings Notification',
        status: 'running',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        startedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        emailAccountId: '2',
        templateId: '3',
        subject: 'New Properties Just Listed',
        contactIds: ['8', '9', '10', '11', '12'],
        sendingRate: 20,
        stats: {
          sent: 32,
          delivered: 30,
          opened: 15,
          clicked: 5,
          openRate: 50,
          clickRate: 17
        }
      }
    ];
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    return [];
  }
};

export const getCampaignById = async (id: string): Promise<Campaign | null> => {
  try {
    const { data, error } = await supabase
      .from('email_campaigns')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) throw error;
    
    return data as Campaign;
  } catch (error) {
    console.error(`Error fetching campaign with id ${id}:`, error);
    return null;
  }
};

export const createCampaign = async (campaign: Partial<EmailCampaign> & { recipients?: Array<{email: string, name?: string}> }): Promise<Campaign> => {
  try {
    const campaignData = {
      ...campaign,
      metadata: campaign.recipients ? { 
        customRecipients: campaign.recipients 
      } : undefined,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      status: 'draft'
    };
    
    if ('recipients' in campaignData) {
      delete campaignData.recipients;
    }
    
    const { data, error } = await supabase
      .from('email_campaigns')
      .insert(campaignData)
      .select()
      .single();
      
    if (error) throw error;
    
    return data as Campaign;
  } catch (error) {
    console.error('Error creating campaign:', error);
    throw error;
  }
};

export const deleteCampaign = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('email_campaigns')
      .delete()
      .eq('id', id);
      
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error(`Error deleting campaign with id ${id}:`, error);
    return false;
  }
};

export const startCampaign = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('email_campaigns')
      .update({
        status: 'running',
        started_at: new Date().toISOString()
      })
      .eq('id', id);
      
    if (error) throw error;
    
    return await sendCampaign(id);
  } catch (error) {
    console.error(`Error starting campaign ${id}:`, error);
    return false;
  }
};

export const pauseCampaign = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('email_campaigns')
      .update({
        status: 'paused'
      })
      .eq('id', id);
      
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error(`Error pausing campaign ${id}:`, error);
    return false;
  }
};

export const resumeCampaign = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('email_campaigns')
      .update({
        status: 'running'
      })
      .eq('id', id);
      
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error(`Error resuming campaign ${id}:`, error);
    return false;
  }
};

export const stopCampaign = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('email_campaigns')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('id', id);
      
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error(`Error stopping campaign ${id}:`, error);
    return false;
  }
};

export const sendCampaign = async (campaignId: string): Promise<boolean> => {
  try {
    const campaign = await getCampaignById(campaignId);
    if (!campaign) throw new Error('Campaign not found');
    
    const { error } = await supabase
      .from('email_campaigns')
      .update({ 
        status: 'sending',
        sent_at: new Date().toISOString()
      })
      .eq('id', campaignId);
      
    if (error) throw error;
    
    await emailService.initialize(campaign.emailAccountId);
    
    let recipients: Array<{email: string, name?: string}> = [];
    
    if (campaign.contactIds && campaign.contactIds.length > 0) {
      const { data, error } = await supabase
        .from('contacts')
        .select('email, name')
        .in('id', campaign.contactIds);
        
      if (error) throw error;
      
      recipients = data.map(contact => ({
        email: contact.email,
        name: contact.name
      }));
    } else if (campaign.metadata?.customRecipients) {
      recipients = campaign.metadata.customRecipients;
    }
    
    if (recipients.length === 0) {
      throw new Error('No recipients found for this campaign');
    }
    
    const { error: updateError } = await supabase
      .from('email_campaigns')
      .update({ 
        status: 'sent',
        completed_at: new Date().toISOString()
      })
      .eq('id', campaignId);
      
    if (updateError) throw updateError;
    
    return true;
  } catch (error) {
    console.error(`Error sending campaign ${campaignId}:`, error);
    
    await supabase
      .from('email_campaigns')
      .update({ 
        status: 'failed'
      })
      .eq('id', campaignId);
      
    return false;
  }
};
