create table if not exists public.email_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  email text not null,
  name text,
  type text,
  host text,
  port integer,
  username text,
  smtp_secure boolean,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

alter table public.email_accounts enable row level security;

create policy "Users can manage their own email accounts"
  on public.email_accounts
  for all
  using (auth.uid() = user_id);
