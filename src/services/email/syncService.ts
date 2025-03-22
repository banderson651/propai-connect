import { EmailAccount } from '@/types/email';
import { EmailAccountService } from './accountService';
import { supabase } from '@/lib/supabase';
import { ImapClient } from 'https://deno.land/x/imap@v0.1.0/mod.ts';

interface EmailMessage {
  id: string;
  uid: number;
  subject: string;
  from: string;
  to: string;
  date: Date;
  text: string;
  html?: string;
  attachments: Array<{
    filename: string;
    contentType: string;
    size: number;
    data: Buffer;
  }>;
}

interface SyncResult {
  success: boolean;
  message: string;
  syncedCount: number;
  errors?: string[];
}

export class EmailSyncService {
  private static instance: EmailSyncService;
  private syncIntervals: Map<string, NodeJS.Timeout> = new Map();

  private constructor() {}

  public static getInstance(): EmailSyncService {
    if (!EmailSyncService.instance) {
      EmailSyncService.instance = new EmailSyncService();
    }
    return EmailSyncService.instance;
  }

  async startSync(account: EmailAccount): Promise<SyncResult> {
    try {
      // Stop any existing sync for this account
      await this.stopSync(account.id);

      // Perform initial sync
      const result = await this.syncEmails(account);

      // Set up interval for periodic sync
      const interval = setInterval(
        () => this.syncEmails(account),
        account.sync_frequency * 60 * 1000 // Convert minutes to milliseconds
      );

      this.syncIntervals.set(account.id, interval);

      return result;
    } catch (error) {
      return {
        success: false,
        message: 'Failed to start email sync',
        syncedCount: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  async stopSync(accountId: string): Promise<void> {
    const interval = this.syncIntervals.get(accountId);
    if (interval) {
      clearInterval(interval);
      this.syncIntervals.delete(accountId);
    }
  }

  async syncEmails(account: EmailAccount): Promise<SyncResult> {
    const client = new ImapClient({
      host: account.imap_host,
      port: account.imap_port,
      secure: account.imap_secure,
      auth: {
        user: account.imap_username,
        pass: account.imap_password,
      },
    });

    try {
      await client.connect();
      await client.login();

      // Select the INBOX
      await client.select('INBOX');

      // Get the last sync time
      const lastSync = account.last_sync_at ? new Date(account.last_sync_at) : null;

      // Search for new messages since last sync
      const searchCriteria = lastSync
        ? ['SINCE', lastSync.toISOString()]
        : ['ALL'];

      const messages = await client.search(searchCriteria);
      const syncedCount = Math.min(messages.length, account.max_emails_per_sync);

      const errors: string[] = [];

      // Process messages
      for (let i = 0; i < syncedCount; i++) {
        try {
          const message = await this.fetchMessage(client, messages[i]);
          await this.saveMessage(account.id, message);
        } catch (error) {
          errors.push(`Failed to process message ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      // Update last sync time
      await this.updateLastSync(account.id);

      return {
        success: errors.length === 0,
        message: `Synced ${syncedCount} messages${errors.length > 0 ? ` with ${errors.length} errors` : ''}`,
        syncedCount,
        errors: errors.length > 0 ? errors : undefined
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to sync emails',
        syncedCount: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    } finally {
      try {
        await client.logout();
      } catch (error) {
        console.error('Error logging out from IMAP:', error);
      }
    }
  }

  private async fetchMessage(client: ImapClient, uid: number): Promise<EmailMessage> {
    const message = await client.fetchOne(uid, {
      envelope: true,
      bodyStructure: true,
      source: true,
    });

    return {
      id: message.uid.toString(),
      uid: message.uid,
      subject: message.envelope.subject || '',
      from: message.envelope.from?.[0]?.address || '',
      to: message.envelope.to?.[0]?.address || '',
      date: message.envelope.date || new Date(),
      text: message.source.toString(),
      html: message.source.toString(),
      attachments: [], // Implement attachment handling if needed
    };
  }

  private async saveMessage(accountId: string, message: EmailMessage): Promise<void> {
    const { error } = await supabase
      .from('email_messages')
      .insert({
        account_id: accountId,
        message_id: message.id,
        uid: message.uid,
        subject: message.subject,
        from: message.from,
        to: message.to,
        date: message.date.toISOString(),
        text: message.text,
        html: message.html,
      });

    if (error) throw error;
  }

  private async updateLastSync(accountId: string): Promise<void> {
    const { error } = await supabase
      .from('email_accounts')
      .update({ last_sync_at: new Date().toISOString() })
      .eq('id', accountId);

    if (error) throw error;
  }
} 