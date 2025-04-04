import { EmailTemplate } from '@/types/email';
import { supabase } from '@/lib/supabase';

// Get all email templates for the current user
export const getEmailTemplates = async (): Promise<EmailTemplate[]> => {
  // For demo purposes, returning mock data
  return mockEmailTemplates.map(template => ({
    id: template.id,
    name: template.name,
    subject: template.subject,
    body: template.content || template.body || '',
    content: template.content,
    created_at: template.created_at,
    updated_at: template.updated_at,
    user_id: template.user_id
  }));
};

// Get a specific email template by ID
export const getEmailTemplateById = async (id: string): Promise<EmailTemplate | null> => {
  try {
    const { data, error } = await supabase
      .from('email_templates')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    return {
      ...data,
      body: data.content // For backward compatibility
    };
  } catch (error) {
    console.error(`Error fetching email template with ID ${id}:`, error);
    return null;
  }
};

// Create a new email template
export const createEmailTemplate = async (template: Omit<EmailTemplate, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<EmailTemplate> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    const { data, error } = await supabase
      .from('email_templates')
      .insert([{
        ...template,
        user_id: user.id
      }])
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      ...data,
      body: data.content // For backward compatibility
    };
  } catch (error) {
    console.error('Error creating email template:', error);
    throw error;
  }
};

// Update an existing email template
export const updateEmailTemplate = async (id: string, updates: Partial<Omit<EmailTemplate, 'id' | 'user_id' | 'created_at' | 'updated_at'>>): Promise<EmailTemplate> => {
  try {
    const { data, error } = await supabase
      .from('email_templates')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      ...data,
      body: data.content // For backward compatibility
    };
  } catch (error) {
    console.error(`Error updating email template with ID ${id}:`, error);
    throw error;
  }
};

// Delete an email template
export const deleteEmailTemplate = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('email_templates')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  } catch (error) {
    console.error(`Error deleting email template with ID ${id}:`, error);
    throw error;
  }
};
