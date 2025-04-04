import { EmailAccount } from '@/types/email';
import { supabase } from '@/lib/supabase';

export class EmailSyncService {
  private static instance: EmailSyncService | null = null;
  
  private constructor() {
    // Private constructor for singleton pattern
  }
  
  public static getInstance(): EmailSyncService {
    if (!EmailSyncService.instance) {
      EmailSyncService.instance = new EmailSyncService();
    }
    return EmailSyncService.instance;
  }
  
  async syncEmails(accountId: string): Promise<boolean> {
    try {
      console.log(`Syncing emails for account ${accountId}`);
      // In a real implementation, this would connect to the email server
      // and sync emails to the database
      
      // For now, we'll just simulate success
      return true;
    } catch (error) {
      console.error('Error syncing emails:', error);
      return false;
    }
  }
  
  async syncAllAccounts(): Promise<{ success: number; failed: number }> {
    try {
      const { data: accounts, error } = await supabase
        .from('email_accounts')
        .select('*')
        .eq('is_active', true);
        
      if (error) throw error;
      
      let success = 0;
      let failed = 0;
      
      for (const account of accounts) {
        const result = await this.syncEmails(account.id);
        if (result) {
          success++;
        } else {
          failed++;
        }
      }
      
      return { success, failed };
    } catch (error) {
      console.error('Error syncing all accounts:', error);
      return { success: 0, failed: 0 };
    }
  }
  
  async getLastSyncTime(accountId: string): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('email_accounts')
        .select('last_sync_at')
        .eq('id', accountId)
        .single();
        
      if (error) throw error;
      
      return data.last_sync_at;
    } catch (error) {
      console.error('Error getting last sync time:', error);
      return null;
    }
  }
  
  async updateLastSyncTime(accountId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('email_accounts')
        .update({ last_sync_at: new Date().toISOString() })
        .eq('id', accountId);
        
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Error updating last sync time:', error);
      return false;
    }
  }
}
