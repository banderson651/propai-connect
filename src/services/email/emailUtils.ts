
import { EmailTestResult } from '@/types/email';
import { supabase } from '@/integrations/supabase/client';

// Test Email Connection using the Supabase Edge Function
export const testEmailConnection = async (account: {
  type: 'IMAP' | 'POP3';
  host: string;
  port: number;
  username: string;
  password: string;
  email: string;
  secure?: boolean;
  id: string;
}): Promise<EmailTestResult> => {
  try {
    const { data, error } = await supabase.functions.invoke('test-email-connection', {
      body: {
        action: 'test-connection',
        type: account.type,
        host: account.host,
        port: account.port,
        username: account.username,
        password: account.password,
        email: account.email,
        secure: account.port === 993 || account.port === 995 || account.secure, // Standard secure ports
      },
    });

    if (error) {
      console.error('Error calling test-email-connection function:', error);
      return {
        success: false,
        message: `Error testing connection: ${error.message}`
      };
    }

    return data;
  } catch (error) {
    console.error('Exception in testEmailConnection:', error);
    return {
      success: false,
      message: `An unexpected error occurred: ${error.message || 'Unknown error'}`
    };
  }
};

export const sendTestEmail = async (accountId: string, account: {
  type: 'IMAP' | 'POP3';
  host: string;
  port: number;
  username: string;
  password: string;
  email: string;
  secure?: boolean;
}, recipient: string): Promise<EmailTestResult> => {
  if (!account) {
    return Promise.resolve({
      success: false,
      message: 'Email account not found'
    });
  }
  
  try {
    const { data, error } = await supabase.functions.invoke('test-email-connection', {
      body: {
        action: 'send-test-email',
        type: account.type,
        host: account.host,
        port: account.port,
        username: account.username,
        password: account.password,
        email: account.email,
        secure: account.port === 993 || account.port === 995 || account.secure, // Standard secure ports
        recipient: recipient,
      },
    });

    if (error) {
      console.error('Error calling send-test-email function:', error);
      return {
        success: false,
        message: `Error sending test email: ${error.message}`
      };
    }

    return data;
  } catch (error) {
    console.error('Exception in sendTestEmail:', error);
    return {
      success: false,
      message: `An unexpected error occurred: ${error.message || 'Unknown error'}`
    };
  }
};
