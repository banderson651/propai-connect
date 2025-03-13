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

interface WhatsAppContextProps {
  isConnected: boolean;
  connectWhatsApp: (apiKey: string, phoneNumber: string) => Promise<boolean>;
  disconnectWhatsApp: () => void;
  sendMessage: (to: string, message: string) => Promise<boolean>;
  getMessages: (contactId: string) => Promise<WhatsAppMessage[]>;
  verifyConnection: () => Promise<boolean>;
  phoneNumber: string | null;
  apiKey: string | null;
}

interface WhatsAppConfig {
  phoneNumber: string;
  apiKey: string;
}

const WhatsAppContext = createContext<WhatsAppContextProps | undefined>(undefined);

export const WhatsAppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [phoneNumber, setPhoneNumber] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState<string | null>(null);

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
          setIsConnected(true);
        }
      } catch (error) {
        console.error('Error loading WhatsApp config:', error);
      }
    };
    
    loadWhatsAppConfig();
  }, []);

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

  return (
    <WhatsAppContext.Provider value={{ 
      isConnected, 
      connectWhatsApp, 
      disconnectWhatsApp, 
      sendMessage,
      getMessages,
      verifyConnection,
      phoneNumber,
      apiKey
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
