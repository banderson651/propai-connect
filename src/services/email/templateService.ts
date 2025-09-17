
import { supabase } from '@/lib/supabase';
import { EmailTemplate } from '@/types/email';

// Get all email templates for the current user
export const getEmailTemplates = async (): Promise<EmailTemplate[]> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('email_templates')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    return (data || []).map(template => ({
      id: template.id,
      name: template.name,
      subject: template.subject,
      body: template.body,
      createdAt: template.created_at || new Date().toISOString(),
      updatedAt: template.created_at || new Date().toISOString(),
      userId: template.user_id,
      tags: [],
      isPrebuilt: false
    })) as EmailTemplate[];
  } catch (error) {
    console.error('Error fetching email templates:', error);
    return [];
  }
};

// Create a new email template
export const createEmailTemplate = async (template: Omit<EmailTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<EmailTemplate | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('email_templates')
      .insert({
        user_id: user.id,
        name: template.name,
        subject: template.subject,
        body: template.body
      })
      .select()
      .single();
      
    if (error) throw error;
    
    return {
      id: data.id,
      name: data.name,
      subject: data.subject,
      body: data.body,
      createdAt: data.created_at,
      updatedAt: data.created_at,
      userId: data.user_id,
      tags: template.tags || [],
      isPrebuilt: false
    } as EmailTemplate;
  } catch (error) {
    console.error('Error creating email template:', error);
    return null;
  }
};

// Update an email template
export const updateEmailTemplate = async (id: string, updates: Partial<Omit<EmailTemplate, 'id' | 'createdAt' | 'updatedAt'>>): Promise<EmailTemplate | null> => {
  try {
    const updateData: any = {};
    
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.subject !== undefined) updateData.subject = updates.subject;
    if (updates.body !== undefined) updateData.body = updates.body;
    
    const { data, error } = await supabase
      .from('email_templates')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
      
    if (error) throw error;
    
    return {
      id: data.id,
      name: data.name,
      subject: data.subject,
      body: data.body,
      createdAt: data.created_at,
      updatedAt: data.created_at,
      userId: data.user_id,
      tags: updates.tags || [],
      isPrebuilt: false
    } as EmailTemplate;
  } catch (error) {
    console.error('Error updating email template:', error);
    return null;
  }
};

// Delete an email template
export const deleteEmailTemplate = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('email_templates')
      .delete()
      .eq('id', id);
      
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting email template:', error);
    return false;
  }
};
