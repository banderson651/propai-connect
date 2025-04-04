
import { EmailCampaign, Campaign } from '@/types/email';
import { supabase } from '@/lib/supabase';
import emailService from './emailService';

export const getCampaigns = async (): Promise<Campaign[]> => {
  // Mock function for now
  return [];
};

export const getCampaignById = async (id: string): Promise<Campaign | null> => {
  try {
    // In a real implementation, this would fetch from Supabase
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

export const createCampaign = async (campaign: Partial<EmailCampaign>): Promise<Campaign> => {
  try {
    // In a real implementation, this would insert into Supabase
    const { data, error } = await supabase
      .from('email_campaigns')
      .insert({
        ...campaign,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        status: 'draft'
      })
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

export const sendCampaign = async (campaignId: string): Promise<boolean> => {
  try {
    // Get campaign details
    const campaign = await getCampaignById(campaignId);
    if (!campaign) throw new Error('Campaign not found');
    
    // Update campaign status
    const { error } = await supabase
      .from('email_campaigns')
      .update({ 
        status: 'sending',
        sent_at: new Date().toISOString()
      })
      .eq('id', campaignId);
      
    if (error) throw error;
    
    // Initialize email service with the campaign's account
    await emailService.initialize(campaign.emailAccountId);
    
    // In a real implementation, this would send emails to all recipients
    // For now, we'll just update the status
    
    // Update campaign as sent
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
    
    // Update campaign status to failed
    await supabase
      .from('email_campaigns')
      .update({ 
        status: 'failed'
      })
      .eq('id', campaignId);
      
    return false;
  }
};
