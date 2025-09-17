-- Enable admin-level read access across key tables by checking the profiles.role flag.

create or replace function public.is_admin(uid uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = uid
      and p.role = 'admin'
  );
$$;

grant execute on function public.is_admin(uuid) to authenticated;

create policy "Admin can view all profiles"
  on public.profiles
  for select
  using (public.is_admin(auth.uid()));

create policy "Admin can view all properties"
  on public.properties
  for select
  using (public.is_admin(auth.uid()));

create policy "Admin can view all contacts"
  on public.contacts
  for select
  using (public.is_admin(auth.uid()));

create policy "Admin can view all tasks"
  on public.tasks
  for select
  using (public.is_admin(auth.uid()));

create policy "Admin can view all email accounts"
  on public.email_accounts
  for select
  using (public.is_admin(auth.uid()));

create policy "Admin can view all email campaigns"
  on public.email_campaigns
  for select
  using (public.is_admin(auth.uid()));

create policy "Admin can view all campaign recipients"
  on public.email_campaign_recipients
  for select
  using (public.is_admin(auth.uid()));

create policy "Admin can view all email templates"
  on public.email_templates
  for select
  using (public.is_admin(auth.uid()));

create policy "Admin can view all notifications"
  on public.notifications
  for select
  using (public.is_admin(auth.uid()));

create policy "Admin can view all interactions"
  on public.interactions
  for select
  using (public.is_admin(auth.uid()));

create policy "Admin can view all automation rules"
  on public.automation_rules
  for select
  using (public.is_admin(auth.uid()));

create policy "Admin can view all contact imports"
  on public.contact_imports
  for select
  using (public.is_admin(auth.uid()));

create policy "Admin can view all contact import mappings"
  on public.contact_import_mappings
  for select
  using (public.is_admin(auth.uid()));
