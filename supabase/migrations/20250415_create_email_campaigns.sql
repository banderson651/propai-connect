-- Email Campaigns Table
create table if not exists public.email_campaigns (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  name text not null,
  description text,
  template_id uuid references public.email_templates,
  sender_account_id uuid references public.email_accounts,
  scheduled_at timestamp with time zone,
  status text default 'draft', -- draft, scheduled, sending, sent, failed
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Email Campaign Recipients Table
create table if not exists public.email_campaign_recipients (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid references public.email_campaigns not null,
  contact_id uuid references public.contacts not null,
  email text not null,
  status text default 'pending', -- pending, sent, failed
  sent_at timestamp with time zone,
  error text
);

alter table public.email_campaigns enable row level security;
alter table public.email_campaign_recipients enable row level security;

create policy "Users can manage their own campaigns"
  on public.email_campaigns
  for all
  using (auth.uid() = user_id);

create policy "Users can view their own campaign recipients"
  on public.email_campaign_recipients
  for select
  using (campaign_id in (select id from public.email_campaigns where user_id = auth.uid()));
