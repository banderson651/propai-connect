-- Harden profile management and email settings access controls

-- Ensure profiles table enforces row level security and prevent role escalation
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role full access to profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can manage own profile" ON public.profiles;

CREATE POLICY "Service role full access to profiles"
  ON public.profiles
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can manage own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND role = COALESCE(
      (
        SELECT role
        FROM public.profiles original
        WHERE original.id = auth.uid()
      ),
      role
    )
  );

-- Enable RLS for email settings if the table exists to keep SMTP secrets scoped to their owner
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'email_settings'
  ) THEN
    EXECUTE 'ALTER TABLE public.email_settings ENABLE ROW LEVEL SECURITY';
    EXECUTE 'DROP POLICY IF EXISTS "Service role full access to email settings" ON public.email_settings';
    EXECUTE 'DROP POLICY IF EXISTS "Users manage own email settings" ON public.email_settings';
    EXECUTE 'CREATE POLICY "Service role full access to email settings" ON public.email_settings FOR ALL USING (auth.role() = ''service_role'') WITH CHECK (auth.role() = ''service_role'')';
    EXECUTE 'CREATE POLICY "Users manage own email settings" ON public.email_settings FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id)';
  END IF;
END
$$;
