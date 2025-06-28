
import React from 'react';
import { EmailAccountList } from '@/components/email/EmailAccountList';
import { EmailList } from '@/components/email/EmailList';
import { getEmailAccounts } from '@/services/email/accountService';

export default async function EmailPage() {
  const accounts = await getEmailAccounts();
  const defaultAccount = accounts.find(account => account.is_default === true);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Email Management</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <EmailAccountList />
        </div>
        
        <div className="lg:col-span-2">
          {defaultAccount ? (
            <EmailList account={defaultAccount} />
          ) : (
            <div className="text-center text-gray-500">
              Add an email account to view your emails.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
