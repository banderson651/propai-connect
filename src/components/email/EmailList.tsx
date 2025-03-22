import React, { useEffect, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { EmailAccount } from '@/types/email';
import { EmailSyncService } from '@/services/email/syncService';

interface EmailMessage {
  id: string;
  subject: string;
  from: string;
  to: string;
  date: string;
  text: string;
  html?: string;
}

interface EmailListProps {
  account: EmailAccount;
}

export function EmailList({ account }: EmailListProps) {
  const [messages, setMessages] = useState<EmailMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<string | null>(null);

  const emailSyncService = EmailSyncService.getInstance();

  useEffect(() => {
    loadMessages();
  }, [account.id]);

  const loadMessages = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('email_messages')
        .select('*')
        .eq('account_id', account.id)
        .order('date', { ascending: false })
        .limit(50);

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load emails');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSync = async () => {
    try {
      setIsSyncing(true);
      const result = await emailSyncService.syncEmails(account);
      setSyncResult(result.message);
      if (result.success) {
        await loadMessages();
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to sync emails');
    } finally {
      setIsSyncing(false);
    }
  };

  if (isLoading) {
    return <div>Loading emails...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Emails</h2>
        <Button
          onClick={handleSync}
          disabled={isSyncing}
        >
          {isSyncing ? 'Syncing...' : 'Sync Now'}
        </Button>
      </div>

      {syncResult && (
        <Alert>
          <AlertDescription>{syncResult}</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        {messages.map((message) => (
          <Card key={message.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{message.subject}</CardTitle>
                <Badge variant="outline">
                  {formatDistanceToNow(new Date(message.date), { addSuffix: true })}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-sm text-gray-500">
                  From: {message.from}
                </div>
                <div className="text-sm text-gray-500">
                  To: {message.to}
                </div>
                <div className="mt-4">
                  {message.html ? (
                    <div
                      dangerouslySetInnerHTML={{ __html: message.html }}
                      className="prose max-w-none"
                    />
                  ) : (
                    <p className="whitespace-pre-wrap">{message.text}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {messages.length === 0 && (
          <div className="text-center text-gray-500">
            No emails found. Click "Sync Now" to fetch your emails.
          </div>
        )}
      </div>
    </div>
  );
} 