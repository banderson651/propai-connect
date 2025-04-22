import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, MessageSquare, LayoutGrid, Activity } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WhatsAppSetup } from '@/components/whatsapp/WhatsAppSetup';
import { WhatsAppTemplateManager } from '@/components/whatsapp/WhatsAppTemplateManager';
import { WhatsAppAnalytics } from '@/components/whatsapp/WhatsAppAnalytics';
import { useWhatsApp } from '@/contexts/WhatsAppContext';

const WhatsAppSettingsPage = () => {
  const { isConnected } = useWhatsApp();

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">WhatsApp Settings</h1>
          <p className="text-slate-600 mt-2">Configure your WhatsApp Business API integration.</p>
        </div>

        {!isConnected && (
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Not Connected</AlertTitle>
            <AlertDescription>
              Your WhatsApp Business API is not connected. Please set up your connection to start using WhatsApp features.
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="setup" className="space-y-6">
          <TabsList className="bg-white border border-slate-200">
            <TabsTrigger value="setup" className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-600">
              <LayoutGrid className="h-4 w-4 mr-2" />
              Setup
            </TabsTrigger>
            <TabsTrigger value="templates" className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-600">
              <MessageSquare className="h-4 w-4 mr-2" />
              Templates
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-600">
              <Activity className="h-4 w-4 mr-2" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="setup">
            <Card>
              <CardHeader>
                <CardTitle>WhatsApp Business API Setup</CardTitle>
              </CardHeader>
              <CardContent>
                <WhatsAppSetup />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="templates">
            <Card>
              <CardHeader>
                <CardTitle>Message Templates</CardTitle>
              </CardHeader>
              <CardContent>
                <WhatsAppTemplateManager />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>WhatsApp Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <WhatsAppAnalytics />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default WhatsAppSettingsPage;
