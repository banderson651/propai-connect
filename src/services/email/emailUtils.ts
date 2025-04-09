
import { EmailAccount, EmailTestResult } from '@/types/email';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';

// Utility function to add DEBUG output when in debug mode
const DEBUG_MODE = true; // Set to true to enable detailed diagnostic logging
const debugLog = (message: string, data?: any) => {
  if (DEBUG_MODE) {
    if (data) {
      console.log(`[EMAIL-DEBUG] ${message}`, data);
    } else {
      console.log(`[EMAIL-DEBUG] ${message}`);
    }
  }
};

/**
 * Tests email server connection using provided account credentials
 */
export const testEmailConnection = async (account: EmailAccount): Promise<EmailTestResult> => {
  try {
    debugLog('Testing connection to', { 
      host: account.host || account.smtp_host,
      port: account.port || account.smtp_port,
      user: account.username || account.smtp_username,
      secure: account.secure !== undefined ? account.secure : (account.smtp_secure !== undefined ? account.smtp_secure : true)
    });
    
    const config = {
      type: account.type.toLowerCase(),
      host: account.host || account.smtp_host,
      port: account.port || account.smtp_port,
      username: account.username || account.smtp_username,
      password: account.password || account.smtp_password,
      secure: account.secure !== undefined ? account.secure : (account.smtp_secure !== undefined ? account.smtp_secure : true)
    };
    
    debugLog('Test connection config:', {
      ...config,
      password: '********' // Don't log actual password
    });
    
    // Use a Promise with timeout rather than AbortController
    const timeoutPromise = new Promise<EmailTestResult>((_, reject) => {
      setTimeout(() => reject(new Error('Connection test timed out after 20 seconds')), 20000);
    });
    
    try {
      // Call the Edge Function to test connection
      const resultPromise = supabase.functions.invoke('test-email-connection', {
        body: { config }
      }).then(response => {
        if (response.error) {
          debugLog('Edge function error:', response.error);
          throw new Error(response.error.message || 'Connection test failed');
        }
        
        debugLog('Connection test response:', response);
        
        // Return the actual response from the edge function
        return response.data;
      });
      
      // Race the function call against the timeout
      return await Promise.race([resultPromise, timeoutPromise]);
    } catch (fetchError) {
      if (fetchError.message?.includes('timed out')) {
        debugLog('Connection test timed out after 20 seconds');
        throw new Error('Connection test timed out after 20 seconds. The server may be unreachable or blocking connections.');
      }
      
      throw fetchError;
    }
  } catch (error) {
    debugLog('Error testing connection:', error);
    
    // Provide specific user-friendly error messages based on common issues
    let errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    if (errorMessage.includes('CORS')) {
      errorMessage = 'Cross-origin request blocked. This is likely an issue with the server configuration.';
    } else if (errorMessage.includes('NetworkError')) {
      errorMessage = 'Network error occurred. Check your internet connection and server availability.';
    }
    
    return {
      success: false,
      message: errorMessage,
      details: {
        type: account.type,
        host: account.host || account.smtp_host,
        port: account.port || account.smtp_port,
        error: errorMessage
      }
    };
  }
};

/**
 * Sends a test email to verify email account configuration
 */
export const sendTestEmail = async (account: EmailAccount, recipient: string): Promise<{ success: boolean; message: string }> => {
  try {
    debugLog(`Sending test email from ${account.email} to ${recipient}`);
    
    // Add message ID for tracking
    const messageId = `<test-${Date.now()}-${Math.random().toString(36).substring(2, 15)}@${account.smtp_host || account.host}>`;
    
    // Use Promise with timeout instead of AbortController
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Email sending timed out after 30 seconds')), 30000);
    });
    
    // Use direct SMTP sending through the edge function
    const responsePromise = supabase.functions.invoke('send-email-smtp', {
      body: {
        to: recipient,
        subject: "Test Email Connection",
        text: `This is a test email sent from ${account.name} (${account.email}) to verify your email connection settings.`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #4F46E5;">Email Connection Test</h2>
            <p>This is a test email sent from your account: <strong>${account.name}</strong> (${account.email}).</p>
            <p>If you received this email, your email configuration is working correctly.</p>
            <hr style="border: 1px solid #eaeaea; margin: 20px 0;" />
            <p style="color: #666; font-size: 12px;">This is an automated test message. Message-ID: ${messageId}</p>
          </div>
        `,
        accountId: account.id
      }
    }).then(response => {
      if (response.error) {
        debugLog('Edge function error:', response.error);
        throw new Error(response.error.message || 'Failed to send test email');
      }
      
      debugLog('Test email response:', response.data);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to send test email');
      }
      
      return {
        success: true,
        message: `Test email sent successfully to ${recipient}`
      };
    });
    
    return await Promise.race([responsePromise, timeoutPromise]);
  } catch (error) {
    debugLog('Error sending test email:', error);
    
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred while sending test email'
    };
  }
};
