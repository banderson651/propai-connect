
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

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

      // Get the email account details
      const { data: account, error } = await supabase
        .from('email_accounts')
        .select('*')
        .eq('id', this.accountId)
        .single();

      if (error) {
        if (DEBUG_MODE) console.error('[EmailService] Error fetching account details:', error);
        throw error;
      }
      if (!account) {
        const errorMsg = `Email account with ID ${this.accountId} not found`;
        if (DEBUG_MODE) console.error(`[EmailService] ${errorMsg}`);
        throw new Error(errorMsg);
      }

      // Verify account has required SMTP fields
      if (!account.smtp_host || !account.smtp_port || !account.smtp_username || !account.smtp_password) {
        const errorMsg = 'Email account is missing required SMTP configuration';
        if (DEBUG_MODE) console.error(`[EmailService] ${errorMsg}`, {
          hasHost: !!account.smtp_host,
          hasPort: !!account.smtp_port,
          hasUsername: !!account.smtp_username,
          hasPassword: !!account.smtp_password
        });
        throw new Error(errorMsg);
      }

      // Set up SMTP configuration
      const smtpConfig = {
        host: account.smtp_host,
        port: account.smtp_port,
        secure: account.smtp_secure,
        auth: {
          user: account.smtp_username,
          pass: account.smtp_password
        }
      };

      if (DEBUG_MODE) {
        console.log('[EmailService] SMTP Config:', {
          host: smtpConfig.host,
          port: smtpConfig.port,
          secure: smtpConfig.secure,
          auth: { user: smtpConfig.auth.user, pass: '********' }
        });
      }

      // Prepare recipients
      const recipients = Array.isArray(options.to) ? options.to : [options.to];
      
      // Use the account's email as the default from address if not provided
      const fromEmail = options.from || `${account.name} <${account.email}>`;

      // Generate message ID for tracking
      const messageId = `<${Date.now()}-${Math.random().toString(36).substring(2, 15)}@${account.smtp_host}>`;

      // Call the Edge Function to send the email with timeout handling
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30-second timeout
      
      if (DEBUG_MODE) console.log('[EmailService] Invoking edge function with controller');
      
      try {
        const { data, error: sendError } = await supabase.functions.invoke('send-email', {
          body: {
            to: recipients.join(','),
            subject: options.subject,
            text: options.text,
            html: options.html,
            from: fromEmail,
            attachments: options.attachments,
            messageId: messageId,
            smtp: smtpConfig
          },
          signal: controller.signal
        });

        clearTimeout(timeoutId);
        
        if (sendError) {
          if (DEBUG_MODE) console.error('[EmailService] Edge function error:', sendError);
          throw sendError;
        }
        
        if (DEBUG_MODE) console.log('[EmailService] Edge function response:', data);
        
        if (!data.success) {
          if (DEBUG_MODE) console.error('[EmailService] Email sending failed:', data.message);
          throw new Error(data.message);
        }

        // Log successful email
        await supabase.from('email_logs').insert({
          to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
          subject: options.subject,
          status: 'success',
          account_id: this.accountId,
          message_id: messageId
        });

        // Reset retry count on success
        this.retryCount = 0;
        this.lastError = null;

        return { success: true, message: 'Email sent successfully', messageId };
      } catch (fetchError) {
        clearTimeout(timeoutId);
        
        if (fetchError.name === 'AbortError') {
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
            to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
            subject: options.subject,
            status: 'failed',
            error: error instanceof Error ? error.message : 'Unknown error',
            account_id: this.accountId
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
      const { data, error } = await supabase.functions.invoke('test-email-connection', {
        body: {
          config: {
            type: 'smtp',
            host: account.smtp_host,
            port: account.smtp_port,
            username: account.smtp_username,
            password: account.smtp_password,
            secure: account.smtp_secure
          }
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
