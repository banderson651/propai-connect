import { supabase } from '@/lib/supabase';
import {
  EmailAccount,
  EmailTemplate,
  Campaign,
  CampaignAnalytics,
  CampaignSendSettings,
} from '@/types/email';

// Prefer explicit API URL but fall back to same-origin requests in production.
const API_URL = import.meta.env.VITE_API_URL ?? (import.meta.env.DEV ? 'http://localhost:5000' : '');

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

type EmailSettingsPayload = {
  smtp_host: string;
  smtp_port: number;
  smtp_user: string;
  smtp_password: string;
};

export type CampaignRecipientPayload = {
  contactId?: string | null;
  email: string;
  name?: string;
  substitutionData?: Record<string, unknown>;
};

export type CreateCampaignPayload = {
  name: string;
  subject: string;
  emailAccountId: string;
  templateId?: string | null;
  fromName?: string;
  replyTo?: string;
  htmlBody: string;
  textBody?: string;
  scheduledAt?: string | null;
  sendSettings?: Partial<CampaignSendSettings>;
  recipients: CampaignRecipientPayload[];
  metadata?: Record<string, unknown>;
};

export type UpdateCampaignPayload = Partial<Omit<CreateCampaignPayload, 'recipients'>>;

export type CampaignRecipientQuery = {
  status?: string;
  page?: number;
  pageSize?: number;
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

const bridgeUnavailableMessage = 'Unable to reach the email bridge service. Ensure the background server is running and VITE_API_URL points to it.';

const authedJsonFetch = async <T>(path: string, init: RequestInit = {}): Promise<T> => {
  const baseHeaders = (init.headers || {}) as Record<string, string>;
  const headers = await buildAuthHeaders(baseHeaders);

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...init,
      headers,
    });
  } catch (error) {
    if (error instanceof TypeError && (error.message === 'Failed to fetch' || error.message.includes('NetworkError'))) {
      throw new Error(bridgeUnavailableMessage);
    }
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Unexpected request failure');
  }

  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json') ? await response.json() : null;

  if (!response.ok || (payload && typeof payload === 'object' && 'success' in payload && payload.success === false)) {
    const message = payload?.message || (response.status === 0 ? bridgeUnavailableMessage : `Request failed with status ${response.status}`);
    throw new Error(message);
  }

  return (payload ?? ({} as T)) as T;
};

export const getEmailAccounts = async (): Promise<EmailAccount[]> => {
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error(userError?.message || 'User not authenticated');
  }

  const { data, error } = await supabase
    .from('email_accounts')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return (data || []).map((acc) => ({
    ...acc,
    name: acc.name || acc.email,
    type: acc.type || 'smtp',
    port: acc.port || 587,
    username: acc.username || '',
    secure: acc.secure ?? true,
    smtp_secure: acc.smtp_secure ?? true,
    is_active: acc.is_active ?? true,
    is_default: acc.is_default ?? false,
    status: acc.status || null,
    last_checked: acc.last_checked || null,
    domain_verified: acc.domain_verified ?? false,
  })) as EmailAccount[];
};

export const getEmailTemplates = async (): Promise<EmailTemplate[]> => {
  const result = await authedJsonFetch<{ success: boolean; templates: EmailTemplate[] }>(
    '/api/email-templates'
  );
  return result.templates ?? [];
};

export const getEmailTemplate = async (id: string): Promise<EmailTemplate> => {
  const result = await authedJsonFetch<{ success: boolean; template: EmailTemplate }>(
    `/api/email-templates/${id}`
  );
  return result.template;
};

export const createEmailTemplate = async (payload: Omit<EmailTemplate, 'id' | 'createdAt' | 'updatedAt'>) => {
  const body = {
    name: payload.name,
    subject: payload.subject,
    htmlBody: payload.body ?? payload.htmlBody,
    textBody: payload.textBody ?? null,
    description: payload.description ?? null,
    placeholders: payload.placeholders ?? [],
    metadata: payload.metadata ?? {},
    isPrebuilt: payload.isPrebuilt ?? false,
  };

  const result = await authedJsonFetch<{ success: boolean; template: EmailTemplate }>(
    '/api/email-templates',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }
  );

  return result.template;
};

export const updateEmailTemplate = async (id: string, payload: Partial<EmailTemplate>) => {
  const body = {
    name: payload.name,
    subject: payload.subject,
    htmlBody: payload.body ?? payload.htmlBody,
    textBody: payload.textBody,
    description: payload.description,
    placeholders: payload.placeholders,
    metadata: payload.metadata,
    isPrebuilt: payload.isPrebuilt,
  };

  const result = await authedJsonFetch<{ success: boolean; template: EmailTemplate }>(
    `/api/email-templates/${id}`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }
  );

  return result.template;
};

export const deleteEmailTemplate = async (id: string) => {
  await authedJsonFetch<{ success: boolean }>(`/api/email-templates/${id}`, {
    method: 'DELETE',
  });
};

export const createEmailAccount = async (accountData: CreateEmailAccountPayload) => {
  const result = await authedJsonFetch<{ success: boolean; account: EmailAccount }>(
    '/api/save-email-account',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(accountData),
    }
  );
  return result.account;
};

export const deleteEmailAccount = async (id: string) => {
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

export const testEmailConnection = async (
  account:
    | { id: string }
    | { host: string; port: number; username: string; smtpPass: string; secure: boolean; email: string }
) => {
  const result = await authedJsonFetch<{ success: boolean; message: string }>(
    '/api/test-smtp',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(account),
    }
  );
  return result;
};

export const sendTestEmail = async (account: { id: string }, recipient: string) => {
  const result = await authedJsonFetch<{ success: boolean; message: string }>(
    '/api/send-test-email',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: account.id, recipient }),
    }
  );
  return result;
};

export const saveEmailSettings = async (settings: EmailSettingsPayload) => {
  return authedJsonFetch<{ success: boolean }>(
    '/api/email-settings',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    }
  );
};

export const getEmailCampaigns = async (): Promise<Campaign[]> => {
  const result = await authedJsonFetch<{ success: boolean; campaigns: Campaign[] }>(
    '/api/campaigns'
  );
  return result.campaigns ?? [];
};

export const getEmailCampaign = async (id: string, includeRecipients = false) => {
  const query = includeRecipients ? '?includeRecipients=true' : '';
  const result = await authedJsonFetch<{ success: boolean; campaign: Campaign & { recipients?: unknown[] } }>(
    `/api/campaigns/${id}${query}`
  );
  return result.campaign;
};

export const createEmailCampaign = async (payload: CreateCampaignPayload) => {
  const result = await authedJsonFetch<{ success: boolean; campaign: Campaign }>(
    '/api/campaigns',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }
  );
  return result.campaign;
};

export const updateEmailCampaign = async (id: string, payload: UpdateCampaignPayload) => {
  const result = await authedJsonFetch<{ success: boolean; campaign: Campaign }>(
    `/api/campaigns/${id}`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }
  );
  return result.campaign;
};

export const scheduleEmailCampaign = async (id: string, scheduledAt: string) => {
  const result = await authedJsonFetch<{ success: boolean; campaign: Campaign }>(
    `/api/campaigns/${id}/schedule`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scheduledAt }),
    }
  );
  return result.campaign;
};

export const dispatchEmailCampaign = async (id: string, force = false) => {
  return authedJsonFetch<{ success: boolean; status: string }>(
    `/api/campaigns/${id}/dispatch`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ force }),
    }
  );
};

export const pauseEmailCampaign = async (id: string) => {
  await authedJsonFetch<{ success: boolean }>(`/api/campaigns/${id}/pause`, {
    method: 'POST',
  });
};

export const resumeEmailCampaign = async (id: string) => {
  return authedJsonFetch<{ success: boolean; status: string }>(
    `/api/campaigns/${id}/resume`,
    {
      method: 'POST',
    }
  );
};

export const getEmailCampaignRecipients = async (id: string, query: CampaignRecipientQuery = {}) => {
  const params = new URLSearchParams();
  if (query.status) params.set('status', query.status);
  if (query.page) params.set('page', String(query.page));
  if (query.pageSize) params.set('pageSize', String(query.pageSize));
  const qs = params.toString();
  const result = await authedJsonFetch<{
    success: boolean;
    recipients: unknown[];
    page: number;
    pageSize: number;
    total: number;
  }>(`/api/campaigns/${id}/recipients${qs ? `?${qs}` : ''}`);
  return result;
};

export const getEmailCampaignAnalytics = async (id: string): Promise<CampaignAnalytics> => {
  const result = await authedJsonFetch<{ success: boolean; analytics: CampaignAnalytics }>(
    `/api/campaigns/${id}/analytics`
  );
  return result.analytics;
};

export const buildTrackedLink = (trackingBaseUrl: string | undefined, url: string) => {
  if (!trackingBaseUrl) return url;
  const encoded = encodeURIComponent(url);
  return `${trackingBaseUrl}?url=${encoded}`;
};

export { API_URL };
