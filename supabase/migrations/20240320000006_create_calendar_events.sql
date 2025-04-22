-- Create calendar_events table
CREATE TABLE IF NOT EXISTS calendar_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE,
    all_day BOOLEAN DEFAULT false,
    location TEXT,
    color TEXT DEFAULT '#3B82F6',
    -- Relationships
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_calendar_events_user_id ON calendar_events(user_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_start_date ON calendar_events(start_date);
CREATE INDEX IF NOT EXISTS idx_calendar_events_task_id ON calendar_events(task_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_property_id ON calendar_events(property_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_contact_id ON calendar_events(contact_id);

-- Add RLS policies
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own calendar events"
    ON calendar_events FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own calendar events"
    ON calendar_events FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own calendar events"
    ON calendar_events FOR UPDATE
    USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own calendar events"
    ON calendar_events FOR DELETE
    USING (user_id = auth.uid());

-- Add trigger for updated_at
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON calendar_events
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create function to sync task dates with calendar
CREATE OR REPLACE FUNCTION sync_task_to_calendar()
RETURNS TRIGGER AS $$
BEGIN
    -- Delete existing calendar event for this task
    DELETE FROM calendar_events WHERE task_id = NEW.id;

    -- Insert new calendar event if task has a due date
    IF NEW.due_date IS NOT NULL THEN
        INSERT INTO calendar_events (
            user_id,
            title,
            description,
            start_date,
            end_date,
            all_day,
            task_id,
            color,
            created_by
        ) VALUES (
            NEW.assigned_to,
            NEW.title,
            NEW.description,
            NEW.due_date,
            NEW.due_date + INTERVAL '1 hour',
            false,
            NEW.id,
            CASE 
                WHEN NEW.priority = 'high' THEN '#EF4444'
                WHEN NEW.priority = 'medium' THEN '#F59E0B'
                ELSE '#3B82F6'
            END,
            NEW.created_by
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for task updates
CREATE TRIGGER sync_task_calendar
    AFTER INSERT OR UPDATE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION sync_task_to_calendar();

-- Create function to sync property events with calendar
CREATE OR REPLACE FUNCTION sync_property_to_calendar()
RETURNS TRIGGER AS $$
BEGIN
    -- Delete existing calendar event for this property
    DELETE FROM calendar_events WHERE property_id = NEW.id;

    -- Insert new calendar event if property has a scheduled date
    IF NEW.scheduled_date IS NOT NULL THEN
        INSERT INTO calendar_events (
            user_id,
            title,
            description,
            start_date,
            end_date,
            all_day,
            property_id,
            color,
            created_by
        ) VALUES (
            NEW.assigned_to,
            'Property: ' || NEW.title,
            NEW.description,
            NEW.scheduled_date,
            NEW.scheduled_date + INTERVAL '1 hour',
            false,
            NEW.id,
            '#10B981',
            NEW.created_by
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for property updates
CREATE TRIGGER sync_property_calendar
    AFTER INSERT OR UPDATE ON properties
    FOR EACH ROW
    EXECUTE FUNCTION sync_property_to_calendar();

-- Create function to sync contact events with calendar
CREATE OR REPLACE FUNCTION sync_contact_to_calendar()
RETURNS TRIGGER AS $$
BEGIN
    -- Delete existing calendar event for this contact
    DELETE FROM calendar_events WHERE contact_id = NEW.id;

    -- Insert new calendar event if contact has a scheduled date
    IF NEW.scheduled_date IS NOT NULL THEN
        INSERT INTO calendar_events (
            user_id,
            title,
            description,
            start_date,
            end_date,
            all_day,
            contact_id,
            color,
            created_by
        ) VALUES (
            NEW.assigned_to,
            'Contact: ' || NEW.first_name || ' ' || NEW.last_name,
            NEW.notes,
            NEW.scheduled_date,
            NEW.scheduled_date + INTERVAL '1 hour',
            false,
            NEW.id,
            '#8B5CF6',
            NEW.created_by
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for contact updates
CREATE TRIGGER sync_contact_calendar
    AFTER INSERT OR UPDATE ON contacts
    FOR EACH ROW
    EXECUTE FUNCTION sync_contact_to_calendar(); 