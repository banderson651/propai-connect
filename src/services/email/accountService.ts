
import { supabase } from '@/lib/supabase';
import { EmailAccount, EmailAccountStatus, EmailAccountType } from '@/types/email';

const toBoolean = (value: boolean | string | null | undefined): boolean => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') return value.toLowerCase() === 'true';
  return false;
};

// Get all email accounts for the current user
export const getEmailAccounts = async (): Promise<EmailAccount[]> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('email_accounts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    return (data || []).map(account => ({
      id: account.id,
      user_id: account.user_id,
      email: account.email,
      name: account.name,
      provider: 'Custom',
      type: account.type as EmailAccountType,
      status: account.status as EmailAccountStatus,
      created_at: account.created_at,
      updated_at: account.updated_at,
      last_checked: account.last_checked,
      host: account.host,
      port: account.port,
      secure: Boolean(account.secure),
      smtp_secure: Boolean(account.smtp_secure),
      username: account.username,
      is_active: toBoolean(account.is_active),
      is_default: toBoolean(account.is_default),
      domain_verified: Boolean(account.domain_verified)
    })) as EmailAccount[];
  } catch (error) {
    console.error('Error fetching email accounts:', error);
    return [];
  }
};

// Create a new email account
export const createEmailAccount = async (account: Omit<EmailAccount, 'id' | 'created_at' | 'updated_at'>): Promise<EmailAccount | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('email_accounts')
      .insert({
        user_id: user.id,
        email: account.email,
        name: account.name,
        type: account.type,
        host: account.host,
        port: account.port,
        secure: account.secure,
        smtp_secure: account.smtp_secure,
        username: account.username,
        status: account.status,
        is_active: account.is_active,
        is_default: account.is_default,
        domain_verified: account.domain_verified
      })
      .select()
      .single();
      
    if (error) throw error;
    
    return {
      id: data.id,
      user_id: data.user_id,
      email: data.email,
      name: data.name,
      provider: 'Custom',
      type: data.type as EmailAccountType,
      status: data.status as EmailAccountStatus,
      created_at: data.created_at,
      updated_at: data.updated_at,
      last_checked: data.last_checked,
      host: data.host,
      port: data.port,
      secure: Boolean(data.secure),
      smtp_secure: Boolean(data.smtp_secure),
      username: data.username,
      is_active: toBoolean(data.is_active),
      is_default: toBoolean(data.is_default),
      domain_verified: Boolean(data.domain_verified)
    } as EmailAccount;
  } catch (error) {
    console.error('Error creating email account:', error);
    return null;
  }
};

// Update an email account
export const updateEmailAccount = async (id: string, updates: Partial<Omit<EmailAccount, 'id' | 'created_at' | 'updated_at'>>): Promise<EmailAccount | null> => {
  try {
    const updateData: any = {};
    
    if (updates.email !== undefined) updateData.email = updates.email;
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.type !== undefined) updateData.type = updates.type;
    if (updates.host !== undefined) updateData.host = updates.host;
    if (updates.port !== undefined) updateData.port = updates.port;
    if (updates.secure !== undefined) updateData.secure = updates.secure;
    if (updates.smtp_secure !== undefined) updateData.smtp_secure = updates.smtp_secure;
    if (updates.username !== undefined) updateData.username = updates.username;
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.is_active !== undefined) updateData.is_active = updates.is_active;
    if (updates.is_default !== undefined) updateData.is_default = updates.is_default;
    if (updates.domain_verified !== undefined) updateData.domain_verified = updates.domain_verified;
    
    const { data, error } = await supabase
      .from('email_accounts')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
      
    if (error) throw error;
    
    return {
      id: data.id,
      user_id: data.user_id,
      email: data.email,
      name: data.name,
      provider: 'Custom',
      type: data.type as EmailAccountType,
      status: data.status as EmailAccountStatus,
      created_at: data.created_at,
      updated_at: data.updated_at,
      last_checked: data.last_checked,
      host: data.host,
      port: data.port,
      secure: Boolean(data.secure),
      smtp_secure: Boolean(data.smtp_secure),
      username: data.username,
      is_active: toBoolean(data.is_active),
      is_default: toBoolean(data.is_default),
      domain_verified: Boolean(data.domain_verified)
    } as EmailAccount;
  } catch (error) {
    console.error('Error updating email account:', error);
    return null;
  }
};

// Delete an email account
export const deleteEmailAccount = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('email_accounts')
      .delete()
      .eq('id', id);
      
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting email account:', error);
    return false;
  }
};

// EmailAccountService class for compatibility
export class EmailAccountService {
  private static instance: EmailAccountService;

  static getInstance(): EmailAccountService {
    if (!EmailAccountService.instance) {
      EmailAccountService.instance = new EmailAccountService();
    }
    return EmailAccountService.instance;
  }

  async getAccounts(): Promise<EmailAccount[]> {
    return getEmailAccounts();
  }

  async createAccount(account: Omit<EmailAccount, 'id' | 'created_at' | 'updated_at'>): Promise<EmailAccount | null> {
    return createEmailAccount(account);
  }

  async updateAccount(id: string, updates: Partial<Omit<EmailAccount, 'id' | 'created_at' | 'updated_at'>>): Promise<EmailAccount | null> {
    return updateEmailAccount(id, updates);
  }

  async deleteAccount(id: string): Promise<boolean> {
    return deleteEmailAccount(id);
  }
}
