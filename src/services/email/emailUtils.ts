import { EmailAccount, EmailTestResult } from '@/types/email';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/use-toast';

// Function to test email connectivity
export const testEmailConnection = async (params: {
  id: string;
  type: "IMAP" | "POP3";
  host: string;
  port: number;
  username: string;
  password: string;
  email: string;
  secure?: boolean;
}): Promise<EmailTestResult> => {
  try {
    // Show testing notification
    toast({
      title: "Testing connection",
      description: "Please wait while we verify your email settings...",
    });
    
    // Call Supabase Edge Function to test connection
    const { data, error } = await supabase.functions.invoke('test-email-connection', {
      body: {
        action: 'test-connection',
        type: params.type,
        host: params.host,
        port: params.port,
        username: params.username,
        password: params.password,
        email: params.email,
        secure: params.secure ?? true
      }
    });
    
    if (error) {
      console.error('Error calling test-email-connection function:', error);
      return {
        success: false,
        message: error.message || 'Failed to connect to email server'
      };
    }
    
    return data as EmailTestResult;
  } catch (error) {
    console.error('Exception in testEmailConnection:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

// Function to send a test email
export const sendTestEmail = async (account: EmailAccount, to: string): Promise<EmailTestResult> => {
  try {
    // Validate recipient
    if (!to) {
      return {
        success: false,
        message: 'Recipient email address is required'
      };
    }
    
    // Check if email format is valid
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      return {
        success: false,
        message: 'Invalid recipient email format'
      };
    }
    
    // Show sending notification
    toast({
      title: "Sending test email",
      description: `Sending email to ${to}...`,
    });
    
    // Call Supabase Edge Function to send test email
    const { data, error } = await supabase.functions.invoke('test-email-connection', {
      body: {
        action: 'send-test-email',
        type: account.type,
        host: account.host,
        port: account.port,
        username: account.username,
        password: account.password,
        email: account.email,
        secure: account.secure ?? true,
        recipient: to
      }
    });
    
    if (error) {
      console.error('Error calling test-email-connection function:', error);
      toast({
        title: "Error",
        description: error.message || 'Failed to send test email',
        variant: "destructive",
      });
      
      return {
        success: false,
        message: error.message || 'Failed to send test email'
      };
    }
    
    toast({
      title: "Success",
      description: `Email sent to ${to}`,
      variant: "default",
    });
    
    return data as EmailTestResult;
  } catch (error) {
    console.error('Exception in sendTestEmail:', error);
    
    toast({
      title: "Error",
      description: error instanceof Error ? error.message : 'Unknown error occurred',
      variant: "destructive",
    });
    
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};
