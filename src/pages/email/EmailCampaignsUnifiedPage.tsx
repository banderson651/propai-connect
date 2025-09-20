import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EmailAccountsContent } from './EmailAccountsPage';
import { EmailTemplatesContent } from './EmailTemplatesPage';
import { EmailCampaignsContent } from './EmailCampaignsPage';

const EmailCampaignsUnifiedPage = () => {
  const [activeTab, setActiveTab] = useState('accounts');

  return (
    <DashboardLayout pageTitle="Email Campaigns">
      <div className="mb-6">
        <p className="text-sm text-muted-foreground">Manage your email accounts, templates, and campaigns.</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="accounts">Accounts</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
        </TabsList>
        <TabsContent value="accounts">
          <EmailAccountsContent />
        </TabsContent>
        <TabsContent value="templates">
          <EmailTemplatesContent />
        </TabsContent>
        <TabsContent value="campaigns">
          <EmailCampaignsContent />
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default EmailCampaignsUnifiedPage; 