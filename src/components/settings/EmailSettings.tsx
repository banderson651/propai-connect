import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

interface EmailSettingsProps {
  user: User | null;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

interface EmailSettingsData {
  smtp_host: string;
  smtp_port: number;
  smtp_user: string;
  smtp_password: string;
}

export const EmailSettings = ({ user, isLoading, setIsLoading }: EmailSettingsProps) => {
  const { toast } = useToast();
  const [emailSettings, setEmailSettings] = useState<EmailSettingsData>({
    smtp_host: '',
    smtp_port: 587,
    smtp_user: '',
    smtp_password: '',
  });

  const handleEmailSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Update email settings in Supabase
      const { error } = await supabase
        .from('email_settings')
        .upsert({
          user_id: user?.id,
          smtp_host: emailSettings.smtp_host,
          smtp_port: emailSettings.smtp_port,
          smtp_user: emailSettings.smtp_user,
          smtp_password: emailSettings.smtp_password,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      toast({
        title: 'Email settings updated',
        description: 'Your email settings have been successfully updated.',
      });
    } catch (error) {
      console.error('Error updating email settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to update email settings. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-slate-200">
      <CardHeader>
        <CardTitle className="text-xl text-slate-900">Email Server Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleEmailSettingsSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="smtp_host" className="text-slate-700">SMTP Host</Label>
            <Input
              id="smtp_host"
              type="text"
              placeholder="smtp.example.com"
              value={emailSettings.smtp_host}
              onChange={(e) => setEmailSettings({ ...emailSettings, smtp_host: e.target.value })}
              required
              className="border-slate-200"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="smtp_port" className="text-slate-700">SMTP Port</Label>
            <Input
              id="smtp_port"
              type="number"
              placeholder="587"
              value={emailSettings.smtp_port}
              onChange={(e) => setEmailSettings({ ...emailSettings, smtp_port: parseInt(e.target.value) })}
              required
              className="border-slate-200"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="smtp_user" className="text-slate-700">SMTP Username</Label>
            <Input
              id="smtp_user"
              type="text"
              placeholder="your-email@example.com"
              value={emailSettings.smtp_user}
              onChange={(e) => setEmailSettings({ ...emailSettings, smtp_user: e.target.value })}
              required
              className="border-slate-200"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="smtp_password" className="text-slate-700">SMTP Password</Label>
            <Input
              id="smtp_password"
              type="password"
              placeholder="••••••••"
              value={emailSettings.smtp_password}
              onChange={(e) => setEmailSettings({ ...emailSettings, smtp_password: e.target.value })}
              required
              className="border-slate-200"
            />
          </div>

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
              'Save Email Settings'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}; 