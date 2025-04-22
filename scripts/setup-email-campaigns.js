// This is a one-time setup script to create the email campaign tables in Supabase
// Run with: node scripts/setup-email-campaigns.js

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import fetch from 'node-fetch';

// Load environment variables from .env file
dotenv.config();

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Supabase URL and key must be set in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupEmailCampaigns() {
  try {
    console.log('Setting up email campaign tables...');

    // SQL to create the tables
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

    -- Create policies for email_campaigns
    CREATE POLICY IF NOT EXISTS "Enable read access for all users" 
      ON public.email_campaigns FOR SELECT USING (true);

    CREATE POLICY IF NOT EXISTS "Enable insert for authenticated users only" 
      ON public.email_campaigns FOR INSERT WITH CHECK (auth.role() = 'authenticated');

    CREATE POLICY IF NOT EXISTS "Enable update for authenticated users only" 
      ON public.email_campaigns FOR UPDATE USING (auth.role() = 'authenticated');

    CREATE POLICY IF NOT EXISTS "Enable delete for authenticated users only" 
      ON public.email_campaigns FOR DELETE USING (auth.role() = 'authenticated');

    -- Similar policies for recipients
    CREATE POLICY IF NOT EXISTS "Enable read access for all users" 
      ON public.email_campaign_recipients FOR SELECT USING (true);

    CREATE POLICY IF NOT EXISTS "Enable insert for authenticated users only" 
      ON public.email_campaign_recipients FOR INSERT WITH CHECK (auth.role() = 'authenticated');

    CREATE POLICY IF NOT EXISTS "Enable update for authenticated users only" 
      ON public.email_campaign_recipients FOR UPDATE USING (auth.role() = 'authenticated');

    CREATE POLICY IF NOT EXISTS "Enable delete for authenticated users only" 
      ON public.email_campaign_recipients FOR DELETE USING (auth.role() = 'authenticated');
    `;

    // Try to create tables directly using Supabase client
    console.log('Creating tables via Supabase client...');
    
    // First, try to access the email_campaigns table to see if it exists
    const { error: checkError } = await supabase
      .from('email_campaigns')
      .select('count')
      .limit(1);
    
    if (checkError && checkError.message.includes('does not exist')) {
      console.log('Tables do not exist yet, creating them...');
      
      // Execute SQL statements one by one
      const statements = sql
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0);
      
      for (const stmt of statements) {
        console.log(`Executing: ${stmt.substring(0, 50)}...`);
        
        try {
          // Use Supabase REST API directly
          const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': supabaseKey,
              'Authorization': `Bearer ${supabaseKey}`
            },
            body: JSON.stringify({ sql: stmt })
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            console.warn(`Warning executing statement: ${errorData?.message || response.statusText}`);
          }
        } catch (stmtError) {
          console.warn(`Warning executing statement: ${stmtError.message}`);
        }
      }
    } else if (checkError) {
      console.error('Error checking tables:', checkError.message);
    } else {
      console.log('Tables already exist!');
    }
    
    // Verify tables were created
    const { data, error } = await supabase
      .from('email_campaigns')
      .select('count')
      .limit(1);

    if (error) {
      console.error('Error verifying tables:', error.message);
      console.log('You may need to run the SQL manually in the Supabase dashboard.');
      console.log('SQL to run:');
      console.log(sql);
    } else {
      console.log('Email campaign tables verified and ready to use!');
    }
  } catch (error) {
    console.error('Error setting up email campaign tables:', error.message);
    console.log('Please run the SQL manually in the Supabase dashboard.');
  }
}

setupEmailCampaigns();
