# Supabase Migration Commands (Linux)

# 1. Authenticate the Supabase CLI (prompts for access token)
node_modules/.bin/supabase login

# 2. Link this folder to your Supabase project (replace the ref if needed)
node_modules/.bin/supabase link --project-ref lvpnigtmgnapxzezrvup

# 3. Apply the pending database migrations
node_modules/.bin/supabase db push

