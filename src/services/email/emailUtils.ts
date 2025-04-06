
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
    
    // Prepare SMTP configuration
    const smtpConfig = {
      host: account.smtp_host || account.host,
      port: account.smtp_port || account.port,
      secure: account.smtp_secure !== undefined ? account.smtp_secure : account.secure,
      auth: {
        user: account.smtp_username || account.username || account.email,
        pass: account.smtp_password || account.password
      }
    };
    
    debugLog('SMTP config for test email:', {
      ...smtpConfig,
      auth: { 
        user: smtpConfig.auth.user,
        pass: '********' // Don't log the actual password
      }
    });
    
    // Add message ID for tracking
    const messageId = `<test-${Date.now()}-${Math.random().toString(36).substring(2, 15)}@${account.smtp_host || account.host}>`;
    
    // Call the Edge Function to send the email with improved error handling
    try {
      // Use Promise with timeout instead of AbortController
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Email sending timed out after 30 seconds')), 30000);
      });
      
      const responsePromise = supabase.functions.invoke('send-email', {
        body: {
          to: recipient,
          subject: "Test Email from PropAI",
          text: `This is a test email sent from ${account.name} (${account.email})`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #4F46E5;">Test Email from PropAI</h2>
              <p>This is a test email sent from your account: <strong>${account.name}</strong> (${account.email}).</p>
              <p>If you received this email, your email configuration is working correctly.</p>
              <hr style="border: 1px solid #eaeaea; margin: 20px 0;" />
              <p style="color: #666; font-size: 12px;">This is an automated message from PropAI. Please do not reply to this email.</p>
              <p style="color: #666; font-size: 12px;">Message-ID: ${messageId}</p>
            </div>
          `,
          from: `"${account.name}" <${account.email}>`,
          messageId: messageId,
          smtp: smtpConfig
        }
      }).then(response => {
        debugLog('Send email response:', response);
        
        if (response.error) {
          debugLog("Error invoking send-email function:", response.error);
          throw new Error(response.error.message || "Failed to send email");
        }
        
        const data = response.data;
        
        if (!data.success) {
          debugLog("Email sending failed:", data);
          throw new Error(data.message || "Failed to send email");
        }
        
        return {
          success: true,
          message: `Test email sent successfully from ${account.email} to ${recipient}`
        };
      });
      
      return await Promise.race([responsePromise, timeoutPromise]);
    } catch (fetchError) {
      if (fetchError.message?.includes('timed out')) {
        debugLog('Email sending timed out after 30 seconds');
        throw new Error('Email sending timed out after 30 seconds. The server may be slow or rejecting the connection.');
      }
      
      debugLog("Error with Edge Function:", fetchError);
      throw new Error(fetchError instanceof Error 
        ? fetchError.message 
        : "Failed to send email - Edge Function error");
    }
    
  } catch (error) {
    debugLog("Error sending test email:", error);
    
    // Create user-friendly error messages based on common issues
    let errorMessage = error instanceof Error ? error.message : "Failed to send email";
    
    if (errorMessage.includes('authentication')) {
      errorMessage = "Authentication failed. Check your username and password.";
    } else if (errorMessage.includes('connection')) {
      errorMessage = "Connection failed. Check your server address and port settings.";
    } else if (errorMessage.includes('certificate')) {
      errorMessage = "SSL/TLS certificate validation failed. Try changing the 'secure' setting.";
    } else if (errorMessage.includes('relay')) {
      errorMessage = "Relay access denied. Your email provider may require additional authentication or settings.";
    }
    
    // Show toast for better UI feedback
    toast({
      title: "Email Sending Failed",
      description: errorMessage,
      variant: "destructive"
    });
    
    return {
      success: false,
      message: errorMessage
    };
  }
};
