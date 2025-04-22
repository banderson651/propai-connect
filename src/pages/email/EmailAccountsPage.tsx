import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { EmailAccountForm } from '@/components/email/EmailAccountForm';
import { SendTestEmailModal } from '@/components/email/SendTestEmailModal';
import { supabase } from '@/lib/supabase';
import type { EmailAccount } from '@/types/email';

const EmailAccountsPage = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [testModalOpen, setTestModalOpen] = useState(false);
  const [testAccount, setTestAccount] = useState<EmailAccount | null>(null);
  const [accounts, setAccounts] = useState<EmailAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch accounts for this user
  const fetchAccounts = async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('email_accounts')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) setError(error.message);
    setAccounts(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchAccounts();
  }, [modalOpen]);

  // Save new account to Supabase (metadata only)
  const handleAccountAdded = async (account: any) => {
    const { host, port, username, from, secure } = account;
    if (!from || !host || !port || !username) {
      setError('All fields are required.');
      return;
    }
    const { data: user } = await supabase.auth.getUser();
    if (!user?.user?.id) {
      setError('User not authenticated.');
      return;
    }
    const { error: insertError } = await supabase.from('email_accounts').insert([
      {
        user_id: user.user.id,
        email: from,
        name: from,
        type: 'smtp',
        host,
        port: port ? Number(port) : null,
        username,
        smtp_secure: !!secure,
      },
    ]);
    if (insertError) {
      setError(insertError.message);
    } else {
      setModalOpen(false);
      fetchAccounts();
    }
  };

  // Open test email modal for selected account
  const handleSendTestEmail = (account: EmailAccount) => {
    setTestAccount(account);
    setTestModalOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="py-8 px-4 md:px-8">
        <h1 className="text-3xl font-bold mb-8">Email Accounts</h1>
        <Card>
          <CardHeader>
            <CardTitle>Connect & Test Accounts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center gap-4">
              <Button variant="outline" onClick={() => setModalOpen(true)}>Connect New Account</Button>
              {loading && <div className="text-gray-500">Loading accounts...</div>}
              {error && <div className="text-red-500">{error}</div>}
              {accounts.length > 0 && (
                <div className="w-full mt-6">
                  <h2 className="text-lg font-semibold mb-2">Your Email Accounts</h2>
                  <ul className="divide-y">
                    {accounts.map(acc => (
                      <li key={acc.id} className="py-2 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                        <span>{acc.email} ({acc.host}:{acc.port})</span>
                        <span className="text-xs text-gray-500">{acc.created_at?.slice(0, 10)}</span>
                        <Button size="sm" variant="secondary" onClick={() => handleSendTestEmail(acc)}>
                          Send Test Email
                        </Button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {accounts.length === 0 && !loading && <div className="text-gray-500">No email accounts connected yet.</div>}
            </div>
          </CardContent>
        </Card>
        <EmailAccountForm open={modalOpen} onOpenChange={setModalOpen} onAccountAdded={handleAccountAdded} />
        <SendTestEmailModal open={testModalOpen} onOpenChange={setTestModalOpen} account={testAccount} />
      </div>
    </DashboardLayout>
  );
};

export default EmailAccountsPage;
