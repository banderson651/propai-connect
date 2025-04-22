import { supabase } from '@/lib/supabase';

/**
 * Creates the necessary tables for email campaigns if they don't exist
 * This can be called from your application to ensure tables exist
 */
export async function createCampaignTables() {
  try {
    console.log('Creating email campaign tables...');
    
    // Create email_campaigns table
    const { error: campaignsError } = await supabase.rpc('create_tables', {
      table_sql: `
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
      `
    });
    
    if (campaignsError) {
      console.error('Error creating email_campaigns table:', campaignsError);
      return false;
    }
    
    // Create email_campaign_recipients table
    const { error: recipientsError } = await supabase.rpc('create_tables', {
      table_sql: `
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
      `
    });
    
    if (recipientsError) {
      console.error('Error creating email_campaign_recipients table:', recipientsError);
      return false;
    }
    
    console.log('Email campaign tables created successfully!');
    return true;
  } catch (error) {
    console.error('Error creating tables:', error);
    return false;
  }
}
