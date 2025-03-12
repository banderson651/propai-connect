
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Check, Phone } from 'lucide-react';
import { useWhatsApp } from '@/contexts/WhatsAppContext';

export const WhatsAppSetup = () => {
  const { isConnected, connectWhatsApp, disconnectWhatsApp, phoneNumber } = useWhatsApp();
  const [apiKey, setApiKey] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!apiKey || !phone) return;
    
    setIsLoading(true);
    await connectWhatsApp(apiKey, phone);
    setIsLoading(false);
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
            <div className="flex items-center gap-2 p-3 bg-green-50 text-green-700 rounded-md">
              <Check className="h-5 w-5" />
              <span>Connected to WhatsApp with number {phoneNumber}</span>
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
