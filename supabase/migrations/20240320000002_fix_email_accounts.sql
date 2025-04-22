-- Drop existing columns if they exist
ALTER TABLE email_accounts
DROP COLUMN IF EXISTS smtp_host,
DROP COLUMN IF EXISTS smtp_port,
DROP COLUMN IF EXISTS smtp_secure,
DROP COLUMN IF EXISTS smtp_username,
DROP COLUMN IF EXISTS smtp_password;

-- Add SMTP fields with NOT NULL constraints
ALTER TABLE email_accounts
ADD COLUMN smtp_host TEXT NOT NULL,
ADD COLUMN smtp_port INTEGER NOT NULL,
ADD COLUMN smtp_secure BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN smtp_username TEXT NOT NULL,
ADD COLUMN smtp_password TEXT NOT NULL;

-- Update existing rows to have default values
UPDATE email_accounts
SET smtp_host = host,
    smtp_port = port,
    smtp_secure = COALESCE(secure, true),
    smtp_username = username,
    smtp_password = password
WHERE smtp_host IS NULL;

-- Add RLS policies if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'email_accounts'
    ) THEN
        ALTER TABLE email_accounts ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Users can view their own email accounts"
        ON email_accounts FOR SELECT
        USING (auth.uid() = user_id);
        
        CREATE POLICY "Users can insert their own email accounts"
        ON email_accounts FOR INSERT
        WITH CHECK (auth.uid() = user_id);
        
        CREATE POLICY "Users can update their own email accounts"
        ON email_accounts FOR UPDATE
        USING (auth.uid() = user_id);
        
        CREATE POLICY "Users can delete their own email accounts"
        ON email_accounts FOR DELETE
        USING (auth.uid() = user_id);
    END IF;
END $$; 