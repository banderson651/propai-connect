import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { WhatsAppTemplate, WhatsAppMessage, WhatsAppAnalytics, WhatsAppConfig } from '@/types/whatsapp';
import { useToast } from '@/hooks/use-toast';

interface WhatsAppContextType {
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

const WhatsAppContext = createContext<WhatsAppContextType | undefined>(undefined);

export const WhatsAppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [businessAccountId, setBusinessAccountId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    checkConnectionStatus();
  }, []);

  const checkConnectionStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('whatsapp_connections')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error checking WhatsApp connection:', error);
        return;
      }

      if (data) {
        setIsConnected(data.status === 'connected');
        setPhoneNumber(data.phone_number);
        setApiKey(data.api_key);
        setBusinessAccountId(data.business_account_id);
      }
    } catch (error) {
      console.error('Error checking WhatsApp connection:', error);
    }
  };

  const connectWhatsApp = async (apiKey: string, phoneNumber: string): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('whatsapp_connections')
        .upsert({
          user_id: user.id,
          status: 'connected',
          phone_number: phoneNumber,
          api_key: apiKey,
          connected_at: new Date().toISOString(),
        });

      if (error) throw error;

      setIsConnected(true);
      setPhoneNumber(phoneNumber);
      setApiKey(apiKey);

      toast({
        title: 'Success',
        description: 'WhatsApp connection established successfully.',
      });

      return true;
    } catch (error) {
      console.error('Error connecting to WhatsApp:', error);
      toast({
        title: 'Error',
        description: 'Failed to connect to WhatsApp.',
        variant: 'destructive',
      });
      return false;
    }
  };

  const connectWithFacebook = async (): Promise<boolean> => {
    try {
      // Implement Facebook OAuth flow
      // For now, return false
      return false;
    } catch (error) {
      console.error('Error connecting with Facebook:', error);
      return false;
    }
  };

  const disconnectWhatsApp = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('whatsapp_connections')
        .update({
          status: 'disconnected',
          disconnected_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (error) throw error;

      setIsConnected(false);
      setPhoneNumber(null);
      setApiKey(null);
      setBusinessAccountId(null);

      toast({
        title: 'Success',
        description: 'WhatsApp disconnected successfully.',
      });
    } catch (error) {
      console.error('Error disconnecting from WhatsApp:', error);
      toast({
        title: 'Error',
        description: 'Failed to disconnect from WhatsApp.',
        variant: 'destructive',
      });
    }
  };

  const verifyConnection = async (): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data, error } = await supabase
        .from('whatsapp_connections')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) return false;

      return data?.status === 'connected';
    } catch (error) {
      console.error('Error verifying WhatsApp connection:', error);
      return false;
    }
  };

  const sendMessage = async (to: string, message: string): Promise<boolean> => {
    try {
      // Implement message sending logic
      // For now, return false
      return false;
    } catch (error) {
      console.error('Error sending WhatsApp message:', error);
      return false;
    }
  };

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
        direction: msg.direction,
        status: msg.status,
      }));
    } catch (error) {
      console.error('Error fetching WhatsApp messages:', error);
      return [];
    }
  };

  const getTemplates = async (): Promise<WhatsAppTemplate[]> => {
    try {
      const { data, error } = await supabase
        .from('whatsapp_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data.map(template => ({
        id: template.id,
        name: template.name,
        content: template.content,
        language: template.language,
        category: template.category,
        variables: template.variables,
        status: template.status,
        createdAt: template.created_at,
      }));
    } catch (error) {
      console.error('Error fetching WhatsApp templates:', error);
      return [];
    }
  };

  const createTemplate = async (template: Omit<WhatsAppTemplate, 'id' | 'status' | 'createdAt'>): Promise<WhatsAppTemplate> => {
    try {
      const { data, error } = await supabase
        .from('whatsapp_templates')
        .insert({
          name: template.name,
          content: template.content,
          language: template.language,
          category: template.category,
          variables: template.variables,
          status: 'pending',
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        name: data.name,
        content: data.content,
        language: data.language,
        category: data.category,
        variables: data.variables,
        status: data.status,
        createdAt: data.created_at,
      };
    } catch (error) {
      console.error('Error creating WhatsApp template:', error);
      throw error;
    }
  };

  const getAnalytics = async (): Promise<WhatsAppAnalytics> => {
    try {
      const { data, error } = await supabase
        .from('whatsapp_analytics')
        .select('*')
        .order('date', { ascending: false })
        .limit(14);

      if (error) throw error;

      // Calculate analytics from message data
      const analytics: WhatsAppAnalytics = {
        messageSent: 0,
        messageDelivered: 0,
        messageRead: 0,
        messagesFailed: 0,
        responseRate: 0,
        averageResponseTime: 0,
        dailyMessages: data.map(item => ({
          date: item.date,
          count: item.message_count,
        })),
      };

      // Calculate other metrics from message data
      const { data: messages } = await supabase
        .from('whatsapp_messages')
        .select('*')
        .gte('timestamp', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      if (messages) {
        messages.forEach(msg => {
          if (msg.direction === 'outgoing') {
            analytics.messageSent++;
            if (msg.status === 'delivered') analytics.messageDelivered++;
            if (msg.status === 'read') analytics.messageRead++;
            if (msg.status === 'failed') analytics.messagesFailed++;
          }
        });

        // Calculate response rate and average response time
        const responses = messages.filter(msg => 
          msg.direction === 'incoming' && 
          messages.some(m => 
            m.direction === 'outgoing' && 
            new Date(m.timestamp) < new Date(msg.timestamp) &&
            new Date(msg.timestamp).getTime() - new Date(m.timestamp).getTime() < 24 * 60 * 60 * 1000
          )
        );

        analytics.responseRate = (responses.length / analytics.messageSent) * 100;

        // Calculate average response time
        const responseTimes = responses.map(msg => {
          const lastOutgoing = messages
            .filter(m => 
              m.direction === 'outgoing' && 
              new Date(m.timestamp) < new Date(msg.timestamp)
            )
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];

          return new Date(msg.timestamp).getTime() - new Date(lastOutgoing.timestamp).getTime();
        });

        analytics.averageResponseTime = responseTimes.length > 0
          ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length / (60 * 1000)
          : 0;
      }

      return analytics;
    } catch (error) {
      console.error('Error fetching WhatsApp analytics:', error);
      throw error;
    }
  };

  return (
    <WhatsAppContext.Provider
      value={{
        isConnected,
        connectWhatsApp,
        connectWithFacebook,
        disconnectWhatsApp,
        sendMessage,
        getMessages,
        verifyConnection,
        getTemplates,
        createTemplate,
        getAnalytics,
        phoneNumber,
        apiKey,
        businessAccountId,
      }}
    >
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
