// Copy this entire file and paste it into your browser console when logged into Supabase

(async function() {
  // Get the SQL from our file
  const sql = `
-- Create email_campaigns table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.email_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  template_id text NOT NULL,
  sender_account_id uuid,
  schedule jsonb,
  status text DEFAULT 'draft',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create email_campaign_recipients table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.email_campaign_recipients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid REFERENCES public.email_campaigns(id) ON DELETE CASCADE,
  contact_id uuid,
  email text NOT NULL,
  first_name text,
  last_name text,
  status text DEFAULT 'pending',
  sent_at timestamptz
);

-- Grant permissions
ALTER TABLE public.email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_campaign_recipients ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable read access for all users" ON public.email_campaigns
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON public.email_campaigns
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users only" ON public.email_campaigns
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users only" ON public.email_campaigns
  FOR DELETE USING (auth.role() = 'authenticated');

-- Similar policies for recipients
CREATE POLICY "Enable read access for all users" ON public.email_campaign_recipients
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON public.email_campaign_recipients
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users only" ON public.email_campaign_recipients
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users only" ON public.email_campaign_recipients
  FOR DELETE USING (auth.role() = 'authenticated');
  `;

  console.log('Running SQL to create campaign tables...');
  
  try {
    // This assumes you are logged into Supabase and have access to the SQL editor
    // You need to run this in the browser console while on the Supabase dashboard
    const response = await fetch('/rest/v1/rpc/sql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('supabase.auth.token')}`,
      },
      body: JSON.stringify({
        query: sql
      }),
    });
    
    const result = await response.json();
    console.log('Tables created successfully!', result);
    return result;
  } catch (error) {
    console.error('Error creating tables:', error);
    throw error;
  }
})();
