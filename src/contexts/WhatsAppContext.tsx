import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/use-toast';

interface WhatsAppContextValue {
  isConnected: boolean;
  isLoading: boolean;
  connectAccount: () => Promise<void>;
  disconnectAccount: () => Promise<void>;
}

const WhatsAppContext = createContext<WhatsAppContextValue | undefined>(undefined);

export function WhatsAppProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    checkConnection();
  }, []);
  
  const checkConnection = async () => {
    try {
      const { data, error } = await supabase
        .from('whatsapp_connections')
        .select('*')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .single();
      
      if (error) {
        console.error("Error checking WhatsApp connection:", error);
        // Don't fail if the table doesn't exist
        if (error.code === '42P01') { // Table doesn't exist error
          setIsConnected(false);
          setIsLoading(false);
          return;
        }
      }
      
      setIsConnected(!!data);
      setIsLoading(false);
    } catch (err) {
      console.error("Exception checking WhatsApp connection:", err);
      setIsConnected(false);
      setIsLoading(false);
    }
  };
  
  const connectAccount = async () => {
    setIsLoading(true);
    try {
      // Placeholder: Implement the actual connection logic here
      // This might involve opening a WebSocket connection, authenticating with a service, etc.
      
      // For now, let's simulate a successful connection after a short delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // After successful connection, store the connection status in the database
      const { data, error } = await supabase
        .from('whatsapp_connections')
        .insert([{ user_id: (await supabase.auth.getUser()).data.user?.id }]);
      
      if (error) {
        console.error("Error saving WhatsApp connection:", error);
        toast({
          title: "Error",
          description: "Failed to connect WhatsApp account.",
          variant: "destructive",
        });
        setIsConnected(false);
      } else {
        setIsConnected(true);
        toast({
          title: "Success",
          description: "WhatsApp account connected successfully.",
        });
      }
    } catch (error) {
      console.error("Error connecting WhatsApp account:", error);
      toast({
        title: "Error",
        description: "Failed to connect WhatsApp account.",
        variant: "destructive",
      });
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  };
  
  const disconnectAccount = async () => {
    setIsLoading(true);
    try {
      // Placeholder: Implement the actual disconnection logic here
      // This might involve closing a WebSocket connection, deauthenticating, etc.
      
      // For now, let's simulate a successful disconnection after a short delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // After successful disconnection, remove the connection status from the database
      const { data, error } = await supabase
        .from('whatsapp_connections')
        .delete()
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id);
      
      if (error) {
        console.error("Error deleting WhatsApp connection:", error);
        toast({
          title: "Error",
          description: "Failed to disconnect WhatsApp account.",
          variant: "destructive",
        });
        setIsConnected(false);
      } else {
        setIsConnected(false);
        toast({
          title: "Success",
          description: "WhatsApp account disconnected successfully.",
        });
      }
    } catch (error) {
      console.error("Error disconnecting WhatsApp account:", error);
      toast({
        title: "Error",
        description: "Failed to disconnect WhatsApp account.",
        variant: "destructive",
      });
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <WhatsAppContext.Provider
      value={{
        isConnected,
        isLoading,
        connectAccount,
        disconnectAccount,
      }}
    >
      {children}
    </WhatsAppContext.Provider>
  );
}

export const useWhatsApp = () => {
  const context = useContext(WhatsAppContext);
  if (!context) {
    throw new Error('useWhatsApp must be used within a WhatsAppProvider');
  }
  return context;
};
