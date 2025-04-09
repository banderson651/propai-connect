
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';

interface EmailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  from?: string;
  attachments?: Array<{
    filename: string;
    content: string | Buffer;
    contentType?: string;
  }>;
}

// Enable DEBUG mode for detailed logging during email operations
const DEBUG_MODE = true;

export class EmailService {
  private accountId: string | null = null;
  private lastError: Error | null = null;
  private retryCount: number = 0;
  private maxRetries: number = 3;

  async initialize(accountId?: string) {
    try {
      if (accountId) {
        this.accountId = accountId;
        if (DEBUG_MODE) console.log(`[EmailService] Initialized with specific account ID: ${accountId}`);
        return;
      }
      
      // Get default email account from Supabase
      const { data: accounts, error } = await supabase
        .from('email_accounts')
        .select('*')
        .eq('is_default', true)
        .limit(1);

      if (error) {
        if (DEBUG_MODE) console.error('[EmailService] Error fetching default account:', error);
        throw error;
      }

      if (accounts && accounts.length > 0) {
        this.accountId = accounts[0].id;
        if (DEBUG_MODE) console.log(`[EmailService] Using default account ID: ${this.accountId}`);
      } else {
        const errorMsg = 'No default email account configured';
        if (DEBUG_MODE) console.error(`[EmailService] ${errorMsg}`);
        throw new Error(errorMsg);
      }
    } catch (error) {
      if (DEBUG_MODE) console.error('[EmailService] Failed to initialize email service:', error);
      this.lastError = error instanceof Error ? error : new Error(String(error));
      throw error;
    }
  }

  async sendEmail(options: EmailOptions, retryAttempt = 0) {
    try {
      if (!this.accountId) {
        if (DEBUG_MODE) console.log('[EmailService] No account set, initializing default account');
        await this.initialize();
      }

      if (DEBUG_MODE) {
        console.log(`[EmailService] Sending email to: ${Array.isArray(options.to) ? options.to.join(', ') : options.to}`);
        console.log(`[EmailService] Subject: ${options.subject}`);
      }

      // Prepare recipients
      const recipients = Array.isArray(options.to) ? options.to : [options.to];
      
      // Generate message ID for tracking
      const messageId = `<${Date.now()}-${Math.random().toString(36).substring(2, 15)}@vamkor.com>`;

      // Use Promise with timeout instead of AbortController
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Email sending timed out after 30 seconds')), 30000);
      });
      
      if (DEBUG_MODE) console.log('[EmailService] Invoking SMTP edge function');
      
      try {
        const resultPromise = supabase.functions.invoke('send-email-smtp', {
          body: {
            to: recipients,
            subject: options.subject,
            text: options.text,
            html: options.html,
            from: options.from,
            attachments: options.attachments,
            accountId: this.accountId
          }
        }).then(async response => {
          if (response.error) {
            if (DEBUG_MODE) console.error('[EmailService] Edge function error:', response.error);
            throw response.error;
          }
          
          if (DEBUG_MODE) console.log('[EmailService] Edge function response:', response.data);
          
          if (!response.data.success) {
            if (DEBUG_MODE) console.error('[EmailService] Email sending failed:', response.data.message);
            throw new Error(response.data.message);
          }
  
          // Log successful email
          await supabase.from('email_logs').insert({
            recipient: Array.isArray(options.to) ? options.to.join(', ') : options.to,
            subject: options.subject,
            status: 'sent',
            email_account_id: this.accountId,
            message_id: messageId
          });
  
          // Reset retry count on success
          this.retryCount = 0;
          this.lastError = null;
  
          return { success: true, message: 'Email sent successfully', messageId };
        });
        
        return await Promise.race([resultPromise, timeoutPromise]);
      } catch (fetchError) {
        if (fetchError.message?.includes('timed out')) {
          const timeoutMsg = 'Email sending timed out after 30 seconds';
          if (DEBUG_MODE) console.error(`[EmailService] ${timeoutMsg}`);
          throw new Error(timeoutMsg);
        }
        
        throw fetchError;
      }
    } catch (error) {
      if (DEBUG_MODE) console.error('[EmailService] Error sending email:', error);
      
      this.lastError = error instanceof Error ? error : new Error(String(error));
      
      // Log failed email
      if (this.accountId) {
        try {
          await supabase.from('email_logs').insert({
            recipient: Array.isArray(options.to) ? options.to.join(', ') : options.to,
            subject: options.subject,
            status: 'failed',
            error: error instanceof Error ? error.message : 'Unknown error',
            email_account_id: this.accountId
          });
        } catch (logError) {
          if (DEBUG_MODE) console.error('[EmailService] Error logging failed email:', logError);
        }
      }

      // Implement retry with exponential backoff if under max retries
      if (retryAttempt < this.maxRetries) {
        const nextRetryAttempt = retryAttempt + 1;
        const backoffMs = Math.pow(2, nextRetryAttempt) * 1000; // Exponential backoff
        
        if (DEBUG_MODE) {
          console.log(`[EmailService] Retrying (${nextRetryAttempt}/${this.maxRetries}) in ${backoffMs}ms`);
        }
        
        // Show toast about retry
        toast({
          title: `Email Sending Retry (${nextRetryAttempt}/${this.maxRetries})`,
          description: `Retrying in ${backoffMs/1000} seconds...`,
        });
        
        return new Promise((resolve, reject) => {
          setTimeout(async () => {
            try {
              const result = await this.sendEmail(options, nextRetryAttempt);
              resolve(result);
            } catch (retryError) {
              reject(retryError);
            }
          }, backoffMs);
        });
      }

      // All retries failed
      toast({
        title: "Email Sending Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });

      throw error;
    }
  }
  
  // Method to set a specific account for sending
  setAccount(accountId: string) {
    if (DEBUG_MODE) console.log(`[EmailService] Setting account ID to: ${accountId}`);
    this.accountId = accountId;
  }
  
  // Get the last error that occurred
  getLastError() {
    return this.lastError;
  }
  
  // Method to check connection status
  async checkConnection() {
    try {
      if (!this.accountId) {
        await this.initialize();
      }
      
      const { data: account, error } = await supabase
        .from('email_accounts')
        .select('*')
        .eq('id', this.accountId)
        .single();
        
      if (error) throw error;
      if (!account) throw new Error('Email account not found');
      
      const testResult = await this.testConnection(account);
      return testResult;
      
    } catch (error) {
      if (DEBUG_MODE) console.error('[EmailService] Error checking connection:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error checking connection'
      };
    }
  }
  
  // Method to test connection with current account
  private async testConnection(account: any) {
    try {
      // We'll use our SMTP edge function to test the connection
      const { data, error } = await supabase.functions.invoke('send-email-smtp', {
        body: {
          to: "test@example.com",
          subject: "Test Connection",
          text: "This is a test to verify the connection.",
          accountId: this.accountId,
          dryRun: true // This tells the function to just test connection without sending
        }
      });
      
      if (error) throw error;
      return data;
      
    } catch (error) {
      if (DEBUG_MODE) console.error('[EmailService] Error testing connection:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error testing connection'
      };
    }
  }
}

// Create singleton instance
const emailService = new EmailService();

// Export the instance as default
export default emailService;
