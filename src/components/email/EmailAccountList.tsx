
import React, { useEffect, useState } from 'react';
import { EmailAccount } from '@/types/email';
import { EmailAccountService } from '@/services/email/accountService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmailAccountForm } from './EmailAccountForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { formatDistanceToNow } from 'date-fns';
import { Mail } from 'lucide-react';

export function EmailAccountList() {
  const [accounts, setAccounts] = useState<EmailAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<EmailAccount | null>(null);

  const emailService = EmailAccountService.getInstance();

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      setIsLoading(true);
      const data = await emailService.getAccounts();
      setAccounts(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load email accounts');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAccount = async (data: EmailAccount) => {
    try {
      await emailService.createAccount(data);
      await loadAccounts();
      setIsFormOpen(false);
      setEditingAccount(null);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create email account');
    }
  };

  const handleUpdateAccount = async (data: EmailAccount) => {
    if (!editingAccount) return;
    
    try {
      await emailService.updateAccount(editingAccount.id, data);
      await loadAccounts();
      setIsFormOpen(false);
      setEditingAccount(null);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update email account');
    }
  };

  const handleDeleteAccount = async (id: string) => {
    if (!confirm('Are you sure you want to delete this email account?')) return;
    
    try {
      await emailService.deleteAccount(id);
      await loadAccounts();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to delete email account');
    }
  };

  const handleEditAccount = (account: EmailAccount) => {
    setEditingAccount(account);
    setIsFormOpen(true);
  };

  if (isLoading) {
    return <div>Loading email accounts...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Email Accounts</h2>
          <p className="text-muted-foreground">
            Configure your SMTP email accounts for sending emails
          </p>
        </div>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button>Add Email Account</Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>
                {editingAccount ? 'Edit Email Account' : 'Add Email Account'}
              </DialogTitle>
            </DialogHeader>
            <EmailAccountForm
              initialData={editingAccount || undefined}
              onSubmit={editingAccount ? handleUpdateAccount : handleCreateAccount}
              onCancel={() => {
                setIsFormOpen(false);
                setEditingAccount(null);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {accounts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <Mail className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No Email Accounts</h3>
            <p className="text-muted-foreground text-center mt-2">
              Add an email account to start sending emails directly via SMTP.
            </p>
            <Button className="mt-4" onClick={() => setIsFormOpen(true)}>
              Add Email Account
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {accounts.map((account) => (
            <Card key={account.id}>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {account.display_name || account.email}
                    {account.is_default && (
                      <Badge variant="secondary">Default</Badge>
                    )}
                  </CardTitle>
                  <CardDescription>{account.email}</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditAccount(account)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteAccount(account.id)}
                  >
                    Delete
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium mb-2">IMAP Settings</h3>
                    <dl className="space-y-1 text-sm">
                      <div>
                        <dt className="text-gray-500">Host</dt>
                        <dd>{account.imap_host}:{account.imap_port}</dd>
                      </div>
                      <div>
                        <dt className="text-gray-500">Username</dt>
                        <dd>{account.imap_username}</dd>
                      </div>
                      <div>
                        <dt className="text-gray-500">Security</dt>
                        <dd>{account.imap_secure ? 'SSL/TLS' : 'None'}</dd>
                      </div>
                    </dl>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">SMTP Settings (Direct Send)</h3>
                    <dl className="space-y-1 text-sm">
                      <div>
                        <dt className="text-gray-500">Host</dt>
                        <dd>{account.smtp_host}:{account.smtp_port}</dd>
                      </div>
                      <div>
                        <dt className="text-gray-500">Username</dt>
                        <dd>{account.smtp_username}</dd>
                      </div>
                      <div>
                        <dt className="text-gray-500">Security</dt>
                        <dd>{account.smtp_secure ? 'SSL/TLS' : 'None'}</dd>
                      </div>
                    </dl>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t">
                  <dl className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <dt className="text-gray-500">Status</dt>
                      <dd>
                        <Badge variant={account.is_active ? "default" : "secondary"}>
                          {account.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </dd>
                    </div>
                    <div>
                      <dt className="text-gray-500">Sync Frequency</dt>
                      <dd>Every {account.sync_frequency} minutes</dd>
                    </div>
                    <div>
                      <dt className="text-gray-500">Max Emails per Sync</dt>
                      <dd>{account.max_emails_per_sync}</dd>
                    </div>
                    <div>
                      <dt className="text-gray-500">Last Sync</dt>
                      <dd>
                        {account.last_sync_at
                          ? formatDistanceToNow(new Date(account.last_sync_at), { addSuffix: true })
                          : 'Never'}
                      </dd>
                    </div>
                  </dl>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
