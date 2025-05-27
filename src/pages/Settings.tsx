import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProfileSettings } from '@/components/settings/ProfileSettings';
import { EmailSettings } from '@/components/settings/EmailSettings';

export default function Settings() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
          <p className="text-slate-600 mt-2">Manage your account and application settings.</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="bg-white border border-slate-200">
            <TabsTrigger value="profile" className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-600">
              Profile
            </TabsTrigger>
            <TabsTrigger value="email" className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-600">
              Email
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <ProfileSettings user={user} isLoading={isLoading} setIsLoading={setIsLoading} />
          </TabsContent>

          <TabsContent value="email">
            <EmailSettings user={user} isLoading={isLoading} setIsLoading={setIsLoading} />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
} 