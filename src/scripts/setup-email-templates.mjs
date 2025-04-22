// Script to set up email_templates table in Supabase
import { createClient } from '@supabase/supabase-js';

// Get environment variables from .env file
import * as dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials. Make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your .env file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const setupEmailTemplatesTable = async () => {
  console.log('Setting up email_templates table...');
  
  try {
    // Try to insert a record to see if the table exists and has the right schema
    const { data, error } = await supabase
      .from('email_templates')
      .insert({
        name: 'Test Template',
        description: 'Testing the email templates table',
        html_content: '<div>Test content</div>',
        is_system: true
      })
      .select();
    
    if (error) {
      console.error('Error inserting test record:', error.message);
      
      if (error.message.includes('does not exist')) {
        console.log('Table does not exist. Please create it using the SQL script.');
        console.log('SQL script path: src/scripts/create-email-templates-table.sql');
      } else if (error.message.includes('column "description" does not exist')) {
        console.log('The description column is missing. Please run the following SQL:');
        console.log('ALTER TABLE public.email_templates ADD COLUMN description text;');
      } else {
        console.log('Unknown error. Please check your Supabase setup.');
      }
    } else {
      console.log('Table exists and has the correct schema!');
      
      // Clean up the test record
      if (data && data.length > 0) {
        await supabase
          .from('email_templates')
          .delete()
          .eq('id', data[0].id);
        console.log('Test record cleaned up.');
      }
    }
  } catch (err) {
    console.error('Unexpected error:', err);
  }
};

// Run the setup function
setupEmailTemplatesTable().then(() => {
  console.log('Setup process completed.');
});
