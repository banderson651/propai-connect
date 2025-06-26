
import { EmailAccount } from '@/types/email';

export const testEmailConnection = async (account: EmailAccount | any): Promise<{ success: boolean; message: string }> => {
  try {
    // Simulate connection test
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // For demonstration, assume connection is successful
    return {
      success: true,
      message: 'Connection test successful'
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Connection test failed'
    };
  }
};

export const sendTestEmail = async (account: EmailAccount | any, recipient: string): Promise<{ success: boolean; message: string }> => {
  try {
    // Simulate sending test email
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return {
      success: true,
      message: `Test email sent successfully to ${recipient}`
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to send test email'
    };
  }
};
