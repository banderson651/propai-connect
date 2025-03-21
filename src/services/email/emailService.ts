import nodemailer from 'nodemailer';
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
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

export class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  async initialize() {
    try {
      // Get email settings from Supabase
      const { data: settings, error } = await supabase
        .from('email_settings')
        .select('*')
        .single();

      if (error) throw error;

      if (!settings) {
        throw new Error('Email settings not configured');
      }

      // Create transporter
      this.transporter = nodemailer.createTransport({
        host: settings.smtp_host,
        port: settings.smtp_port,
        secure: settings.smtp_secure,
        auth: {
          user: settings.smtp_user,
          pass: settings.smtp_password,
        },
      });

      // Verify connection
      await this.transporter.verify();
    } catch (error) {
      console.error('Failed to initialize email service:', error);
      throw error;
    }
  }

  async sendEmail(options: EmailOptions) {
    if (!this.transporter) {
      await this.initialize();
    }

    try {
      const result = await this.transporter!.sendMail({
        from: process.env.EMAIL_FROM || 'noreply@propai.com',
        ...options,
      });

      // Log successful email
      await supabase.from('email_logs').insert({
        to: options.to,
        subject: options.subject,
        status: 'success',
        message_id: result.messageId,
      });

      return result;
    } catch (error) {
      // Log failed email
      await supabase.from('email_logs').insert({
        to: options.to,
        subject: options.subject,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      throw error;
    }
  }
}

// Create and export a singleton instance
const emailService = new EmailService();
export default emailService; 