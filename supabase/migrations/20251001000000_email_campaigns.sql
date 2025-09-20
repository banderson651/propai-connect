-- Email campaign infrastructure

-- Templates store reusable content with merge fields
CREATE TABLE IF NOT EXISTS public.email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  html_body TEXT NOT NULL,
  text_body TEXT,
  description TEXT,
  placeholders JSONB NOT NULL DEFAULT '[]'::jsonb,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_prebuilt BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_email_templates_user_id
  ON public.email_templates(user_id);

ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Email templates are readable by owner"
  ON public.email_templates
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Email templates are insertable by owner"
  ON public.email_templates
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Email templates are updatable by owner"
  ON public.email_templates
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Email templates are deletable by owner"
  ON public.email_templates
  FOR DELETE
  USING (auth.uid() = user_id);

CREATE TRIGGER set_email_templates_updated_at
  BEFORE UPDATE ON public.email_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();


-- Campaign master record
CREATE TABLE IF NOT EXISTS public.email_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email_account_id UUID NOT NULL REFERENCES public.email_accounts(id) ON DELETE CASCADE,
  template_id UUID REFERENCES public.email_templates(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  from_name TEXT,
  reply_to TEXT,
  html_body TEXT NOT NULL,
  text_body TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  scheduled_at TIMESTAMP WITH TIME ZONE,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  send_settings JSONB NOT NULL DEFAULT jsonb_build_object(
    'batch_size', 50,
    'interval_seconds', 60,
    'hourly_cap', NULL,
    'daily_cap', NULL
  ),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  metrics JSONB NOT NULL DEFAULT jsonb_build_object(
    'queued', 0,
    'sent', 0,
    'delivered', 0,
    'opened', 0,
    'clicked', 0,
    'bounced', 0,
    'failed', 0,
    'unsubscribed', 0
  ),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc', now())
);

ALTER TABLE public.email_campaigns
  ADD CONSTRAINT email_campaigns_status_check
  CHECK (status IN ('draft', 'scheduled', 'sending', 'paused', 'completed', 'failed', 'cancelled'));

CREATE INDEX IF NOT EXISTS idx_email_campaigns_user_id
  ON public.email_campaigns(user_id);

CREATE INDEX IF NOT EXISTS idx_email_campaigns_account_id
  ON public.email_campaigns(email_account_id);

CREATE INDEX IF NOT EXISTS idx_email_campaigns_status
  ON public.email_campaigns(status);

ALTER TABLE public.email_campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Email campaigns are readable by owner"
  ON public.email_campaigns
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Email campaigns are insertable by owner"
  ON public.email_campaigns
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Email campaigns are updatable by owner"
  ON public.email_campaigns
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Email campaigns are deletable by owner"
  ON public.email_campaigns
  FOR DELETE
  USING (auth.uid() = user_id);

CREATE TRIGGER set_email_campaigns_updated_at
  BEFORE UPDATE ON public.email_campaigns
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();


-- Recipients represent individual deliveries and their state machine
CREATE TABLE IF NOT EXISTS public.email_campaign_recipients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES public.email_campaigns(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES public.contacts(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  name TEXT,
  substitution_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'pending',
  last_error TEXT,
  send_attempts INTEGER NOT NULL DEFAULT 0,
  scheduled_at TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  opened_at TIMESTAMP WITH TIME ZONE,
  clicked_at TIMESTAMP WITH TIME ZONE,
  bounced_at TIMESTAMP WITH TIME ZONE,
  complained_at TIMESTAMP WITH TIME ZONE,
  unsubscribed_at TIMESTAMP WITH TIME ZONE,
  open_count INTEGER NOT NULL DEFAULT 0,
  click_count INTEGER NOT NULL DEFAULT 0,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc', now())
);

ALTER TABLE public.email_campaign_recipients
  ADD CONSTRAINT email_campaign_recipients_status_check
  CHECK (status IN (
    'pending', 'queued', 'sending', 'sent', 'delivered', 'opened',
    'clicked', 'bounced', 'failed', 'complained', 'unsubscribed'
  ));

CREATE UNIQUE INDEX IF NOT EXISTS uniq_email_campaign_recipient_email
  ON public.email_campaign_recipients(campaign_id, email);

CREATE INDEX IF NOT EXISTS idx_email_campaign_recipients_campaign_id
  ON public.email_campaign_recipients(campaign_id);

CREATE INDEX IF NOT EXISTS idx_email_campaign_recipients_status
  ON public.email_campaign_recipients(status);

ALTER TABLE public.email_campaign_recipients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Email campaign recipients are readable by owner"
  ON public.email_campaign_recipients
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.email_campaigns c
      WHERE c.id = campaign_id
        AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "Email campaign recipients are insertable by owner"
  ON public.email_campaign_recipients
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.email_campaigns c
      WHERE c.id = campaign_id
        AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "Email campaign recipients are updatable by owner"
  ON public.email_campaign_recipients
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.email_campaigns c
      WHERE c.id = campaign_id
        AND c.user_id = auth.uid()
    )
  );

CREATE TRIGGER set_email_campaign_recipients_updated_at
  BEFORE UPDATE ON public.email_campaign_recipients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();


-- Event log keeps fine-grained actions for analytics (opens, clicks, etc.)
CREATE TABLE IF NOT EXISTS public.email_campaign_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES public.email_campaigns(id) ON DELETE CASCADE,
  recipient_id UUID REFERENCES public.email_campaign_recipients(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  occurred_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc', now())
);

ALTER TABLE public.email_campaign_events
  ADD CONSTRAINT email_campaign_events_type_check
  CHECK (event_type IN (
    'queued', 'sending', 'sent', 'delivered', 'opened', 'clicked',
    'bounced', 'failed', 'complained', 'unsubscribed'
  ));

CREATE INDEX IF NOT EXISTS idx_email_campaign_events_campaign_id
  ON public.email_campaign_events(campaign_id);

CREATE INDEX IF NOT EXISTS idx_email_campaign_events_recipient_id
  ON public.email_campaign_events(recipient_id);

CREATE INDEX IF NOT EXISTS idx_email_campaign_events_type
  ON public.email_campaign_events(event_type);

ALTER TABLE public.email_campaign_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Email campaign events are readable by owner"
  ON public.email_campaign_events
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.email_campaigns c
      WHERE c.id = campaign_id
        AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "Email campaign events are insertable by owner"
  ON public.email_campaign_events
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.email_campaigns c
      WHERE c.id = campaign_id
        AND c.user_id = auth.uid()
    )
  );


-- Email account knobs for rate limiting and tracking
ALTER TABLE public.email_accounts
  ADD COLUMN IF NOT EXISTS from_name TEXT,
  ADD COLUMN IF NOT EXISTS reply_to TEXT,
  ADD COLUMN IF NOT EXISTS hourly_send_limit INTEGER,
  ADD COLUMN IF NOT EXISTS daily_send_limit INTEGER,
  ADD COLUMN IF NOT EXISTS warmup BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS last_smtp_error TEXT,
  ADD COLUMN IF NOT EXISTS last_sent_at TIMESTAMP WITH TIME ZONE;

-- Helper function to atomically increment campaign metrics
CREATE OR REPLACE FUNCTION public.increment_campaign_metrics(campaign_uuid UUID, delta JSONB)
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
  current_metrics JSONB;
  key TEXT;
  current_value INTEGER;
  delta_value INTEGER;
BEGIN
  IF delta IS NULL THEN
    RETURN;
  END IF;

  SELECT metrics
  INTO current_metrics
  FROM public.email_campaigns
  WHERE id = campaign_uuid
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN;
  END IF;

  FOR key IN SELECT jsonb_object_keys(delta)
  LOOP
    delta_value := COALESCE((delta ->> key)::INTEGER, 0);
    IF delta_value = 0 THEN
      CONTINUE;
    END IF;
    current_value := COALESCE((current_metrics ->> key)::INTEGER, 0);
    current_metrics := jsonb_set(
      current_metrics,
      ARRAY[key],
      to_jsonb(current_value + delta_value),
      TRUE
    );
  END LOOP;

  UPDATE public.email_campaigns
  SET metrics = current_metrics,
      updated_at = timezone('utc', now())
  WHERE id = campaign_uuid;
END;
$$;
