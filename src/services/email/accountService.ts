
import { EmailAccount, EmailTestResult } from '@/types/email';
import { mockEmailAccounts } from '../emailMockData';
import { v4 as uuidv4 } from 'uuid';
import { testEmailConnection } from './emailUtils';

// Email Accounts
export const getEmailAccounts = (): Promise<EmailAccount[]> => {
  return Promise.resolve([...mockEmailAccounts]);
};

export const getEmailAccountById = (id: string): Promise<EmailAccount | undefined> => {
  const account = mockEmailAccounts.find(account => account.id === id);
  return Promise.resolve(account);
};

export const createEmailAccount = async (account: Omit<EmailAccount, 'id' | 'status' | 'lastChecked'>): Promise<EmailAccount> => {
  // First test the connection before saving
  const connectionResult = await testEmailConnection({
    id: 'temp-id',
    type: account.type,
    host: account.host,
    port: account.port,
    username: account.username,
    password: account.password,
    email: account.email,
    secure: account.secure
  });

  if (!connectionResult.success) {
    // If connection test fails, throw an error with the message
    throw new Error(connectionResult.message);
  }
  
  // If connection is successful, create the account
  const newAccount: EmailAccount = {
    ...account,
    id: uuidv4(),
    status: 'connected',
    lastChecked: new Date().toISOString(),
  };
  
  mockEmailAccounts.push(newAccount);
  return Promise.resolve(newAccount);
};

export const updateEmailAccount = (id: string, updates: Partial<EmailAccount>): Promise<EmailAccount | undefined> => {
  const index = mockEmailAccounts.findIndex(account => account.id === id);
  if (index === -1) return Promise.resolve(undefined);
  
  mockEmailAccounts[index] = { ...mockEmailAccounts[index], ...updates };
  return Promise.resolve(mockEmailAccounts[index]);
};

export const deleteEmailAccount = (id: string): Promise<boolean> => {
  const index = mockEmailAccounts.findIndex(account => account.id === id);
  if (index === -1) return Promise.resolve(false);
  
  mockEmailAccounts.splice(index, 1);
  return Promise.resolve(true);
};

// Test Email functionality moved to emailUtils.ts
export { testEmailConnection } from './emailUtils';
export { sendTestEmail } from './emailUtils';
