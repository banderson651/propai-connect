
import React, { useEffect, useState } from 'react';
import { Calendar } from '@/components/calendar/Calendar';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar as CalendarIcon, Clock, Users, Building2, CheckSquare } from 'lucide-react';
import { CalendarService } from '@/services/calendar/calendarService';

export default function CalendarPage() {
  const [todayEvents, setTodayEvents] = useState(0);
  const [upcomingTasks, setUpcomingTasks] = useState(0);
  const [propertyViewings, setPropertyViewings] = useState(0);
  const [clientMeetings, setClientMeetings] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const calendarService = CalendarService.getInstance();
        const today = await calendarService.getTodayEvents();
        setTodayEvents(today.length);

        // Count upcoming tasks, property viewings, and client meetings
        // In a real app, you'd have more specific filtering logic
        const upcoming = await calendarService.getUpcomingEvents(7);
        
        setUpcomingTasks(upcoming.filter(event => event.task_id).length);
        setPropertyViewings(upcoming.filter(event => event.property_id).length);
        setClientMeetings(upcoming.filter(event => event.contact_id).length);
      } catch (error) {
        console.error('Error loading calendar data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Calendar</h1>
          <p className="text-slate-600 mt-2">Manage your schedule and appointments</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Today's Events</CardTitle>
              <CalendarIcon className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{isLoading ? '...' : todayEvents}</div>
              <p className="text-xs text-slate-500">Scheduled for today</p>
            </CardContent>
          </Card>
          <Card className="border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Upcoming Tasks</CardTitle>
              <CheckSquare className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{isLoading ? '...' : upcomingTasks}</div>
              <p className="text-xs text-slate-500">Due this week</p>
            </CardContent>
          </Card>
          <Card className="border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Property Viewings</CardTitle>
              <Building2 className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{isLoading ? '...' : propertyViewings}</div>
              <p className="text-xs text-slate-500">Scheduled this week</p>
            </CardContent>
          </Card>
          <Card className="border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Client Meetings</CardTitle>
              <Users className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{isLoading ? '...' : clientMeetings}</div>
              <p className="text-xs text-slate-500">This week</p>
            </CardContent>
          </Card>
        </div>

        {/* Calendar Component */}
        <Card className="border-slate-200">
          <CardContent className="p-0">
            <Calendar />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
