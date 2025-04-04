
import { EmailAccount, EmailTestResult } from '@/types/email';
import { supabase } from '@/lib/supabase';

export const testEmailConnection = async (account: EmailAccount): Promise<EmailTestResult> => {
  // For now, we'll simulate connection testing
  // In a production app, this would make an actual connection test
  console.log('Testing connection to', account.host);
  
  // Simulate a delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Simulate a successful connection
  return {
    success: true,
    message: 'Connection successful',
    details: {
      type: account.type,
      host: account.host,
      port: account.port
    }
  };
};

export const sendTestEmail = async (account: EmailAccount, recipient: string): Promise<{ success: boolean; message: string }> => {
  try {
    console.log(`Sending test email from ${account.email} to ${recipient}`);
    
    // Prepare SMTP configuration
    const smtpConfig = {
      host: account.smtp_host,
      port: account.smtp_port,
      secure: account.smtp_secure,
      auth: {
        user: account.smtp_username,
        pass: account.smtp_password
      }
    };
    
    // Call the Edge Function to send the email
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
    
    if (error) {
      console.error("Error invoking send-email function:", error);
      throw new Error(error.message || "Failed to send email");
    }
    
    if (!data.success) {
      throw new Error(data.message || "Failed to send email");
    }
    
    return {
      success: true,
      message: `Test email sent successfully from ${account.email} to ${recipient}`
    };
  } catch (error) {
    console.error("Error sending test email:", error);
    return {
      success: false,
      message: error.message || "Failed to send email"
    };
  }
};
