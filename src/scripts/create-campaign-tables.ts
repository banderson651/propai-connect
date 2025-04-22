import { supabase } from '../lib/supabase';

async function createCampaignTables() {
  console.log('Creating email campaign tables...');

  // Create email_campaigns table
  const { error: campaignsError } = await supabase.rpc('create_email_campaigns_table', {});
  
  if (campaignsError) {
    console.error('Error creating email_campaigns table:', campaignsError);
    // Try direct SQL approach as fallback
    const { error: sqlError } = await supabase.query(`
      create table if not exists public.email_campaigns (
        id uuid primary key default gen_random_uuid(),
        name text not null,
        description text,
        template_id text not null,
        sender_account_id uuid,
        schedule jsonb,
        status text default 'draft',
        created_at timestamptz default now(),
        updated_at timestamptz default now()
      );
    `);
    
    if (sqlError) {
      console.error('Failed to create email_campaigns table with direct SQL:', sqlError);
      return false;
    }
  }

  // Create email_campaign_recipients table
  const { error: recipientsError } = await supabase.rpc('create_email_campaign_recipients_table', {});
  
  if (recipientsError) {
    console.error('Error creating email_campaign_recipients table:', recipientsError);
    // Try direct SQL approach as fallback
    const { error: sqlError } = await supabase.query(`
      create table if not exists public.email_campaign_recipients (
        id uuid primary key default gen_random_uuid(),
        campaign_id uuid references public.email_campaigns(id) on delete cascade,
        contact_id uuid,
        email text not null,
        first_name text,
        last_name text,
        status text default 'pending',
        sent_at timestamptz
      );
    `);
    
    if (sqlError) {
      console.error('Failed to create email_campaign_recipients table with direct SQL:', sqlError);
      return false;
    }
  }

  console.log('Email campaign tables created successfully!');
  return true;
}

// Run the function if this script is executed directly
if (require.main === module) {
  createCampaignTables()
    .then((success) => {
      if (success) {
        console.log('Tables created successfully!');
        process.exit(0);
      } else {
        console.error('Failed to create tables.');
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error('Error:', error);
      process.exit(1);
    });
}

export { createCampaignTables };
