
import { EmailAccount, EmailTestResult } from '@/types/email';
import { supabase } from '@/lib/supabase';

export const testEmailConnection = async (account: EmailAccount): Promise<EmailTestResult> => {
  try {
    console.log('Testing connection to', account.host);
    
    const config = {
      type: account.type.toLowerCase(),
      host: account.host || account.smtp_host,
      port: account.port || account.smtp_port,
      username: account.username || account.smtp_username,
      password: account.password || account.smtp_password,
      secure: account.secure !== undefined ? account.secure : (account.smtp_secure !== undefined ? account.smtp_secure : true)
    };
    
    console.log('Test connection config:', config);
    
    // Call the Edge Function to test connection
    const { data, error } = await supabase.functions.invoke('test-email-connection', {
      body: { config }
    });
    
    if (error) {
      console.error('Error testing connection:', error);
      throw new Error(error.message || 'Connection test failed');
    }
    
    return data;
  } catch (error) {
    console.error('Error testing connection:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      details: {
        type: account.type,
        host: account.host || account.smtp_host,
        port: account.port || account.smtp_port,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    };
  }
};

export const sendTestEmail = async (account: EmailAccount, recipient: string): Promise<{ success: boolean; message: string }> => {
  try {
    console.log(`Sending test email from ${account.email} to ${recipient}`);
    
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
    
    console.log('SMTP config for test email:', JSON.stringify({
      ...smtpConfig,
      auth: { 
        user: smtpConfig.auth.user,
        pass: '********' // Don't log the actual password
      }
    }));
    
    // Call the Edge Function to send the email with better error handling
    try {
      const { data, error } = await supabase.functions.invoke('send-email', {
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
            </div>
          `,
          smtp: smtpConfig
        }
      });
      
      console.log('Send email response:', data);
      
      if (error) {
        console.error("Error invoking send-email function:", error);
        throw new Error(error.message || "Failed to send email");
      }
      
      if (data && !data.success) {
        throw new Error(data.message || "Failed to send email");
      }
      
      return {
        success: true,
        message: `Test email sent successfully from ${account.email} to ${recipient}`
      };
    } catch (functionError) {
      console.error("Error with Edge Function:", functionError);
      throw new Error(functionError instanceof Error 
        ? functionError.message 
        : "Failed to send email - Edge Function error");
    }
    
  } catch (error) {
    console.error("Error sending test email:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to send email"
    };
  }
};
