
import { supabase } from '@/lib/supabase';
import { Campaign } from '@/types/email';

// Get all campaigns for the current user
export const getCampaigns = async (): Promise<Campaign[]> => {
  try {
    const { data, error } = await supabase
      .from('email_campaigns')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    return (data || []).map(campaign => ({
      id: campaign.id,
      name: campaign.name,
      subject: campaign.name, // Using name as subject for now
      body: campaign.description || '',
      senderEmailAccountId: campaign.sender_account_id || '',
      contactListId: 'default',
      status: campaign.status as 'draft' | 'sent' | 'scheduled',
      sentAt: null,
      stats: { sent: 0, opened: 0, clicked: 0, bounced: 0 },
      scheduledDate: null,
      createdAt: campaign.created_at || new Date().toISOString(),
      updatedAt: campaign.updated_at || new Date().toISOString(),
      userId: 'current-user',
      recipientCount: 0,
      tags: [],
      accountId: campaign.sender_account_id || ''
    })) as Campaign[];
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    return [];
  }
};

// Create a new campaign
export const createCampaign = async (campaign: Omit<Campaign, 'id' | 'createdAt' | 'updatedAt'>): Promise<Campaign | null> => {
  try {
    const { data, error } = await supabase
      .from('email_campaigns')
      .insert({
        name: campaign.name,
        description: campaign.body,
        template_id: campaign.subject,
        sender_account_id: campaign.senderEmailAccountId,
        status: campaign.status
      })
      .select()
      .single();
      
    if (error) throw error;
    
    return {
      id: data.id,
      name: data.name,
      subject: data.template_id,
      body: data.description || '',
      senderEmailAccountId: data.sender_account_id || '',
      contactListId: 'default',
      status: data.status as 'draft' | 'sent' | 'scheduled',
      sentAt: null,
      stats: { sent: 0, opened: 0, clicked: 0, bounced: 0 },
      scheduledDate: null,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      userId: 'current-user',
      recipientCount: 0,
      tags: [],
      accountId: data.sender_account_id || ''
    } as Campaign;
  } catch (error) {
    console.error('Error creating campaign:', error);
    return null;
  }
};
