
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
  recurrence_pattern?: string;
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
  recurrence_pattern?: string;
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
  recurrence_pattern?: string;
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
    const { data: user } = await supabase.auth.getUser();
    
    if (!user.user) {
      console.error('User not authenticated');
      return [];
    }
    
    const { data, error } = await supabase
      .from(this.table)
      .select('*')
      .eq('user_id', user.user.id)
      .gte('start_date', startDate.toISOString())
      .lte('start_date', endDate.toISOString())
      .order('start_date', { ascending: true });

    if (error) {
      console.error('Error fetching events:', error);
      throw error;
    }
    
    return data || [];
  }

  async createEvent(event: CalendarEventCreate): Promise<CalendarEvent> {
    const { data: user } = await supabase.auth.getUser();
    
    if (!user.user) {
      throw new Error('User not authenticated');
    }
    
    const { data, error } = await supabase
      .from(this.table)
      .insert([{ ...event, user_id: user.user.id }])
      .select()
      .single();

    if (error) {
      console.error('Error creating event:', error);
      throw error;
    }
    
    return data;
  }

  async updateEvent(id: string, event: CalendarEventUpdate): Promise<CalendarEvent> {
    const { data: user } = await supabase.auth.getUser();
    
    if (!user.user) {
      throw new Error('User not authenticated');
    }
    
    const { data, error } = await supabase
      .from(this.table)
      .update(event)
      .eq('id', id)
      .eq('user_id', user.user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating event:', error);
      throw error;
    }
    
    return data;
  }

  async deleteEvent(id: string): Promise<void> {
    const { data: user } = await supabase.auth.getUser();
    
    if (!user.user) {
      throw new Error('User not authenticated');
    }
    
    const { error } = await supabase
      .from(this.table)
      .delete()
      .eq('id', id)
      .eq('user_id', user.user.id);

    if (error) {
      console.error('Error deleting event:', error);
      throw error;
    }
  }

  async getEvent(id: string): Promise<CalendarEvent> {
    const { data: user } = await supabase.auth.getUser();
    
    if (!user.user) {
      throw new Error('User not authenticated');
    }
    
    const { data, error } = await supabase
      .from(this.table)
      .select('*')
      .eq('id', id)
      .eq('user_id', user.user.id)
      .single();

    if (error) {
      console.error(`Error fetching event with ID ${id}:`, error);
      throw error;
    }
    
    return data;
  }

  async getTodayEvents(): Promise<CalendarEvent[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    return this.getEvents(today, tomorrow);
  }

  async getUpcomingEvents(days: number = 7): Promise<CalendarEvent[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const endDate = new Date(today);
    endDate.setDate(endDate.getDate() + days);
    
    return this.getEvents(today, endDate);
  }
}
