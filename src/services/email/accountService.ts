
import { EmailAccount, EmailTestResult } from '@/types/email';
import { supabase } from '@/integrations/supabase/client';
import { testEmailConnection } from './emailUtils';

// Email Accounts
export const getEmailAccounts = async (): Promise<EmailAccount[]> => {
  const { data, error } = await supabase
    .from('email_accounts')
    .select('*');
  
  if (error) {
    console.error('Error fetching email accounts:', error);
    throw new Error('Failed to fetch email accounts');
  }
  
  return data;
};

export const getEmailAccountById = async (id: string): Promise<EmailAccount | undefined> => {
  const { data, error } = await supabase
    .from('email_accounts')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error(`Error fetching email account with id ${id}:`, error);
    return undefined;
  }
  
  return data;
};

export const createEmailAccount = async (account: Omit<EmailAccount, 'id' | 'status' | 'lastChecked' | 'user_id'>): Promise<EmailAccount> => {
  // First test the connection before saving
  const connectionResult = await testEmailConnection({
    id: 'temp-id',
    type: account.type,
    host: account.host,
    port: account.port,
    username: account.username,
    password: account.password,
    email: account.email,
    secure: account.secure
  });

  if (!connectionResult.success) {
    // If connection test fails, throw an error with the message
    throw new Error(connectionResult.message);
  }
  
  // Get the current user's ID from Supabase
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('Authentication required to create an email account');
  }
  
  // If connection is successful, create the account
  const { data, error } = await supabase
    .from('email_accounts')
    .insert([{
      ...account,
      user_id: user.id,
      status: 'connected',
      last_checked: new Date().toISOString(),
    }])
    .select()
    .single();
  
  if (error) {
    console.error('Error creating email account:', error);
    throw new Error('Failed to create email account');
  }
  
  // Format the response to match our EmailAccount type
  return {
    ...data,
    lastChecked: data.last_checked,
  } as unknown as EmailAccount;
};

export const updateEmailAccount = async (id: string, updates: Partial<EmailAccount>): Promise<EmailAccount | undefined> => {
  const { data, error } = await supabase
    .from('email_accounts')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error(`Error updating email account with id ${id}:`, error);
    return undefined;
  }
  
  // Format the response to match our EmailAccount type
  return {
    ...data,
    lastChecked: data.last_checked,
  } as unknown as EmailAccount;
};

export const deleteEmailAccount = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('email_accounts')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error(`Error deleting email account with id ${id}:`, error);
    return false;
  }
  
  return true;
};

// Test Email functionality moved to emailUtils.ts
export { testEmailConnection } from './emailUtils';
export { sendTestEmail } from './emailUtils';
