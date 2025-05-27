-- Add domainVerified column to email_accounts table
ALTER TABLE email_accounts
ADD COLUMN IF NOT EXISTS domain_verified BOOLEAN DEFAULT false;

-- Add index for domain verification status
CREATE INDEX IF NOT EXISTS idx_email_accounts_domain_verified ON email_accounts(domain_verified); 