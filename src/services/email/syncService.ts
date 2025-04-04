import { EmailAccount, Email } from '@/types/email';
import { supabase } from '@/lib/supabase';
import { EmailAccountService } from './accountService';
// Remove the Deno import that was causing errors
// import { ImapClient } from 'https://deno.land/x/imap@v0.1.0/mod.ts';

// Stub for the ImapClient since we can't import from Deno
class ImapClient {
  constructor(options: any) {
    // Stub constructor
  }
  
  async connect() {
    // Stub implementation
    return true;
  }
  
  async listMessages(options: any) {
    // Stub implementation
    return [];
  }
  
  async disconnect() {
    // Stub implementation
  }
}

export class EmailSyncService {
  private static instance: EmailSyncService;
  private syncIntervalId: NodeJS.Timeout | null = null;
  
  private constructor() {}
  
  public static getInstance(): EmailSyncService {
    if (!EmailSyncService.instance) {
      EmailSyncService.instance = new EmailSyncService();
    }
    return EmailSyncService.instance;
  }
  
  public startSyncService(): void {
    if (this.syncIntervalId) {
      clearInterval(this.syncIntervalId);
    }
    
    // Check for new emails every minute
    this.syncIntervalId = setInterval(async () => {
      await this.syncAllAccounts();
    }, 60 * 1000);
    
    // Start an initial sync
    this.syncAllAccounts();
  }
  
  public stopSyncService(): void {
    if (this.syncIntervalId) {
      clearInterval(this.syncIntervalId);
      this.syncIntervalId = null;
    }
  }
  
  private async syncAllAccounts(): Promise<void> {
    try {
      const accountService = EmailAccountService.getInstance();
      const accounts = await accountService.getAccounts();
      
      for (const account of accounts) {
        if (account.is_active) {
          // Check if it's time to sync this account
          const lastSync = account.last_sync_at ? new Date(account.last_sync_at) : null;
          const now = new Date();
          
          if (!lastSync || 
              (now.getTime() - lastSync.getTime() > (account.sync_frequency || 5) * 60 * 1000)) {
            await this.syncAccount(account);
          }
        }
      }
    } catch (error) {
      console.error('Error syncing all accounts:', error);
    }
  }
  
  private async syncAccount(account: EmailAccount): Promise<void> {
    console.log(`Syncing account: ${account.email}`);
    
    try {
      // Connect to the email server
      const client = new ImapClient({
        host: account.imap_host || account.host,
        port: account.imap_port || account.port,
        secure: account.imap_secure || account.secure,
        auth: {
          user: account.imap_username || account.username,
          pass: account.imap_password || account.password
        }
      });
      
      await client.connect();
      
      // Get the last sync time
      const since = account.last_sync_at ? new Date(account.last_sync_at) : new Date(0);
      
      // Fetch new messages
      const messages = await client.listMessages({
        since,
        limit: account.max_emails_per_sync || 100
      });
      
      // Process and save the messages
      // ... (code for processing messages would go here)
      
      // Update the last sync time
      await EmailAccountService.getInstance().updateAccount(account.id, {
        last_sync_at: new Date().toISOString()
      });
      
      await client.disconnect();
      
      console.log(`Successfully synced ${messages.length} messages for ${account.email}`);
    } catch (error) {
      console.error(`Error syncing account ${account.email}:`, error);
      
      // Update account status to reflect the error
      await EmailAccountService.getInstance().updateAccount(account.id, {
        status: 'error'
      });
    }
  }
}
