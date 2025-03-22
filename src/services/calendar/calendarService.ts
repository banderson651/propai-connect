import { supabase } from '@/lib/supabase';

export interface CalendarEvent {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  start_date: string;
  end_date?: string;
  all_day: boolean;
  location?: string;
  color?: string;
  task_id?: string;
  property_id?: string;
  contact_id?: string;
  created_at: string;
  updated_at: string;
}

export interface CalendarEventCreate {
  title: string;
  description?: string;
  start_date: string;
  end_date?: string;
  all_day: boolean;
  location?: string;
  color?: string;
  task_id?: string;
  property_id?: string;
  contact_id?: string;
}

export interface CalendarEventUpdate {
  title?: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  all_day?: boolean;
  location?: string;
  color?: string;
  task_id?: string;
  property_id?: string;
  contact_id?: string;
}

export class CalendarService {
  private static instance: CalendarService;
  private table = 'calendar_events';

  private constructor() {}

  public static getInstance(): CalendarService {
    if (!CalendarService.instance) {
      CalendarService.instance = new CalendarService();
    }
    return CalendarService.instance;
  }

  async getEvents(startDate: Date, endDate: Date): Promise<CalendarEvent[]> {
    const { data, error } = await supabase
      .from(this.table)
      .select('*')
      .gte('start_date', startDate.toISOString())
      .lte('start_date', endDate.toISOString())
      .order('start_date', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async createEvent(event: CalendarEventCreate): Promise<CalendarEvent> {
    const { data, error } = await supabase
      .from(this.table)
      .insert([event])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateEvent(id: string, event: CalendarEventUpdate): Promise<CalendarEvent> {
    const { data, error } = await supabase
      .from(this.table)
      .update(event)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteEvent(id: string): Promise<void> {
    const { error } = await supabase
      .from(this.table)
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async getEvent(id: string): Promise<CalendarEvent> {
    const { data, error } = await supabase
      .from(this.table)
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }
} 