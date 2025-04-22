// Script to set up email_templates table in Supabase
import { supabase } from '../lib/supabase';

const setupEmailTemplatesTable = async () => {
  console.log('Setting up email_templates table...');
  
  try {
    // Step 1: Check if the table exists
    const { error: checkError } = await supabase
      .from('email_templates')
      .select('count')
      .limit(1);
    
    // If the table doesn't exist, we need to create it
    if (checkError && checkError.message.includes('does not exist')) {
      console.log('Table does not exist, creating it...');
      
      // Create the table using direct SQL
      const createTableSQL = `
        CREATE TABLE IF NOT EXISTS public.email_templates (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          name text NOT NULL,
          description text,
          html_content text NOT NULL,
          thumbnail_url text,
          created_at timestamptz DEFAULT now(),
          updated_at timestamptz DEFAULT now(),
          user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
          is_system boolean DEFAULT false
        );
      `;
      
      // Execute the SQL
      const { error: createError } = await supabase.rpc('exec_sql', { sql: createTableSQL });
      
      if (createError) {
        console.error('Error creating table with RPC:', createError);
        
        // If RPC fails, try a direct insert which will create the table with default columns
        console.log('Trying direct insert...');
        const { error: insertError } = await supabase
          .from('email_templates')
          .insert({
            name: 'Template Initialization',
            description: 'Initializing email templates table',
            html_content: '<div>Initializing email templates table</div>',
            is_system: true
          });
        
        if (insertError && !insertError.message.includes('already exists')) {
          throw new Error(`Failed to create table: ${insertError.message}`);
        }
      }
      
      // Set up RLS policies
      const rlsPoliciesSQL = `
        ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY IF NOT EXISTS "Enable read access for all users" 
          ON public.email_templates FOR SELECT USING (true);
        
        CREATE POLICY IF NOT EXISTS "Enable insert for authenticated users only" 
          ON public.email_templates FOR INSERT WITH CHECK (auth.role() = 'authenticated');
        
        CREATE POLICY IF NOT EXISTS "Enable update for authenticated users only" 
          ON public.email_templates FOR UPDATE USING (auth.role() = 'authenticated');
        
        CREATE POLICY IF NOT EXISTS "Enable delete for authenticated users only" 
          ON public.email_templates FOR DELETE USING (auth.role() = 'authenticated');
      `;
      
      // Try to set up RLS policies
      await supabase.rpc('exec_sql', { sql: rlsPoliciesSQL }).catch(err => {
        console.warn('Could not set up RLS policies:', err);
        console.log('You may need to set up RLS policies manually');
      });
    } else {
      console.log('Table already exists, checking for description column...');
      
      // Check if the description column exists
      const { data, error } = await supabase
        .from('email_templates')
        .select('description')
        .limit(1);
      
      if (error && error.message.includes('column "description" does not exist')) {
        console.log('Description column does not exist, adding it...');
        
        // Add the description column
        const addColumnSQL = `
          ALTER TABLE public.email_templates ADD COLUMN IF NOT EXISTS description text;
        `;
        
        const { error: alterError } = await supabase.rpc('exec_sql', { sql: addColumnSQL });
        
        if (alterError) {
          console.error('Error adding description column:', alterError);
          throw new Error(`Failed to add description column: ${alterError.message}`);
        }
        
        console.log('Description column added successfully');
      } else {
        console.log('Description column already exists');
      }
    }
    
    console.log('Email templates table setup complete!');
    return { success: true };
  } catch (error) {
    console.error('Setup failed:', error);
    return { success: false, error };
  }
};

// Run the setup function
setupEmailTemplatesTable().then(result => {
  if (result.success) {
    console.log('Setup completed successfully');
  } else {
    console.error('Setup failed:', result.error);
  }
});

export default setupEmailTemplatesTable;
