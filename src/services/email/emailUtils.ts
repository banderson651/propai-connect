
import { EmailAccount, EmailTestResult } from '@/types/email';

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
    // In a real implementation, this would actually test the connection
    // For this mock version, we'll simulate success/failure based on port numbers
    
    // Simulate a connection test
    if (!params.host || params.port <= 0 || !params.username || !params.password) {
      return {
        success: false,
        message: 'Invalid connection parameters'
      };
    }
    
    // Simulate common ports for successful connections
    const validImapPorts = [143, 993]; // Standard IMAP ports
    const validPop3Ports = [110, 995]; // Standard POP3 ports
    
    let isValidPort = false;
    if (params.type === 'IMAP' && validImapPorts.includes(params.port)) {
      isValidPort = true;
    } else if (params.type === 'POP3' && validPop3Ports.includes(params.port)) {
      isValidPort = true;
    }
    
    if (!isValidPort) {
      return {
        success: false,
        message: `Invalid port for ${params.type} connection. Please use standard ports.`
      };
    }
    
    // Return success for the mock implementation
    return {
      success: true,
      message: 'Connected successfully'
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

// Function to send a test email
export const sendTestEmail = async (account: EmailAccount, to: string): Promise<EmailTestResult> => {
  try {
    // In a real implementation, this would actually send a test email
    // For this mock version, we'll simulate success
    
    // Validate account and recipient
    if (!account || !to) {
      return {
        success: false,
        message: 'Invalid account or recipient'
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
    
    // Return success for the mock implementation
    return {
      success: true,
      message: `Test email sent to ${to} successfully`
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};
