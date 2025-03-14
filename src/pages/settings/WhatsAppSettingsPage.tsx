
import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { WhatsAppSetup } from '@/components/whatsapp/WhatsAppSetup';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, MessageSquare, Sections, Activity } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WhatsAppTemplateManager } from '@/components/whatsapp/WhatsAppTemplateManager';
import { WhatsAppAnalytics } from '@/components/whatsapp/WhatsAppAnalytics';

const WhatsAppSettingsPage = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">WhatsApp Integration</h1>
          <p className="text-sm text-gray-500 mt-1">
            Connect and manage your WhatsApp Business account
          </p>
        </div>

        <Tabs defaultValue="connect" className="space-y-6">
          <TabsList>
            <TabsTrigger value="connect">Connection</TabsTrigger>
            <TabsTrigger value="templates">Message Templates</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>
          
          <TabsContent value="connect" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1">
                <WhatsAppSetup />
              </div>
              
              <div className="md:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5 text-primary" />
                      About WhatsApp Integration
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p>
                      The WhatsApp integration allows you to:
                    </p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>Connect your WhatsApp Business account to PropAI</li>
                      <li>Send and receive WhatsApp messages directly from the CRM</li>
                      <li>Create and manage message templates</li>
                      <li>Monitor account health and analytics</li>
                      <li>Engage with leads using their preferred communication channel</li>
                    </ul>
                    
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Note</AlertTitle>
                      <AlertDescription>
                        You need to connect your WhatsApp Business account to use this feature.
                        This requires a WhatsApp Business account and approval from Meta.
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="templates">
            <WhatsAppTemplateManager />
          </TabsContent>
          
          <TabsContent value="analytics">
            <WhatsAppAnalytics />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default WhatsAppSettingsPage;
