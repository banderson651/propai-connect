
-- Add recurrence_pattern column to calendar_events table
ALTER TABLE IF EXISTS public.calendar_events 
ADD COLUMN IF NOT EXISTS recurrence_pattern text;

-- Update database.ts types to include calendar_events
DO $$
BEGIN
  -- Already exists check to prevent errors on re-runs
  IF NOT EXISTS (
    SELECT FROM pg_tables 
    WHERE schemaname = 'public' AND tablename = 'calendar_events'
  ) THEN
    -- Create the calendar_events table if it doesn't exist
    CREATE TABLE public.calendar_events (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid REFERENCES auth.users NOT NULL,
      title text NOT NULL,
      description text,
      start_date timestamp with time zone NOT NULL,
      end_date timestamp with time zone,
      all_day boolean NOT NULL DEFAULT false,
      location text,
      color text,
      task_id uuid,
      property_id uuid,
      contact_id uuid,
      recurrence_pattern text,
      created_at timestamp with time zone DEFAULT now() NOT NULL,
      updated_at timestamp with time zone DEFAULT now() NOT NULL
    );

    -- Enable Row Level Security
    ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;

    -- Create policy to allow users to view their own events
    CREATE POLICY "Users can view own events" ON public.calendar_events
      FOR SELECT USING (auth.uid() = user_id);

    -- Create policy to allow users to insert their own events
    CREATE POLICY "Users can insert own events" ON public.calendar_events
      FOR INSERT WITH CHECK (auth.uid() = user_id);

    -- Create policy to allow users to update their own events
    CREATE POLICY "Users can update own events" ON public.calendar_events
      FOR UPDATE USING (auth.uid() = user_id);

    -- Create policy to allow users to delete their own events
    CREATE POLICY "Users can delete own events" ON public.calendar_events
      FOR DELETE USING (auth.uid() = user_id);
  END IF;
END
$$;
