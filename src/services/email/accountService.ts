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
  
  return data.map(account => ({
    ...account,
    lastChecked: account.last_checked
  }));
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
  
  return data ? {
    ...data,
    lastChecked: data.last_checked
  } : undefined;
};

export const createEmailAccount = async (account: Omit<EmailAccount, 'id' | 'status' | 'lastChecked' | 'user_id'>): Promise<EmailAccount> => {
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
    throw new Error(connectionResult.message);
  }
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('Authentication required to create an email account');
  }
  
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
  
  return {
    ...data,
    lastChecked: data.last_checked,
  } as unknown as EmailAccount;
};

export const updateEmailAccount = async (id: string, updates: Partial<EmailAccount>): Promise<EmailAccount | undefined> => {
  const dbUpdates = {
    ...updates,
    last_checked: updates.lastChecked || updates.last_checked,
    updated_at: new Date().toISOString(),
  };

  if ('lastChecked' in dbUpdates) {
    delete dbUpdates.lastChecked;
  }

  const { data, error } = await supabase
    .from('email_accounts')
    .update(dbUpdates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error(`Error updating email account with id ${id}:`, error);
    return undefined;
  }
  
  return {
    ...data,
    lastChecked: data.last_checked
  };
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

export { testEmailConnection } from './emailUtils';
export { sendTestEmail } from './emailUtils';
