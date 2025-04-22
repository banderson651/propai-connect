-- Create a stored procedure to set up the email_templates table
CREATE OR REPLACE FUNCTION public.create_email_templates_table()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Create the table if it doesn't exist
  CREATE TABLE IF NOT EXISTS public.email_templates (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    description text,
    html_content text NOT NULL,
    content text, -- Alternative column for html_content
    thumbnail_url text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    is_system boolean DEFAULT false
  );

  -- Set up row level security
  ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

  -- Create policies if they don't exist
  -- Check if the read policy exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'email_templates' 
    AND policyname = 'Enable read access for all users'
  ) THEN
    CREATE POLICY "Enable read access for all users" 
      ON public.email_templates FOR SELECT USING (true);
  END IF;

  -- Check if the insert policy exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'email_templates' 
    AND policyname = 'Enable insert for authenticated users only'
  ) THEN
    CREATE POLICY "Enable insert for authenticated users only" 
      ON public.email_templates FOR INSERT WITH CHECK (auth.role() = 'authenticated');
  END IF;

  -- Check if the update policy exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'email_templates' 
    AND policyname = 'Enable update for authenticated users only'
  ) THEN
    CREATE POLICY "Enable update for authenticated users only" 
      ON public.email_templates FOR UPDATE USING (auth.role() = 'authenticated');
  END IF;

  -- Check if the delete policy exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'email_templates' 
    AND policyname = 'Enable delete for authenticated users only'
  ) THEN
    CREATE POLICY "Enable delete for authenticated users only" 
      ON public.email_templates FOR DELETE USING (auth.role() = 'authenticated');
  END IF;
END;
$$;
