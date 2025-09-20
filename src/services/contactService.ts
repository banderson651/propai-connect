
import { supabase } from '@/lib/supabase';
import { Contact, Interaction, ContactTag } from '@/types/contact';

// Get all contacts from Supabase for the current user
export const getContacts = async (): Promise<Contact[]> => {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    const contactsData = data ?? [];

    return contactsData.map(contact => ({
      ...contact,
      createdAt: contact.created_at,
      updatedAt: contact.updated_at,
      tags: contact.tags || []
    })) as Contact[];
  } catch (error) {
    console.error('Error fetching contacts:', error);
    return [];
  }
};

// Get a contact by ID
export const getContactById = async (id: string): Promise<Contact | null> => {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .maybeSingle();
      
    if (error) throw error;
    
    if (!data) return null;
    
    return {
      ...data,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      tags: data.tags || []
    } as Contact;
  } catch (error) {
    console.error(`Error fetching contact with ID ${id}:`, error);
    return null;
  }
};

// Create a new contact
export const saveContact = async (contact: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>): Promise<Contact | null> => {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('contacts')
      .insert({
        user_id: user.id,
        name: contact.name,
        email: contact.email,
        phone: contact.phone || null,
        address: contact.address || null,
        tags: contact.tags || [],
        notes: contact.notes || null
      })
      .select()
      .single();
      
    if (error) throw error;
    
    return {
      ...data,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      tags: data.tags || []
    } as Contact;
  } catch (error) {
    console.error('Error creating contact:', error);
    return null;
  }
};

// Update a contact
export const updateContact = async (id: string, updates: Partial<Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Contact | null> => {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!user) throw new Error('User not authenticated');

    const updateData: any = {};
    
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.email !== undefined) updateData.email = updates.email;
    if (updates.phone !== undefined) updateData.phone = updates.phone;
    if (updates.address !== undefined) updateData.address = updates.address;
    if (updates.tags !== undefined) updateData.tags = updates.tags;
    if (updates.notes !== undefined) updateData.notes = updates.notes;
    
    const { data, error } = await supabase
      .from('contacts')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();
      
    if (error) throw error;
    
    return {
      ...data,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      tags: data.tags || []
    } as Contact;
  } catch (error) {
    console.error(`Error updating contact with ID ${id}:`, error);
    return null;
  }
};

// Delete a contact
export const deleteContact = async (id: string): Promise<boolean> => {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('contacts')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error(`Error deleting contact with ID ${id}:`, error);
    return false;
  }
};

// Get interactions for a contact
export const getInteractionsByContactId = async (contactId: string): Promise<Interaction[]> => {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('interactions')
      .select('*')
      .eq('contact_id', contactId)
      .eq('user_id', user.id)
      .order('date', { ascending: false });
      
    if (error) throw error;
    
    const interactionsData = data ?? [];

    return interactionsData.map(interaction => ({
      ...interaction,
      contactId: interaction.contact_id,
      createdAt: interaction.created_at,
      updatedAt: interaction.updated_at
    })) as Interaction[];
  } catch (error) {
    console.error(`Error fetching interactions for contact ID ${contactId}:`, error);
    return [];
  }
};

// Get all interactions for the current user
export const getInteractions = async (): Promise<Interaction[]> => {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('interactions')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false });
      
    if (error) throw error;
    
    const interactionsData = data ?? [];

    return interactionsData.map(interaction => ({
      ...interaction,
      contactId: interaction.contact_id,
      createdAt: interaction.created_at,
      updatedAt: interaction.updated_at
    })) as Interaction[];
  } catch (error) {
    console.error('Error fetching interactions:', error);
    return [];
  }
};

// Create a new interaction
export const saveInteraction = async (interaction: Omit<Interaction, 'id' | 'createdAt' | 'updatedAt'>): Promise<Interaction | null> => {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('interactions')
      .insert({
        user_id: user.id,
        contact_id: interaction.contactId,
        type: interaction.type,
        date: interaction.date,
        content: interaction.content,
        subject: interaction.subject || null
      })
      .select()
      .single();
      
    if (error) throw error;
    
    return {
      ...data,
      contactId: data.contact_id,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    } as Interaction;
  } catch (error) {
    console.error('Error creating interaction:', error);
    return null;
  }
};

// NLP auto-tagging (simplified mock implementation)
export const analyzeTextForTags = (text: string): ContactTag[] => {
  const tags: ContactTag[] = [];
  
  // Very simplified NLP analysis - in a real app, this would use an actual NLP service
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes('buy') || lowerText.includes('purchase') || lowerText.includes('looking for')) {
    tags.push('buyer');
  }
  
  if (lowerText.includes('sell') || lowerText.includes('selling')) {
    tags.push('seller');
  }
  
  if (lowerText.includes('first time') || lowerText.includes('first home')) {
    tags.push('first-time-buyer');
  }
  
  if (lowerText.includes('luxury') || lowerText.includes('high-end') || lowerText.includes('premium')) {
    tags.push('luxury');
  }
  
  if (lowerText.includes('commercial') || lowerText.includes('business') || lowerText.includes('office')) {
    tags.push('commercial');
  }
  
  if (lowerText.includes('house') || lowerText.includes('condo') || lowerText.includes('apartment')) {
    tags.push('residential');
  }
  
  if (lowerText.includes('invest') || lowerText.includes('roi') || lowerText.includes('portfolio')) {
    tags.push('investor');
  }
  
  if (lowerText.includes('urgent') || lowerText.includes('asap') || lowerText.includes('immediately')) {
    tags.push('hot-lead');
  }
  
  return tags;
};
