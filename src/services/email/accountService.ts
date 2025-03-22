import { EmailAccount, EmailAccountType, EmailTestResult } from '@/types/email';
import { supabase } from '@/lib/supabase';
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
    lastChecked: account.last_checked,
    type: account.type as EmailAccountType,
    status: account.status as 'connected' | 'disconnected' | 'error'
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
    lastChecked: data.last_checked,
    type: data.type as EmailAccountType,
    status: data.status as 'connected' | 'disconnected' | 'error'
  } : undefined;
};

export const createEmailAccount = async (account: Omit<EmailAccount, 'id' | 'status' | 'lastChecked' | 'user_id'>): Promise<EmailAccount> => {
  try {
    console.log('Testing email connection...');
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
      console.error('Connection test failed:', connectionResult.message);
      throw new Error(connectionResult.message);
    }
    
    console.log('Getting user...');
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error('No authenticated user found');
      throw new Error('Authentication required to create an email account');
    }
    
    console.log('Preparing account data...');
    const accountData = {
      ...account,
      user_id: user.id,
      status: 'connected',
      last_checked: new Date().toISOString(),
      smtp_host: account.smtp_host || account.host,
      smtp_port: account.smtp_port || account.port,
      smtp_secure: account.smtp_secure ?? account.secure,
      smtp_username: account.smtp_username || account.username,
      smtp_password: account.smtp_password || account.password
    };
    
    console.log('Inserting account data:', { ...accountData, password: '[REDACTED]' });
    const { data, error } = await supabase
      .from('email_accounts')
      .insert([accountData])
      .select()
      .single();
    
    if (error) {
      console.error('Supabase error:', error);
      throw new Error(`Failed to create email account: ${error.message}`);
    }
    
    console.log('Account created successfully');
    return {
      ...data,
      lastChecked: data.last_checked,
      type: data.type as EmailAccountType,
      status: data.status as 'connected' | 'disconnected' | 'error'
    };
  } catch (error) {
    console.error('Error in createEmailAccount:', error);
    throw error;
  }
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
    lastChecked: data.last_checked,
    type: data.type as EmailAccountType,
    status: data.status as 'connected' | 'disconnected' | 'error'
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

export { testEmailConnection, sendTestEmail } from './emailUtils';

export class EmailAccountService {
  private static instance: EmailAccountService;
  private constructor() {}

  public static getInstance(): EmailAccountService {
    if (!EmailAccountService.instance) {
      EmailAccountService.instance = new EmailAccountService();
    }
    return EmailAccountService.instance;
  }

  async createAccount(account: EmailAccountCreate): Promise<EmailAccount> {
    try {
      // Validate email format
      const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
      if (!emailRegex.test(account.email)) {
        throw new Error('Invalid email format');
      }

      // Validate ports
      if (account.imap_port < 1 || account.imap_port > 65535) {
        throw new Error('Invalid IMAP port');
      }
      if (account.smtp_port < 1 || account.smtp_port > 65535) {
        throw new Error('Invalid SMTP port');
      }

      // If this is the first account or is_default is true, set it as default
      const { data: existingAccounts } = await supabase
        .from('email_accounts')
        .select('id')
        .eq('is_default', true);

      const isDefault = existingAccounts?.length === 0 || account.is_default;

      const { data, error } = await supabase
        .from('email_accounts')
        .insert({
          ...account,
          is_default: isDefault,
          is_active: true,
          sync_frequency: account.sync_frequency || 5,
          max_emails_per_sync: account.max_emails_per_sync || 100
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating email account:', error);
      throw error;
    }
  }

  async updateAccount(id: string, updates: EmailAccountUpdate): Promise<EmailAccount> {
    try {
      // If setting as default, unset other default accounts
      if (updates.is_default) {
        await supabase
          .from('email_accounts')
          .update({ is_default: false })
          .neq('id', id);
      }

      const { data, error } = await supabase
        .from('email_accounts')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating email account:', error);
      throw error;
    }
  }

  async deleteAccount(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('email_accounts')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting email account:', error);
      throw error;
    }
  }

  async getAccounts(): Promise<EmailAccount[]> {
    try {
      const { data, error } = await supabase
        .from('email_accounts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching email accounts:', error);
      throw error;
    }
  }

  async getDefaultAccount(): Promise<EmailAccount | null> {
    try {
      const { data, error } = await supabase
        .from('email_accounts')
        .select('*')
        .eq('is_default', true)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching default email account:', error);
      throw error;
    }
  }

  async testConnection(account: EmailAccount): Promise<EmailTestResult[]> {
    const results: EmailTestResult[] = [];

    // Test IMAP connection
    try {
      const imapResult = await this.testImapConnection(account);
      results.push(imapResult);
    } catch (error) {
      results.push({
        success: false,
        message: 'IMAP connection failed',
        details: {
          type: 'IMAP',
          host: account.imap_host,
          port: account.imap_port,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      });
    }

    // Test SMTP connection
    try {
      const smtpResult = await this.testSmtpConnection(account);
      results.push(smtpResult);
    } catch (error) {
      results.push({
        success: false,
        message: 'SMTP connection failed',
        details: {
          type: 'SMTP',
          host: account.smtp_host,
          port: account.smtp_port,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      });
    }

    return results;
  }

  private async testImapConnection(account: EmailAccount): Promise<EmailTestResult> {
    // Implementation will be added in the next step
    throw new Error('Not implemented');
  }

  private async testSmtpConnection(account: EmailAccount): Promise<EmailTestResult> {
    // Implementation will be added in the next step
    throw new Error('Not implemented');
  }
}
