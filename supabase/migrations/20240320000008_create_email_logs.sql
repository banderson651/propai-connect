
-- Create the email_logs table
CREATE TABLE IF NOT EXISTS email_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID REFERENCES email_accounts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    to TEXT NOT NULL,
    subject TEXT,
    status TEXT NOT NULL,
    message_id TEXT,
    error TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT valid_status CHECK (status IN ('success', 'failed'))
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_email_logs_account_id ON email_logs(account_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_user_id ON email_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON email_logs(status);
CREATE INDEX IF NOT EXISTS idx_email_logs_created_at ON email_logs(created_at);

-- Add RLS policies
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own email logs"
    ON email_logs FOR SELECT
    USING (
        user_id = auth.uid() OR
        account_id IN (
            SELECT id FROM email_accounts WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert their own email logs"
    ON email_logs FOR INSERT
    WITH CHECK (
        user_id = auth.uid() OR
        account_id IN (
            SELECT id FROM email_accounts WHERE user_id = auth.uid()
        )
    );

-- Create or replace function to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create email_campaigns table if it doesn't exist
CREATE TABLE IF NOT EXISTS email_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    subject TEXT NOT NULL,
    content TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'failed')),
    recipients JSONB,
    scheduled_at TIMESTAMP WITH TIME ZONE,
    sent_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    template_id UUID,
    account_id UUID REFERENCES email_accounts(id) ON DELETE SET NULL,
    statistics JSONB DEFAULT '{"sent": 0, "delivered": 0, "opened": 0, "clicked": 0, "bounced": 0, "complained": 0}'::jsonb
);

-- Add indexes for email_campaigns
CREATE INDEX IF NOT EXISTS idx_email_campaigns_user_id ON email_campaigns(user_id);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_status ON email_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_account_id ON email_campaigns(account_id);

-- Add RLS policies for email_campaigns
ALTER TABLE email_campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own email campaigns"
    ON email_campaigns FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own email campaigns"
    ON email_campaigns FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own email campaigns"
    ON email_campaigns FOR UPDATE
    USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own email campaigns"
    ON email_campaigns FOR DELETE
    USING (user_id = auth.uid());

-- Add trigger for updated_at
CREATE TRIGGER set_email_campaigns_updated_at
    BEFORE UPDATE ON email_campaigns
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
