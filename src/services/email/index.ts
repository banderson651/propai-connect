import { supabase } from '@/integrations/supabase/client';
import { EmailAccount } from '@/types/email';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Export email-related functions and utilities
export * from './gmailAuthService';
export * from './syncService';
export * from './emailUtils';

// Fetch all email accounts for the current user
export const getEmailAccounts = async () => {
  console.log('Attempting to get user for email accounts...');
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error('User not authenticated or error fetching user:', userError);
    // Consider if throwing here is always desired or if returning empty array is better if user is simply not logged in
    throw new Error(userError?.message || 'User not authenticated');
  }
  console.log('Current user ID fetched:', user.id);

  console.log('Attempting to fetch email accounts for user:', user.id);
  const { data, error } = await supabase
    .from('email_accounts')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  console.log('Supabase query executed.', 'error:', error, 'data:', data);

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
  console.log('Fetched and mapped email accounts:', mapped);
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
export const createEmailAccount = async (accountData: EmailAccount & { smtpPass: string }) => {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    console.error('User not authenticated:', userError);
    throw new Error('User not authenticated');
  }
  console.log('Current user ID:', user.id);

  const response = await fetch(`${API_URL}/api/save-email-account`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...accountData, user_id: user.id, id: accountData.id || Date.now().toString() }), // Include user_id and id
  });
  const result = await response.json();
  if (!result.success) throw new Error(result.message);
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
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(account),
  });
  return response.json();
};

export const sendTestEmail = async (account: { id: string }, recipient: string) => {
  const response = await fetch(`${API_URL}/api/send-test-email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: account.id, recipient }),
  });
  const result = await response.json();
  if (!result.success) throw new Error(result.message);
  return result;
};

// Add any additional exports as needed 