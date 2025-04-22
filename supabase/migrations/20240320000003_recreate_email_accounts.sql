-- Drop existing table if it exists
DROP TABLE IF EXISTS email_accounts;

-- Create email_accounts table with proper structure
CREATE TABLE email_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    display_name VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- IMAP Settings
    imap_host VARCHAR(255) NOT NULL,
    imap_port INTEGER NOT NULL,
    imap_username VARCHAR(255) NOT NULL,
    imap_password VARCHAR(255) NOT NULL,
    imap_secure BOOLEAN NOT NULL DEFAULT true,
    
    -- SMTP Settings
    smtp_host VARCHAR(255) NOT NULL,
    smtp_port INTEGER NOT NULL,
    smtp_username VARCHAR(255) NOT NULL,
    smtp_password VARCHAR(255) NOT NULL,
    smtp_secure BOOLEAN NOT NULL DEFAULT true,
    
    -- Additional Settings
    is_default BOOLEAN NOT NULL DEFAULT false,
    is_active BOOLEAN NOT NULL DEFAULT true,
    last_sync_at TIMESTAMPTZ,
    sync_frequency INTEGER NOT NULL DEFAULT 5, -- minutes
    max_emails_per_sync INTEGER NOT NULL DEFAULT 100,
    
    -- Constraints
    CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT valid_ports CHECK (
        imap_port > 0 AND imap_port <= 65535 AND
        smtp_port > 0 AND smtp_port <= 65535
    ),
    CONSTRAINT valid_sync_frequency CHECK (sync_frequency >= 1),
    CONSTRAINT valid_max_emails CHECK (max_emails_per_sync >= 1)
);

-- Create index for faster lookups
CREATE INDEX idx_email_accounts_user_id ON email_accounts(user_id);
CREATE INDEX idx_email_accounts_email ON email_accounts(email);

-- Enable Row Level Security
ALTER TABLE email_accounts ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own email accounts"
    ON email_accounts FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own email accounts"
    ON email_accounts FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own email accounts"
    ON email_accounts FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own email accounts"
    ON email_accounts FOR DELETE
    USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_email_accounts_updated_at
    BEFORE UPDATE ON email_accounts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 