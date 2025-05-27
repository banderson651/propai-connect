import { useState } from 'react';
import { ProfileSettings } from '@/components/settings/ProfileSettings';
import { EmailSettings } from '@/components/settings/EmailSettings';
import { NotificationSettings } from '@/components/settings/NotificationSettings';
import { useUser } from '@/hooks/useUser';

export default function SettingsPage() {
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-8">Settings</h1>
      
      <div className="grid gap-8">
        <ProfileSettings user={user} isLoading={isLoading} setIsLoading={setIsLoading} />
        <EmailSettings user={user} isLoading={isLoading} setIsLoading={setIsLoading} />
        <NotificationSettings user={user} isLoading={isLoading} setIsLoading={setIsLoading} />
      </div>
    </div>
  );
} 