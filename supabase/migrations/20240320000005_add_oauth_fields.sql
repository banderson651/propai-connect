-- Add OAuth fields to email_accounts table
ALTER TABLE email_accounts
ADD COLUMN IF NOT EXISTS oauth_provider TEXT,
ADD COLUMN IF NOT EXISTS oauth_access_token TEXT,
ADD COLUMN IF NOT EXISTS oauth_refresh_token TEXT,
ADD COLUMN IF NOT EXISTS oauth_expires_at TIMESTAMP WITH TIME ZONE;

-- Add index for OAuth provider
CREATE INDEX IF NOT EXISTS idx_email_accounts_oauth_provider ON email_accounts(oauth_provider);

-- Add check constraint for OAuth fields
ALTER TABLE email_accounts
ADD CONSTRAINT check_oauth_fields
CHECK (
  (oauth_provider IS NULL AND oauth_access_token IS NULL AND oauth_refresh_token IS NULL AND oauth_expires_at IS NULL) OR
  (oauth_provider IS NOT NULL AND oauth_access_token IS NOT NULL AND oauth_refresh_token IS NOT NULL AND oauth_expires_at IS NOT NULL)
); 