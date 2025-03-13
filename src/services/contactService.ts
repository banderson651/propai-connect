
import { supabase } from '@/integrations/supabase/client';
import { Contact, Interaction, ContactTag } from '@/types/contact';
import { v4 as uuidv4 } from 'uuid';

// Get all contacts from Supabase
export const getContacts = async (): Promise<Contact[]> => {
  try {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error fetching contacts:', error);
    return [];
  }
};

// Get a contact by ID
export const getContactById = async (id: string): Promise<Contact | null> => {
  try {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .eq('id', id)
      .maybeSingle();
      
    if (error) throw error;
    
    return data || null;
  } catch (error) {
    console.error(`Error fetching contact with ID ${id}:`, error);
    return null;
  }
};

// Create a new contact
export const saveContact = async (contact: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>): Promise<Contact | null> => {
  try {
    const contactId = uuidv4();
    const now = new Date().toISOString();
    
    const { data, error } = await supabase
      .from('contacts')
      .insert({
        id: contactId,
        name: contact.name,
        email: contact.email,
        phone: contact.phone || null,
        address: contact.address || null,
        tags: contact.tags || [],
        notes: contact.notes || null,
        created_at: now,
        updated_at: now
      })
      .select()
      .single();
      
    if (error) throw error;
    
    return {
      ...data,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    } as Contact;
  } catch (error) {
    console.error('Error creating contact:', error);
    return null;
  }
};

// Update a contact
export const updateContact = async (id: string, updates: Partial<Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Contact | null> => {
  try {
    const now = new Date().toISOString();
    
    const updateData = {
      ...updates,
      updated_at: now
    };
    
    const { data, error } = await supabase
      .from('contacts')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
      
    if (error) throw error;
    
    return {
      ...data,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    } as Contact;
  } catch (error) {
    console.error(`Error updating contact with ID ${id}:`, error);
    return null;
  }
};

// Delete a contact
export const deleteContact = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('contacts')
      .delete()
      .eq('id', id);
      
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
    const { data, error } = await supabase
      .from('interactions')
      .select('*')
      .eq('contact_id', contactId)
      .order('date', { ascending: false });
      
    if (error) throw error;
    
    return data.map(interaction => ({
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

// Create a new interaction
export const saveInteraction = async (interaction: Omit<Interaction, 'id' | 'createdAt' | 'updatedAt'>): Promise<Interaction | null> => {
  try {
    const interactionId = uuidv4();
    const now = new Date().toISOString();
    
    const { data, error } = await supabase
      .from('interactions')
      .insert({
        id: interactionId,
        contact_id: interaction.contactId,
        type: interaction.type,
        date: interaction.date,
        content: interaction.content,
        subject: interaction.subject || null,
        created_at: now,
        updated_at: now
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
