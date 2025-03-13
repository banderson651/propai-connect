
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Check, Phone, AlertCircle } from 'lucide-react';
import { useWhatsApp } from '@/contexts/WhatsAppContext';
import { useToast } from '@/components/ui/use-toast';

export const WhatsAppSetup = () => {
  const { isConnected, connectWhatsApp, disconnectWhatsApp, phoneNumber, verifyConnection } = useWhatsApp();
  const { toast } = useToast();
  const [apiKey, setApiKey] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'verified' | 'unverified' | 'failed' | null>(null);

  useEffect(() => {
    // Check connection status when component mounts
    if (isConnected) {
      handleVerifyConnection();
    }
  }, [isConnected]);

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!apiKey || !phone) return;
    
    setIsLoading(true);
    const connected = await connectWhatsApp(apiKey, phone);
    setIsLoading(false);
    
    if (connected) {
      setConnectionStatus('verified');
    }
  };

  const handleVerifyConnection = async () => {
    setVerifying(true);
    const isValid = await verifyConnection();
    setVerifying(false);
    
    setConnectionStatus(isValid ? 'verified' : 'failed');
    
    if (!isValid) {
      toast({
        title: "Connection Issue",
        description: "There's a problem with your WhatsApp connection. Please reconnect.",
        variant: "destructive",
      });
    }
  };

  const handleTestMessage = async () => {
    // Implement test message functionality
    setVerifying(true);
    const result = await verifyConnection();
    setVerifying(false);
    
    if (result) {
      toast({
        title: "Test Successful",
        description: "WhatsApp connection is working properly",
      });
    } else {
      toast({
        title: "Test Failed",
        description: "Could not connect to WhatsApp API",
        variant: "destructive", 
      });
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Phone className="h-5 w-5 text-green-500" />
          WhatsApp Integration
        </CardTitle>
        <CardDescription>
          Connect your WhatsApp Business account to chat with leads directly from the CRM
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {isConnected ? (
          <div className="space-y-4">
            <div className={`flex items-center gap-2 p-3 rounded-md ${
              connectionStatus === 'verified' 
                ? 'bg-green-50 text-green-700' 
                : connectionStatus === 'failed' 
                  ? 'bg-red-50 text-red-700'
                  : 'bg-orange-50 text-orange-700'
            }`}>
              {connectionStatus === 'verified' ? (
                <Check className="h-5 w-5" />
              ) : connectionStatus === 'failed' ? (
                <AlertCircle className="h-5 w-5" />
              ) : (
                <Loader2 className="h-5 w-5 animate-spin" />
              )}
              <span>
                {connectionStatus === 'verified' 
                  ? `Connected to WhatsApp with number ${phoneNumber}`
                  : connectionStatus === 'failed'
                    ? 'Connection failed. Please reconnect.'
                    : 'Checking connection status...'}
              </span>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleVerifyConnection}
                disabled={verifying}
              >
                {verifying ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Verify Connection
              </Button>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleTestMessage}
                disabled={verifying || connectionStatus === 'failed'}
              >
                Send Test Message
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleConnect} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="whatsapp-phone" className="text-sm font-medium">
                WhatsApp Business Phone Number
              </label>
              <Input 
                id="whatsapp-phone" 
                placeholder="+1234567890" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="whatsapp-api" className="text-sm font-medium">
                WhatsApp Business API Key
              </label>
              <Input 
                id="whatsapp-api" 
                placeholder="Enter your API key" 
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                required
              />
            </div>
          </form>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-end">
        {isConnected ? (
          <Button
            variant="outline"
            onClick={disconnectWhatsApp}
          >
            Disconnect WhatsApp
          </Button>
        ) : (
          <Button
            type="submit"
            onClick={handleConnect}
            disabled={isLoading || !apiKey || !phone}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connecting...
              </>
            ) : (
              'Connect WhatsApp'
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};
