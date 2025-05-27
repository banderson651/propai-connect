import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

interface NotificationSettingsProps {
  user: User | null;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

interface NotificationSettingsData {
  email_notifications: boolean;
  slack_notifications: boolean;
  slack_webhook_url: string;
}

export const NotificationSettings = ({ user, isLoading, setIsLoading }: NotificationSettingsProps) => {
  const { toast } = useToast();
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettingsData>({
    email_notifications: true,
    slack_notifications: false,
    slack_webhook_url: '',
  });

  const handleNotificationSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Update notification settings in Supabase
      const { error } = await supabase
        .from('notification_settings')
        .upsert({
          user_id: user?.id,
          email_notifications: notificationSettings.email_notifications,
          slack_notifications: notificationSettings.slack_notifications,
          slack_webhook_url: notificationSettings.slack_webhook_url,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      toast({
        title: 'Notification settings updated',
        description: 'Your notification preferences have been successfully updated.',
      });
    } catch (error) {
      console.error('Error updating notification settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to update notification settings. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-slate-200">
      <CardHeader>
        <CardTitle className="text-xl text-slate-900">Notification Preferences</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleNotificationSettingsSubmit} className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-slate-700">Email Notifications</Label>
              <p className="text-sm text-slate-500">
                Receive email notifications for important updates
              </p>
            </div>
            <Switch
              checked={notificationSettings.email_notifications}
              onCheckedChange={(checked) =>
                setNotificationSettings({ ...notificationSettings, email_notifications: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-slate-700">Slack Notifications</Label>
              <p className="text-sm text-slate-500">
                Send notifications to your Slack workspace
              </p>
            </div>
            <Switch
              checked={notificationSettings.slack_notifications}
              onCheckedChange={(checked) =>
                setNotificationSettings({ ...notificationSettings, slack_notifications: checked })
              }
            />
          </div>

          {notificationSettings.slack_notifications && (
            <div className="space-y-2">
              <Label htmlFor="slack_webhook_url" className="text-slate-700">
                Slack Webhook URL
              </Label>
              <input
                id="slack_webhook_url"
                type="text"
                placeholder="https://hooks.slack.com/services/..."
                value={notificationSettings.slack_webhook_url}
                onChange={(e) =>
                  setNotificationSettings({
                    ...notificationSettings,
                    slack_webhook_url: e.target.value,
                  })
                }
                className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                required
              />
            </div>
          )}

          <Button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Notification Settings'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}; 