
import type { Transporter } from 'nodemailer';
import { supabase } from '@/lib/supabase';

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

export class EmailService {
  private accountId: string | null = null;

  async initialize(accountId?: string) {
    try {
      if (accountId) {
        this.accountId = accountId;
        return;
      }
      
      // Get default email account from Supabase
      const { data: accounts, error } = await supabase
        .from('email_accounts')
        .select('*')
        .eq('is_default', true)
        .limit(1);

      if (error) throw error;

      if (accounts && accounts.length > 0) {
        this.accountId = accounts[0].id;
      } else {
        throw new Error('No default email account configured');
      }
    } catch (error) {
      console.error('Failed to initialize email service:', error);
      throw error;
    }
  }

  async sendEmail(options: EmailOptions) {
    try {
      if (!this.accountId) {
        await this.initialize();
      }

      // Get the email account details
      const { data: account, error } = await supabase
        .from('email_accounts')
        .select('*')
        .eq('id', this.accountId)
        .single();

      if (error) throw error;
      if (!account) throw new Error('Email account not found');

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

      // Prepare recipients
      const recipients = Array.isArray(options.to) ? options.to : [options.to];
      
      // Use the account's email as the default from address if not provided
      const fromEmail = options.from || `${account.name} <${account.email}>`;

      // Call the Edge Function to send the email
      const { data, error: sendError } = await supabase.functions.invoke('send-email', {
        body: {
          to: recipients.join(','),
          subject: options.subject,
          text: options.text,
          html: options.html,
          from: fromEmail,
          attachments: options.attachments,
          smtp: smtpConfig
        }
      });

      if (sendError) throw sendError;
      if (!data.success) throw new Error(data.message);

      // Log successful email
      await supabase.from('email_logs').insert({
        to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
        subject: options.subject,
        status: 'success',
        account_id: this.accountId
      });

      return { success: true, message: 'Email sent successfully' };
    } catch (error) {
      console.error('Error sending email:', error);
      
      // Log failed email
      if (this.accountId) {
        await supabase.from('email_logs').insert({
          to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
          subject: options.subject,
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error',
          account_id: this.accountId
        });
      }

      throw error;
    }
  }
  
  // Method to set a specific account for sending
  setAccount(accountId: string) {
    this.accountId = accountId;
  }
}

// Create singleton instance
const emailService = new EmailService();

// Export the instance as default
export default emailService;
