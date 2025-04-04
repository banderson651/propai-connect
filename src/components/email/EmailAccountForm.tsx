
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { EmailAccount, EmailAccountCreate, EmailAccountUpdate, EmailAccountType } from '@/types/email';
import { EmailAccountService } from '@/services/email/accountService';
import { GmailAuthService } from '@/services/email/gmailAuthService';

const emailAccountSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(1, 'Name is required'),
  display_name: z.string().optional(),
  
  // Connection Settings
  type: z.enum(['imap', 'pop3'] as const),
  host: z.string().min(1, 'Host is required'),
  port: z.number().min(1).max(65535, 'Port must be between 1 and 65535'),
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
  secure: z.boolean(),
  
  // IMAP Settings
  imap_host: z.string().min(1, 'IMAP host is required'),
  imap_port: z.number().min(1).max(65535, 'Port must be between 1 and 65535'),
  imap_username: z.string().min(1, 'IMAP username is required'),
  imap_password: z.string().min(1, 'IMAP password is required'),
  imap_secure: z.boolean(),
  
  // SMTP Settings
  smtp_host: z.string().min(1, 'SMTP host is required'),
  smtp_port: z.number().min(1).max(65535, 'Port must be between 1 and 65535'),
  smtp_username: z.string().min(1, 'SMTP username is required'),
  smtp_password: z.string().min(1, 'SMTP password is required'),
  smtp_secure: z.boolean(),
  
  // Additional Settings
  is_default: z.boolean().optional(),
  is_active: z.boolean().optional(),
  sync_frequency: z.number().min(1).optional(),
  max_emails_per_sync: z.number().min(1).optional(),
});

interface EmailAccountFormProps {
  initialData?: EmailAccountCreate;
  onSubmit: (data: EmailAccountCreate) => Promise<void>;
  onCancel: () => void;
}

export function EmailAccountForm({ initialData, onSubmit, onCancel }: EmailAccountFormProps) {
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<EmailAccountCreate>({
    resolver: zodResolver(emailAccountSchema),
    defaultValues: initialData || {
      email: '',
      name: '',
      display_name: '',
      type: 'imap',
      host: '',
      port: 993,
      username: '',
      password: '',
      secure: true,
      imap_host: '',
      imap_port: 993,
      imap_username: '',
      imap_password: '',
      imap_secure: true,
      smtp_host: '',
      smtp_port: 587,
      smtp_username: '',
      smtp_password: '',
      smtp_secure: true,
      is_default: false,
      is_active: true,
      sync_frequency: 5,
      max_emails_per_sync: 100,
    },
  });

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    
    try {
      const data = form.getValues();
      const emailService = EmailAccountService.getInstance();
      const results = await emailService.testConnection(data as any);
      
      const allSuccessful = results.every(result => result.success);
      setTestResult({
        success: allSuccessful,
        message: allSuccessful 
          ? 'Connection test successful!'
          : results.map(r => r.message).join('\n')
      });
    } catch (error) {
      setTestResult({
        success: false,
        message: error instanceof Error ? error.message : 'Connection test failed'
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSubmit = async (data: EmailAccountCreate) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGmailAuth = () => {
    const gmailAuth = GmailAuthService.getInstance();
    window.location.href = gmailAuth.getAuthUrl();
  };

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Email Account Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-center mb-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleGmailAuth}
              className="flex items-center gap-2"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Connect Gmail Account
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or configure manually
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                {...form.register('email')}
                type="email"
                placeholder="user@example.com"
              />
              {form.formState.errors.email && (
                <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Account Name</Label>
              <Input
                id="name"
                {...form.register('name')}
                placeholder="My Work Email"
              />
              {form.formState.errors.name && (
                <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="display_name">Display Name</Label>
              <Input
                id="display_name"
                {...form.register('display_name')}
                placeholder="John Doe"
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-medium">IMAP Settings</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="imap_host">IMAP Host</Label>
                <Input
                  id="imap_host"
                  {...form.register('imap_host')}
                  placeholder="imap.example.com"
                />
                {form.formState.errors.imap_host && (
                  <p className="text-sm text-red-500">{form.formState.errors.imap_host.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="imap_port">IMAP Port</Label>
                <Input
                  id="imap_port"
                  {...form.register('imap_port', { valueAsNumber: true })}
                  type="number"
                  placeholder="993"
                />
                {form.formState.errors.imap_port && (
                  <p className="text-sm text-red-500">{form.formState.errors.imap_port.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="imap_username">IMAP Username</Label>
                <Input
                  id="imap_username"
                  {...form.register('imap_username')}
                  placeholder="user@example.com"
                />
                {form.formState.errors.imap_username && (
                  <p className="text-sm text-red-500">{form.formState.errors.imap_username.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="imap_password">IMAP Password</Label>
                <Input
                  id="imap_password"
                  {...form.register('imap_password')}
                  type="password"
                />
                {form.formState.errors.imap_password && (
                  <p className="text-sm text-red-500">{form.formState.errors.imap_password.message}</p>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="imap_secure"
                  {...form.register('imap_secure')}
                />
                <Label htmlFor="imap_secure">Use SSL/TLS</Label>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-medium">SMTP Settings</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="smtp_host">SMTP Host</Label>
                <Input
                  id="smtp_host"
                  {...form.register('smtp_host')}
                  placeholder="smtp.example.com"
                />
                {form.formState.errors.smtp_host && (
                  <p className="text-sm text-red-500">{form.formState.errors.smtp_host.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="smtp_port">SMTP Port</Label>
                <Input
                  id="smtp_port"
                  {...form.register('smtp_port', { valueAsNumber: true })}
                  type="number"
                  placeholder="587"
                />
                {form.formState.errors.smtp_port && (
                  <p className="text-sm text-red-500">{form.formState.errors.smtp_port.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="smtp_username">SMTP Username</Label>
                <Input
                  id="smtp_username"
                  {...form.register('smtp_username')}
                  placeholder="user@example.com"
                />
                {form.formState.errors.smtp_username && (
                  <p className="text-sm text-red-500">{form.formState.errors.smtp_username.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="smtp_password">SMTP Password</Label>
                <Input
                  id="smtp_password"
                  {...form.register('smtp_password')}
                  type="password"
                />
                {form.formState.errors.smtp_password && (
                  <p className="text-sm text-red-500">{form.formState.errors.smtp_password.message}</p>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="smtp_secure"
                  {...form.register('smtp_secure')}
                />
                <Label htmlFor="smtp_secure">Use SSL/TLS</Label>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-medium">Additional Settings</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_default"
                  {...form.register('is_default')}
                />
                <Label htmlFor="is_default">Set as Default Account</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  {...form.register('is_active')}
                />
                <Label htmlFor="is_active">Active</Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sync_frequency">Sync Frequency (minutes)</Label>
                <Input
                  id="sync_frequency"
                  {...form.register('sync_frequency', { valueAsNumber: true })}
                  type="number"
                  min="1"
                  placeholder="5"
                />
                {form.formState.errors.sync_frequency && (
                  <p className="text-sm text-red-500">{form.formState.errors.sync_frequency.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="max_emails_per_sync">Max Emails per Sync</Label>
                <Input
                  id="max_emails_per_sync"
                  {...form.register('max_emails_per_sync', { valueAsNumber: true })}
                  type="number"
                  min="1"
                  placeholder="100"
                />
                {form.formState.errors.max_emails_per_sync && (
                  <p className="text-sm text-red-500">{form.formState.errors.max_emails_per_sync.message}</p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {testResult && (
        <Alert variant={testResult.success ? "default" : "destructive"}>
          <AlertDescription>{testResult.message}</AlertDescription>
        </Alert>
      )}

      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={handleTestConnection}
          disabled={isTesting || isSubmitting}
        >
          {isTesting ? 'Testing...' : 'Test Connection'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting || !testResult?.success}
        >
          {isSubmitting ? 'Saving...' : 'Save Account'}
        </Button>
      </div>
    </form>
  );
}
