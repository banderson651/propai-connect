
import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/calendar/Calendar';
import { CalendarIcon, Clock, MapPin, Users } from 'lucide-react';
import { CalendarService, CalendarEvent } from '@/services/calendar/calendarService';
import { useToast } from '@/components/ui/use-toast';

export default function CalendarPage() {
  const [loading, setLoading] = useState(true);
  const [todayEvents, setTodayEvents] = useState<CalendarEvent[]>([]);
  const [upcomingTasks, setUpcomingTasks] = useState<number>(0);
  const [propertyViewings, setPropertyViewings] = useState<number>(0);
  const [clientMeetings, setClientMeetings] = useState<number>(0);
  const { toast } = useToast();
  
  useEffect(() => {
    const calendarService = CalendarService.getInstance();
    
    const fetchData = async () => {
      try {
        setLoading(true);
        // Get today's events
        const today = await calendarService.getTodayEvents();
        setTodayEvents(today);
        
        // Get upcoming events and filter by type
        const upcoming = await calendarService.getUpcomingEvents(7);
        
        // Count task-related events
        const tasks = upcoming.filter(event => event.task_id).length;
        setUpcomingTasks(tasks);
        
        // Count property viewings
        const viewings = upcoming.filter(event => 
          event.property_id && event.title.toLowerCase().includes('viewing')
        ).length;
        setPropertyViewings(viewings);
        
        // Count client meetings
        const meetings = upcoming.filter(event => 
          event.contact_id && !event.property_id
        ).length;
        setClientMeetings(meetings);
        
      } catch (error) {
        console.error('Error fetching calendar data:', error);
        toast({
          title: "Error loading calendar data",
          description: "Please try again later",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [toast]);
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Calendar</h1>
          <p className="text-muted-foreground">
            Manage your schedule, appointments, and important dates
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Events</CardTitle>
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? '...' : todayEvents.length}</div>
              {todayEvents.length > 0 && (
                <p className="text-xs text-gray-500 mt-1 truncate">
                  Next: {todayEvents[0].title}
                </p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming Tasks</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? '...' : upcomingTasks}</div>
              <p className="text-xs text-gray-500">This week</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Property Viewings</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? '...' : propertyViewings}</div>
              <p className="text-xs text-gray-500">This week</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Client Meetings</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? '...' : clientMeetings}</div>
              <p className="text-xs text-gray-500">This week</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="p-0">
            <Calendar />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
