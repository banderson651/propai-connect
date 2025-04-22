const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const router = express.Router();
require('dotenv').config();

// Initialize Supabase client with admin privileges
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY; // This should be the service_role key, not the anon key
const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Endpoint to create email campaign tables
 */
router.post('/create-campaign-tables', async (req, res) => {
  try {
    console.log('Creating email campaign tables...');
    
    // Create email_campaigns table
    const { error: campaignsError } = await supabase.from('email_campaigns').select('count').limit(1).throwOnError();
    
    if (campaignsError) {
      // Table doesn't exist, create it
      const createCampaignsResult = await supabase.query(`
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
        
        ALTER TABLE public.email_campaigns ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Enable read access for all users" ON public.email_campaigns
          FOR SELECT USING (true);
        
        CREATE POLICY "Enable insert for authenticated users only" ON public.email_campaigns
          FOR INSERT WITH CHECK (auth.role() = 'authenticated');
        
        CREATE POLICY "Enable update for authenticated users only" ON public.email_campaigns
          FOR UPDATE USING (auth.role() = 'authenticated');
        
        CREATE POLICY "Enable delete for authenticated users only" ON public.email_campaigns
          FOR DELETE USING (auth.role() = 'authenticated');
      `);
      
      console.log('Created email_campaigns table');
    }
    
    // Create email_campaign_recipients table
    const { error: recipientsError } = await supabase.from('email_campaign_recipients').select('count').limit(1).throwOnError();
    
    if (recipientsError) {
      // Table doesn't exist, create it
      const createRecipientsResult = await supabase.query(`
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
        
        ALTER TABLE public.email_campaign_recipients ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Enable read access for all users" ON public.email_campaign_recipients
          FOR SELECT USING (true);
        
        CREATE POLICY "Enable insert for authenticated users only" ON public.email_campaign_recipients
          FOR INSERT WITH CHECK (auth.role() = 'authenticated');
        
        CREATE POLICY "Enable update for authenticated users only" ON public.email_campaign_recipients
          FOR UPDATE USING (auth.role() = 'authenticated');
        
        CREATE POLICY "Enable delete for authenticated users only" ON public.email_campaign_recipients
          FOR DELETE USING (auth.role() = 'authenticated');
      `);
      
      console.log('Created email_campaign_recipients table');
    }
    
    res.json({ success: true, message: 'Email campaign tables created successfully' });
  } catch (error) {
    console.error('Error creating tables:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * WhatsApp: Create messages table if not exists
 */
router.post('/create-whatsapp-messages-table', async (req, res) => {
  try {
    const { error } = await supabase.from('whatsapp_messages').select('count').limit(1).throwOnError();
    if (error) {
      // Table doesn't exist, create it
      const createResult = await supabase.query(`
        CREATE TABLE IF NOT EXISTS public.whatsapp_messages (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          contact_id text,
          content text,
          timestamp timestamptz DEFAULT now(),
          direction text, -- 'incoming' or 'outgoing'
          status text,
          raw jsonb
        );
        ALTER TABLE public.whatsapp_messages ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "Enable read access for all users" ON public.whatsapp_messages FOR SELECT USING (true);
        CREATE POLICY "Enable insert for authenticated users only" ON public.whatsapp_messages FOR INSERT WITH CHECK (auth.role() = 'authenticated');
        CREATE POLICY "Enable update for authenticated users only" ON public.whatsapp_messages FOR UPDATE USING (auth.role() = 'authenticated');
        CREATE POLICY "Enable delete for authenticated users only" ON public.whatsapp_messages FOR DELETE USING (auth.role() = 'authenticated');
      `);
      console.log('Created whatsapp_messages table');
    }
    res.json({ success: true });
  } catch (error) {
    console.error('Error creating WhatsApp messages table:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
