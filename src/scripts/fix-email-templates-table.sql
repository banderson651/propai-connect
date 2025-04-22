-- Check if the email_templates table exists, if not create it
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

-- If the table exists but the description column is missing, add it
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'email_templates'
  ) AND NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'email_templates' 
    AND column_name = 'description'
  ) THEN
    ALTER TABLE public.email_templates ADD COLUMN description text;
  END IF;
END $$;

-- Set up row level security
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

-- Create policies (these will fail silently if they already exist)
DO $$
BEGIN
  BEGIN
    CREATE POLICY "Enable read access for all users" 
      ON public.email_templates FOR SELECT USING (true);
  EXCEPTION WHEN duplicate_object THEN
    -- Policy already exists, do nothing
  END;
  
  BEGIN
    CREATE POLICY "Enable insert for authenticated users only" 
      ON public.email_templates FOR INSERT WITH CHECK (auth.role() = 'authenticated');
  EXCEPTION WHEN duplicate_object THEN
    -- Policy already exists, do nothing
  END;
  
  BEGIN
    CREATE POLICY "Enable update for authenticated users only" 
      ON public.email_templates FOR UPDATE USING (auth.role() = 'authenticated');
  EXCEPTION WHEN duplicate_object THEN
    -- Policy already exists, do nothing
  END;
  
  BEGIN
    CREATE POLICY "Enable delete for authenticated users only" 
      ON public.email_templates FOR DELETE USING (auth.role() = 'authenticated');
  EXCEPTION WHEN duplicate_object THEN
    -- Policy already exists, do nothing
  END;
END $$;
