
import { supabase } from '@/lib/supabase';
import { EmailAccount } from '@/types/email';

export class EmailAccountService {
  private static instance: EmailAccountService;

  static getInstance(): EmailAccountService {
    if (!EmailAccountService.instance) {
      EmailAccountService.instance = new EmailAccountService();
    }
    return EmailAccountService.instance;
  }

  async getAccounts(): Promise<EmailAccount[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('email_accounts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async createAccount(account: EmailAccount): Promise<EmailAccount> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('email_accounts')
      .insert([{ ...account, user_id: user.id }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateAccount(id: string, account: Partial<EmailAccount>): Promise<EmailAccount> {
    const { data, error } = await supabase
      .from('email_accounts')
      .update(account)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteAccount(id: string): Promise<void> {
    const { error } = await supabase
      .from('email_accounts')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
}
