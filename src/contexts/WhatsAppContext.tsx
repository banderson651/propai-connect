import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

// Define message type
export interface WhatsAppMessage {
  id: string;
  contactId: string;
  content: string;
  timestamp: string;
  direction: 'incoming' | 'outgoing';
}

// Define template type
export interface WhatsAppTemplate {
  id: string;
  name: string;
  status: 'approved' | 'pending' | 'rejected';
  content: string;
  language: string;
  category: string;
  variables: string[];
  createdAt: string;
}

// Define analytics type
export interface WhatsAppAnalytics {
  messageSent: number;
  messageDelivered: number;
  messageRead: number;
  messagesFailed: number;
  responseRate: number;
  averageResponseTime: number;
  dailyMessages: {
    date: string;
    count: number;
  }[];
}

interface WhatsAppContextProps {
  isConnected: boolean;
  connectWhatsApp: (apiKey: string, phoneNumber: string) => Promise<boolean>;
  connectWithFacebook: () => Promise<boolean>;
  disconnectWhatsApp: () => void;
  sendMessage: (to: string, message: string) => Promise<boolean>;
  getMessages: (contactId: string) => Promise<WhatsAppMessage[]>;
  verifyConnection: () => Promise<boolean>;
  getTemplates: () => Promise<WhatsAppTemplate[]>;
  createTemplate: (template: Omit<WhatsAppTemplate, 'id' | 'status' | 'createdAt'>) => Promise<WhatsAppTemplate>;
  getAnalytics: () => Promise<WhatsAppAnalytics>;
  phoneNumber: string | null;
  apiKey: string | null;
  businessAccountId: string | null;
}

interface WhatsAppConfig {
  phoneNumber: string;
  apiKey: string;
  businessAccountId?: string;
}

const WhatsAppContext = createContext<WhatsAppContextProps | undefined>(undefined);

export const WhatsAppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [phoneNumber, setPhoneNumber] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [businessAccountId, setBusinessAccountId] = useState<string | null>(null);

  // Check Supabase for saved connection on mount
  useEffect(() => {
    const loadWhatsAppConfig = async () => {
      try {
        const { data, error } = await supabase
          .from('whatsapp_config')
          .select('*')
          .limit(1)
          .single();
        
        if (error) {
          console.log('No WhatsApp configuration found');
          return;
        }
        
        if (data) {
          setPhoneNumber(data.phone_number);
          setApiKey(data.api_key);
          setBusinessAccountId(data.business_account_id || null);
          setIsConnected(true);
        }
      } catch (error) {
        console.error('Error loading WhatsApp config:', error);
      }
    };
    
    loadWhatsAppConfig();
  }, []);

  // Facebook/WhatsApp Business Auth
  const connectWithFacebook = async (): Promise<boolean> => {
    try {
      // Open Facebook OAuth popup
      const width = 600;
      const height = 700;
      const left = window.innerWidth / 2 - width / 2;
      const top = window.innerHeight / 2 - height / 2;
      
      const authUrl = 'https://www.facebook.com/v19.0/dialog/oauth?client_id=your-app-id&redirect_uri=your-redirect-uri&scope=whatsapp_business_messaging,whatsapp_business_management';
      
      const popup = window.open(
        authUrl,
        'Connect to WhatsApp Business',
        `width=${width},height=${height},left=${left},top=${top}`
      );
      
      // Handle the oauth response
      const handleAuth = async (event: MessageEvent) => {
        // Make sure this is coming from our expected domain
        if (event.origin !== window.location.origin) return;
        
        if (event.data.type === 'whatsapp-oauth-success') {
          const { accessToken, businessAccountId, phoneNumber } = event.data;
          
          // Save to Supabase
          const { error } = await supabase
            .from('whatsapp_config')
            .upsert({ 
              id: '1', // Using a constant ID for simplicity
              phone_number: phoneNumber,
              api_key: accessToken,
              business_account_id: businessAccountId
            });
          
          if (error) throw error;
          
          setPhoneNumber(phoneNumber);
          setApiKey(accessToken);
          setBusinessAccountId(businessAccountId);
          setIsConnected(true);
          
          toast({
            title: "WhatsApp Connected",
            description: "Successfully connected to WhatsApp Business Manager",
          });
          
          // Clean up
          window.removeEventListener('message', handleAuth);
          if (popup) popup.close();
          
          return true;
        }
        
        if (event.data.type === 'whatsapp-oauth-error') {
          toast({
            title: "Connection Failed",
            description: event.data.error || "Could not connect to WhatsApp Business",
            variant: "destructive",
          });
          
          // Clean up
          window.removeEventListener('message', handleAuth);
          if (popup) popup.close();
        }
      };
      
      window.addEventListener('message', handleAuth);
      
      // For demo purposes, simulate a successful connection
      setTimeout(() => {
        window.postMessage({
          type: 'whatsapp-oauth-success',
          accessToken: 'mock-token-' + Math.random().toString(36).substring(2),
          businessAccountId: 'mock-business-' + Math.random().toString(36).substring(2),
          phoneNumber: '+1' + Math.floor(Math.random() * 9000000000 + 1000000000)
        }, window.location.origin);
      }, 3000);
      
      return true;
    } catch (error) {
      console.error("Failed to connect with Facebook:", error);
      toast({
        title: "Connection Failed",
        description: "Could not connect to WhatsApp Business Manager",
        variant: "destructive",
      });
      return false;
    }
  };

  // Connect to WhatsApp Business API
  const connectWhatsApp = async (apiKey: string, phoneNumber: string): Promise<boolean> => {
    try {
      // First verify the connection
      const isValid = await testWhatsAppConnection(apiKey, phoneNumber);
      
      if (!isValid) {
        throw new Error('Could not verify WhatsApp API connection');
      }

      // Save configuration to Supabase
      const { error } = await supabase
        .from('whatsapp_config')
        .upsert({ 
          id: '1', // Using a constant ID for simplicity
          phone_number: phoneNumber,
          api_key: apiKey
        });
      
      if (error) throw error;
      
      setPhoneNumber(phoneNumber);
      setApiKey(apiKey);
      setIsConnected(true);
      
      toast({
        title: "WhatsApp Connected",
        description: `Successfully connected to WhatsApp with number ${phoneNumber}`,
      });
      
      return true;
    } catch (error) {
      console.error("Failed to connect WhatsApp:", error);
      toast({
        title: "Connection Failed",
        description: "Could not connect to WhatsApp. Please check your credentials.",
        variant: "destructive",
      });
      return false;
    }
  };

  // Test WhatsApp connection
  const testWhatsAppConnection = async (apiKey: string, phoneNumber: string): Promise<boolean> => {
    try {
      // Real implementation would verify API access
      // For now, we'll simulate a successful connection with a basic check
      const response = await fetch('https://api.whatsapp.com/v1/account', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      // Check if request was successful
      return response.ok;
    } catch (error) {
      console.error('Error testing WhatsApp connection:', error);
      return false;
    }
  };

  // Verify the current connection
  const verifyConnection = async (): Promise<boolean> => {
    if (!apiKey || !phoneNumber) return false;
    return testWhatsAppConnection(apiKey, phoneNumber);
  };

  const disconnectWhatsApp = async () => {
    try {
      // Delete configuration from Supabase
      const { error } = await supabase
        .from('whatsapp_config')
        .delete()
        .eq('id', '1');
      
      if (error) throw error;
      
      setPhoneNumber(null);
      setApiKey(null);
      setBusinessAccountId(null);
      setIsConnected(false);
      
      toast({
        title: "WhatsApp Disconnected",
        description: "You've been disconnected from WhatsApp",
      });
    } catch (error) {
      console.error("Failed to disconnect WhatsApp:", error);
      toast({
        title: "Error",
        description: "Failed to disconnect WhatsApp",
        variant: "destructive",
      });
    }
  };

  // Send WhatsApp message
  const sendMessage = async (to: string, message: string): Promise<boolean> => {
    if (!isConnected || !apiKey) {
      toast({
        title: "Cannot Send Message",
        description: "You need to connect to WhatsApp first",
        variant: "destructive",
      });
      return false;
    }

    try {
      // Format the phone number (remove non-digits)
      const formattedNumber = to.replace(/\D/g, '');
      
      // Make API request to WhatsApp Business API
      const response = await fetch('https://api.whatsapp.com/v1/messages', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          to: formattedNumber,
          type: 'text',
          text: {
            body: message
          }
        })
      });
      
      if (!response.ok) {
        throw new Error(`WhatsApp API error: ${response.status}`);
      }
      
      const messageData = await response.json();
      
      // Store message in Supabase
      await supabase.from('whatsapp_messages').insert({
        contact_id: to,
        content: message,
        direction: 'outgoing',
        message_id: messageData.id,
        timestamp: new Date().toISOString()
      });
      
      toast({
        title: "Message Sent",
        description: `Message sent to ${to}`,
      });
      
      return true;
    } catch (error) {
      console.error("Failed to send WhatsApp message:", error);
      toast({
        title: "Failed to Send",
        description: "Could not send your WhatsApp message",
        variant: "destructive",
      });
      return false;
    }
  };

  // Get messages for a contact
  const getMessages = async (contactId: string): Promise<WhatsAppMessage[]> => {
    try {
      const { data, error } = await supabase
        .from('whatsapp_messages')
        .select('*')
        .eq('contact_id', contactId)
        .order('timestamp', { ascending: true });
      
      if (error) throw error;
      
      return data.map(msg => ({
        id: msg.id,
        contactId: msg.contact_id,
        content: msg.content,
        timestamp: msg.timestamp,
        direction: msg.direction as 'incoming' | 'outgoing'
      }));
    } catch (error) {
      console.error('Error fetching WhatsApp messages:', error);
      return [];
    }
  };

  // Get templates
  const getTemplates = async (): Promise<WhatsAppTemplate[]> => {
    try {
      // In a real implementation, this would fetch from the WhatsApp Business API
      // For demo purposes, we'll return mock data
      return [
        {
          id: '1',
          name: 'Welcome Message',
          status: 'approved',
          content: 'Hello {{1}}, welcome to our service! How can we help you today?',
          language: 'en_US',
          category: 'MARKETING',
          variables: ['name'],
          createdAt: new Date().toISOString()
        },
        {
          id: '2',
          name: 'Appointment Confirmation',
          status: 'approved',
          content: 'Hi {{1}}, your appointment is confirmed for {{2}} at {{3}}. Reply YES to confirm or NO to reschedule.',
          language: 'en_US',
          category: 'UTILITY',
          variables: ['name', 'date', 'time'],
          createdAt: new Date().toISOString()
        },
        {
          id: '3',
          name: 'Property Update',
          status: 'pending',
          content: 'Hello {{1}}, there is a new update about the property at {{2}}. Please check your dashboard for details.',
          language: 'en_US',
          category: 'UTILITY',
          variables: ['name', 'address'],
          createdAt: new Date().toISOString()
        }
      ];
    } catch (error) {
      console.error('Error fetching WhatsApp templates:', error);
      return [];
    }
  };

  // Create template
  const createTemplate = async (template: Omit<WhatsAppTemplate, 'id' | 'status' | 'createdAt'>): Promise<WhatsAppTemplate> => {
    try {
      // In a real implementation, this would create a template via the WhatsApp Business API
      // For demo purposes, we'll return a mock response
      const newTemplate: WhatsAppTemplate = {
        id: Math.random().toString(36).substring(2),
        status: 'pending',
        createdAt: new Date().toISOString(),
        ...template
      };
      
      toast({
        title: "Template Created",
        description: "Your message template has been submitted for review",
      });
      
      return newTemplate;
    } catch (error) {
      console.error('Error creating WhatsApp template:', error);
      toast({
        title: "Error",
        description: "Failed to create message template",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Get analytics
  const getAnalytics = async (): Promise<WhatsAppAnalytics> => {
    try {
      // In a real implementation, this would fetch analytics from the WhatsApp Business API
      // For demo purposes, we'll return mock data
      return {
        messageSent: 256,
        messageDelivered: 245,
        messageRead: 198,
        messagesFailed: 11,
        responseRate: 72.5,
        averageResponseTime: 12.3,
        dailyMessages: Array.from({ length: 14 }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - 13 + i);
          return {
            date: date.toISOString().split('T')[0],
            count: Math.floor(Math.random() * 30) + 5
          };
        })
      };
    } catch (error) {
      console.error('Error fetching WhatsApp analytics:', error);
      return {
        messageSent: 0,
        messageDelivered: 0,
        messageRead: 0,
        messagesFailed: 0,
        responseRate: 0,
        averageResponseTime: 0,
        dailyMessages: []
      };
    }
  };

  return (
    <WhatsAppContext.Provider value={{ 
      isConnected, 
      connectWhatsApp,
      connectWithFacebook, 
      disconnectWhatsApp, 
      sendMessage,
      getMessages,
      getTemplates,
      createTemplate,
      getAnalytics,
      verifyConnection,
      phoneNumber,
      apiKey,
      businessAccountId
    }}>
      {children}
    </WhatsAppContext.Provider>
  );
};

export const useWhatsApp = () => {
  const context = useContext(WhatsAppContext);
  if (context === undefined) {
    throw new Error('useWhatsApp must be used within a WhatsAppProvider');
  }
  return context;
};
