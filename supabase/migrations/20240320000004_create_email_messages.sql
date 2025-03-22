-- Create email_messages table
CREATE TABLE IF NOT EXISTS email_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID NOT NULL REFERENCES email_accounts(id) ON DELETE CASCADE,
    message_id TEXT NOT NULL,
    uid INTEGER NOT NULL,
    subject TEXT,
    "from" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    text TEXT,
    html TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(account_id, message_id)
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_email_messages_account_id ON email_messages(account_id);
CREATE INDEX IF NOT EXISTS idx_email_messages_date ON email_messages(date);
CREATE INDEX IF NOT EXISTS idx_email_messages_from ON email_messages("from");
CREATE INDEX IF NOT EXISTS idx_email_messages_to ON email_messages("to");

-- Add RLS policies
ALTER TABLE email_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own email messages"
    ON email_messages FOR SELECT
    USING (
        account_id IN (
            SELECT id FROM email_accounts WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert their own email messages"
    ON email_messages FOR INSERT
    WITH CHECK (
        account_id IN (
            SELECT id FROM email_accounts WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their own email messages"
    ON email_messages FOR UPDATE
    USING (
        account_id IN (
            SELECT id FROM email_accounts WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete their own email messages"
    ON email_messages FOR DELETE
    USING (
        account_id IN (
            SELECT id FROM email_accounts WHERE user_id = auth.uid()
        )
    );

-- Add trigger for updated_at
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON email_messages
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 