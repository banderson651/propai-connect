import { supabase } from '@/lib/supabase';
import { EmailAccount } from '@/types/email';

const API_URL = import.meta.env.VITE_API_URL ?? (import.meta.env.DEV ? 'http://localhost:5000' : undefined);

if (!API_URL) {
  throw new Error('Missing VITE_API_URL environment variable for email service requests');
}

// Export email-related functions and utilities
export * from './gmailAuthService';
export * from './syncService';

type CreateEmailAccountPayload = {
  email: string;
  name: string;
  type: string;
  host: string;
  port: number;
  username: string;
  secure: boolean;
  smtp_secure: boolean;
  is_active: boolean;
  is_default: boolean;
  status: string;
  domain_verified: boolean;
  smtpPass: string;
};

const getAccessToken = async () => {
  const { data, error } = await supabase.auth.getSession();
  if (error || !data.session?.access_token) {
    throw new Error('User not authenticated');
  }
  return data.session.access_token;
};

const buildAuthHeaders = async (headers: Record<string, string> = {}) => {
  const token = await getAccessToken();
  return {
    ...headers,
    Authorization: `Bearer ${token}`,
  };
};

// Fetch all email accounts for the current user
export const getEmailAccounts = async () => {
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error('User not authenticated or error fetching user:', userError);
    // Consider if throwing here is always desired or if returning empty array is better if user is simply not logged in
    throw new Error(userError?.message || 'User not authenticated');
  }
  const { data, error } = await supabase
    .from('email_accounts')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching email accounts:', error);
    throw error;
  }
  // Defensive mapping: ensure all fields are present
  const mapped = (data || []).map((acc) => ({
    id: acc.id,
    user_id: acc.user_id,
    email: acc.email,
    name: acc.name || acc.email,
    type: acc.type || 'smtp',
    host: acc.host || '',
    port: acc.port || 587,
    username: acc.username || '',
    secure: acc.secure !== undefined ? acc.secure : true,
    smtp_secure: acc.smtp_secure !== undefined ? acc.smtp_secure : true,
    is_active: acc.is_active !== undefined ? acc.is_active : true,
    is_default: acc.is_default !== undefined ? acc.is_default : false,
    status: acc.status || null,
    last_checked: acc.last_checked || null,
    created_at: acc.created_at || '',
    updated_at: acc.updated_at || '',
    domain_verified: acc.domain_verified !== undefined ? acc.domain_verified : false,
  }));
  return mapped;
};

export const getEmailTemplates = async () => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000));
  return [
    { id: 'tpl1', name: 'Basic Welcome Template', subject: 'Welcome!', body: '<p>Hello, {{name}}!</p><p>Welcome aboard.</p>', isPrebuilt: true },
    { id: 'tpl2', name: 'Newsletter Template', subject: 'Latest News', body: '<p>Hi,</p><p>Here is the latest news.</p>', isPrebuilt: false }
  ];
};

// Create a new email account for the current user
export const createEmailAccount = async (accountData: CreateEmailAccountPayload) => {
  const response = await fetch(`${API_URL}/api/save-email-account`, {
    method: 'POST',
    headers: await buildAuthHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(accountData),
  });
  const result = await response.json();
  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Failed to save email account');
  }
  return result.account;
};

// Delete an email account by ID for the current user
export const deleteEmailAccount = async (id) => {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) throw new Error('User not authenticated');

  const { error } = await supabase
    .from('email_accounts')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) throw error;
  return { success: true };
};

// --- NEW: Use backend API for SMTP test and send ---

// For testing a *new* account config before saving, pass necessary data
// For testing an *existing* account, pass only the account ID
export const testEmailConnection = async (account: { id: string } | { host: string; port: number; username: string; smtpPass: string; secure: boolean; email: string; }) => {
  const response = await fetch(`${API_URL}/api/test-smtp`, {
    method: 'POST',
    headers: await buildAuthHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(account),
  });
  return response.json();
};

export const sendTestEmail = async (account: { id: string }, recipient: string) => {
  const response = await fetch(`${API_URL}/api/send-test-email`, {
    method: 'POST',
    headers: await buildAuthHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ id: account.id, recipient }),
  });
  const result = await response.json();
  if (!result.success) throw new Error(result.message);
  return result;
};

type EmailSettingsPayload = {
  smtp_host: string;
  smtp_port: number;
  smtp_user: string;
  smtp_password: string;
};

export const saveEmailSettings = async (settings: EmailSettingsPayload) => {
  const response = await fetch(`${API_URL}/api/email-settings`, {
    method: 'POST',
    headers: await buildAuthHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(settings),
  });
  const result = await response.json();
  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Failed to update email settings');
  }
  return result;
};

// Add any additional exports as needed 
