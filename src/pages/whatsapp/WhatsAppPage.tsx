import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useWhatsApp } from '@/contexts/WhatsAppContext';
import { MessageSquare, Phone, Settings, Loader2, BarChart2, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { WhatsAppAnalytics } from '@/types/whatsapp';
import { WhatsAppSetup } from '@/components/whatsapp/WhatsAppSetup';
import { WhatsAppAnalytics as WhatsAppAnalyticsComponent } from '@/components/whatsapp/WhatsAppAnalytics';
import { WhatsAppTemplateManager } from '@/components/whatsapp/WhatsAppTemplateManager';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';

const WhatsAppPage = () => {
  const { isConnected, disconnectWhatsApp, getAnalytics, getTemplates } = useWhatsApp();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState<WhatsAppAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isConnected) {
      loadData();
    } else {
      setLoading(false);
    }
  }, [isConnected]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [analyticsData, templates] = await Promise.all([
        getAnalytics(),
        getTemplates(),
      ]);
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Error loading WhatsApp data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load WhatsApp data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnectWhatsApp();
      toast({
        title: 'Disconnected',
        description: 'WhatsApp connection terminated successfully.',
      });
    } catch (error) {
      toast({
        title: 'Disconnection Failed',
        description: 'Failed to disconnect from WhatsApp. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">WhatsApp</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your WhatsApp integration</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <a href="/settings/whatsapp">
              <Settings className="h-4 w-4 mr-1" /> Settings
            </a>
          </Button>
          {isConnected ? (
            <Button variant="destructive" onClick={handleDisconnect}>
              <Phone className="h-4 w-4 mr-1" /> Disconnect
            </Button>
          ) : null}
        </div>
      </div>

      <Tabs defaultValue="setup" className="space-y-4">
        <TabsList>
          <TabsTrigger value="setup">Setup</TabsTrigger>
          <TabsTrigger value="templates" disabled={!isConnected}>Templates</TabsTrigger>
          <TabsTrigger value="analytics" disabled={!isConnected}>Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="setup">
          <WhatsAppSetup />
        </TabsContent>

        <TabsContent value="templates">
          <WhatsAppTemplateManager />
        </TabsContent>

        <TabsContent value="analytics">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <WhatsAppAnalyticsComponent />
          )}
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default WhatsAppPage; 