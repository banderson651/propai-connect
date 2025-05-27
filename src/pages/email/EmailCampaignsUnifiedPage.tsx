import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import EmailAccountsPage from './EmailAccountsPage';
import EmailTemplatesPage from './EmailTemplatesPage';
import EmailCampaignsPage from './EmailCampaignsPage';

const EmailCampaignsUnifiedPage = () => {
  const [activeTab, setActiveTab] = useState('accounts');

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Email Campaigns</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your email accounts, templates, and campaigns</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="accounts">Accounts</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
        </TabsList>
        <TabsContent value="accounts">
          <EmailAccountsPage />
        </TabsContent>
        <TabsContent value="templates">
          <EmailTemplatesPage />
        </TabsContent>
        <TabsContent value="campaigns">
          <EmailCampaignsPage />
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default EmailCampaignsUnifiedPage; 