
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from '@/components/ui/use-toast';

interface WhatsAppContextProps {
  isConnected: boolean;
  connectWhatsApp: (apiKey: string, phoneNumber: string) => Promise<boolean>;
  disconnectWhatsApp: () => void;
  sendMessage: (to: string, message: string) => Promise<boolean>;
  phoneNumber: string | null;
}

const WhatsAppContext = createContext<WhatsAppContextProps | undefined>(undefined);

export const WhatsAppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [phoneNumber, setPhoneNumber] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState<string | null>(null);

  // Check localStorage for saved connection on mount
  useEffect(() => {
    const savedPhone = localStorage.getItem('whatsapp_phone');
    const savedApiKey = localStorage.getItem('whatsapp_api_key');
    
    if (savedPhone && savedApiKey) {
      setPhoneNumber(savedPhone);
      setApiKey(savedApiKey);
      setIsConnected(true);
    }
  }, []);

  const connectWhatsApp = async (apiKey: string, phoneNumber: string): Promise<boolean> => {
    try {
      // In a real implementation, this would validate the API key with WhatsApp Business API
      console.log(`Connecting to WhatsApp with phone ${phoneNumber} and API key ${apiKey}`);
      
      // For demo purposes, we'll simulate a successful connection
      localStorage.setItem('whatsapp_phone', phoneNumber);
      localStorage.setItem('whatsapp_api_key', apiKey);
      
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

  const disconnectWhatsApp = () => {
    localStorage.removeItem('whatsapp_phone');
    localStorage.removeItem('whatsapp_api_key');
    setPhoneNumber(null);
    setApiKey(null);
    setIsConnected(false);
    
    toast({
      title: "WhatsApp Disconnected",
      description: "You've been disconnected from WhatsApp",
    });
  };

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
      // In a real implementation, this would send the message via WhatsApp Business API
      console.log(`Sending WhatsApp message to ${to}: ${message}`);
      
      // Simulate success for demo
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

  return (
    <WhatsAppContext.Provider value={{ 
      isConnected, 
      connectWhatsApp, 
      disconnectWhatsApp, 
      sendMessage,
      phoneNumber 
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
