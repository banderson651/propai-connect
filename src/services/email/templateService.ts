
import { EmailTemplate } from '@/types/email';
import { supabase } from '@/lib/supabase';

// Get all email templates for the current user
export const getEmailTemplates = async (): Promise<EmailTemplate[]> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    const { data, error } = await supabase
      .from('email_templates')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return data.map(template => ({
      ...template,
      body: template.content // For backward compatibility
    }));
  } catch (error) {
    console.error('Error fetching email templates:', error);
    // Return mock data for development
    return [
      {
        id: '1',
        user_id: 'mock-user-id',
        name: 'Welcome Email',
        subject: 'Welcome to our platform',
        content: '<p>Welcome to our platform!</p>',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
  }
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
