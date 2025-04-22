// TEMPORARILY DISABLED SUPABASE INTEGRATION FOR WEBHOOK TESTING
// import { createClient } from '@supabase/supabase-js';
// import dotenv from 'dotenv';
// import express from 'express';

// dotenv.config();

// const router = express.Router();

// // Initialize Supabase client with admin privileges
// // const supabaseUrl = process.env.VITE_SUPABASE_URL;
// // const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY; // This should be the service_role key, not the anon key
// // const supabase = createClient(supabaseUrl, supabaseServiceKey);

// /**
//  * Endpoint to create email campaign tables
//  */
// // router.post('/create-campaign-tables', async (req, res) => {
// //   try {
// //     console.log('Creating email campaign tables...');
    
// //     // SQL to create tables
// //     const sql = `
// //       -- Create email_campaigns table if it doesn't exist
// //       CREATE TABLE IF NOT EXISTS public.email_campaigns (
// //         id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
// //         name text NOT NULL,
// //         description text,
// //         template_id text NOT NULL,
// //         sender_account_id uuid,
// //         schedule jsonb,
// //         status text DEFAULT 'draft',
// //         created_at timestamptz DEFAULT now(),
// //         updated_at timestamptz DEFAULT now()
// //       );

// //       -- Create email_campaign_recipients table if it doesn't exist
// //       CREATE TABLE IF NOT EXISTS public.email_campaign_recipients (
// //         id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
// //         campaign_id uuid REFERENCES public.email_campaigns(id) ON DELETE CASCADE,
// //         contact_id uuid,
// //         email text NOT NULL,
// //         first_name text,
// //         last_name text,
// //         status text DEFAULT 'pending',
// //         sent_at timestamptz
// //       );

// //       -- Grant permissions
// //       ALTER TABLE public.email_campaigns ENABLE ROW LEVEL SECURITY;
// //       ALTER TABLE public.email_campaign_recipients ENABLE ROW LEVEL SECURITY;

// //       -- Create policies for email_campaigns
// //       DO $$
// //       BEGIN
// //         IF NOT EXISTS (
// //           SELECT FROM pg_policies 
// //           WHERE tablename = 'email_campaigns' AND policyname = 'Enable read access for all users'
// //         ) THEN
// //           CREATE POLICY "Enable read access for all users" ON public.email_campaigns
// //             FOR SELECT USING (true);
// //         END IF;
        
// //         IF NOT EXISTS (
// //           SELECT FROM pg_policies 
// //           WHERE tablename = 'email_campaigns' AND policyname = 'Enable insert for authenticated users only'
// //         ) THEN
// //           CREATE POLICY "Enable insert for authenticated users only" ON public.email_campaigns
// //             FOR INSERT WITH CHECK (auth.role() = 'authenticated');
// //         END IF;
        
// //         IF NOT EXISTS (
// //           SELECT FROM pg_policies 
// //           WHERE tablename = 'email_campaigns' AND policyname = 'Enable update for authenticated users only'
// //         ) THEN
// //           CREATE POLICY "Enable update for authenticated users only" ON public.email_campaigns
// //             FOR UPDATE USING (auth.role() = 'authenticated');
// //         END IF;
        
// //         IF NOT EXISTS (
// //           SELECT FROM pg_policies 
// //           WHERE tablename = 'email_campaigns' AND policyname = 'Enable delete for authenticated users only'
// //         ) THEN
// //           CREATE POLICY "Enable delete for authenticated users only" ON public.email_campaigns
// //             FOR DELETE USING (auth.role() = 'authenticated');
// //         END IF;
// //       END
// //       $$;

// //       -- Create policies for email_campaign_recipients
// //       DO $$
// //       BEGIN
// //         IF NOT EXISTS (
// //           SELECT FROM pg_policies 
// //           WHERE tablename = 'email_campaign_recipients' AND policyname = 'Enable read access for all users'
// //         ) THEN
// //           CREATE POLICY "Enable read access for all users" ON public.email_campaign_recipients
// //             FOR SELECT USING (true);
// //         END IF;
        
// //         IF NOT EXISTS (
// //           SELECT FROM pg_policies 
// //           WHERE tablename = 'email_campaign_recipients' AND policyname = 'Enable insert for authenticated users only'
// //         ) THEN
// //           CREATE POLICY "Enable insert for authenticated users only" ON public.email_campaign_recipients
// //             FOR INSERT WITH CHECK (auth.role() = 'authenticated');
// //         END IF;
        
// //         IF NOT EXISTS (
// //           SELECT FROM pg_policies 
// //           WHERE tablename = 'email_campaign_recipients' AND policyname = 'Enable update for authenticated users only'
// //         ) THEN
// //           CREATE POLICY "Enable update for authenticated users only" ON public.email_campaign_recipients
// //             FOR UPDATE USING (auth.role() = 'authenticated');
// //         END IF;
        
// //         IF NOT EXISTS (
// //           SELECT FROM pg_policies 
// //           WHERE tablename = 'email_campaign_recipients' AND policyname = 'Enable delete for authenticated users only'
// //         ) THEN
// //           CREATE POLICY "Enable delete for authenticated users only" ON public.email_campaign_recipients
// //             FOR DELETE USING (auth.role() = 'authenticated');
// //         END IF;
// //       END
// //       $$;
// //     `;
    
// //     // Execute SQL directly using Postgres connection
// //     // Note: This requires the service role key with admin privileges
// //     const { error } = await supabase.rpc('exec_sql', { sql });
    
// //     if (error) {
// //       throw new Error(`Failed to create tables: ${error.message}`);
// //     }
    
// //     res.json({ success: true, message: 'Email campaign tables created successfully' });
// //   } catch (error) {
// //     console.error('Error creating tables:', error);
// //     res.status(500).json({ 
// //       success: false, 
// //       error: error.message,
// //       note: 'You may need to run the SQL script manually in the Supabase dashboard'
// //     });
// //   }
// // });

// All routes are disabled for now to allow backend to start without Supabase
export default (req, res, next) => {
  res.status(503).json({ error: 'Supabase integration temporarily disabled for testing.' });
};
