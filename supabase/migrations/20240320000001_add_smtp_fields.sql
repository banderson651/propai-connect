-- Add SMTP fields to email_accounts table
ALTER TABLE email_accounts
ADD COLUMN IF NOT EXISTS smtp_host TEXT,
ADD COLUMN IF NOT EXISTS smtp_port INTEGER,
ADD COLUMN IF NOT EXISTS smtp_secure BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS smtp_username TEXT,
ADD COLUMN IF NOT EXISTS smtp_password TEXT;

-- Update existing rows to have default values
UPDATE email_accounts
SET smtp_host = host,
    smtp_port = port,
    smtp_secure = secure,
    smtp_username = username,
    smtp_password = password
WHERE smtp_host IS NULL; 