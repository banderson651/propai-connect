import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TasksDashboard } from '@/components/tasks/TasksDashboard';
import { Building2, Calendar, CheckSquare, MessageSquare, PlusCircle, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getContacts, getInteractions } from '@/services/contactService';
import { getProperties } from '@/services/propertyService';
import { getTasks } from '@/services/taskService';
import { CalendarService } from '@/services/calendar/calendarService';
import { Skeleton } from '@/components/ui/skeleton';
import type { Task } from '@/types/task';
import type { Interaction } from '@/types/contact';

export default function Index() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const displayName = user?.email ? user.email.split('@')[0] : 'User';

  const calendarService = useMemo(() => CalendarService.getInstance(), []);

  const userId = user?.id;

  const { data: contacts = [], isLoading: contactsLoading } = useQuery({
    queryKey: ['dashboard', 'contacts', userId],
    queryFn: getContacts,
    enabled: Boolean(userId)
  });

  const { data: properties = [], isLoading: propertiesLoading } = useQuery({
    queryKey: ['dashboard', 'properties', userId],
    queryFn: () => getProperties(),
    enabled: Boolean(userId)
  });

  const { data: tasks = [], isLoading: tasksLoading } = useQuery<Task[]>({
    queryKey: ['dashboard', 'tasks', userId],
    queryFn: () => getTasks(),
    enabled: Boolean(userId)
  });

  const { data: interactions = [], isLoading: interactionsLoading } = useQuery<Interaction[]>({
    queryKey: ['dashboard', 'interactions', userId],
    queryFn: getInteractions,
    enabled: Boolean(userId)
  });

  const { data: todayEvents = [], isLoading: eventsLoading } = useQuery({
    queryKey: ['dashboard', 'today-events', userId],
    queryFn: () => calendarService.getTodayEvents(),
    enabled: Boolean(userId)
  });

  const activeTasksCount = useMemo(
    () => tasks.filter(task => task.status !== 'completed' && task.status !== 'canceled').length,
    [tasks]
  );

  const interactionsThisWeek = useMemo(() => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setHours(0, 0, 0, 0);
    startOfWeek.setDate(now.getDate() - now.getDay());

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);

    return interactions.filter(interaction => {
      const timestamp = interaction.createdAt ?? interaction.updatedAt ?? interaction.date;
      if (!timestamp) return false;
      const interactionDate = new Date(timestamp);
      return interactionDate >= startOfWeek && interactionDate < endOfWeek;
    }).length;
  }, [interactions]);

  const isLoadingStats = contactsLoading || propertiesLoading || tasksLoading || interactionsLoading || eventsLoading;

  const stats = useMemo(
    () => [
      {
        id: 'properties',
        name: 'Properties',
        value: properties.length,
        icon: Building2,
        helper: 'Active listings managed'
      },
      {
        id: 'contacts',
        name: 'Contacts',
        value: contacts.length,
        icon: User,
        helper: 'Prospects & clients in your CRM'
      },
      {
        id: 'tasks',
        name: 'Open Tasks',
        value: activeTasksCount,
        icon: CheckSquare,
        helper: 'Tasks awaiting completion'
      },
      {
        id: 'meetings',
        name: 'Meetings Today',
        value: todayEvents.length,
        icon: Calendar,
        helper: 'Events scheduled for today'
      },
      {
        id: 'interactions',
        name: 'Interactions (This Week)',
        value: interactionsThisWeek,
        icon: MessageSquare,
        helper: 'Follow-ups logged this week'
      }
    ],
    [properties.length, contacts.length, activeTasksCount, todayEvents.length, interactionsThisWeek]
  );

  return (
    <DashboardLayout pageTitle="Analytics Dashboard">
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Welcome back, {displayName}!</h1>
            <p className="text-base text-muted-foreground">
              Track key performance indicators for your portfolio and workflow.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {isLoadingStats
            ? Array.from({ length: 5 }).map((_, index) => <Skeleton key={index} className="h-32 rounded-2xl" />)
            : stats.map(stat => (
                <div key={stat.id} className="stat-card flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-muted-foreground">{stat.name}</p>
                    <stat.icon className="h-5 w-5 text-primary" />
                  </div>
                  <p className="text-3xl font-semibold text-foreground">{stat.value.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">{stat.helper}</p>
                </div>
              ))}
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <Card className="xl:col-span-2">
            <CardHeader>
              <CardTitle>Tasks Overview</CardTitle>
              <CardDescription>Stay on top of open work across your team</CardDescription>
            </CardHeader>
            <CardContent>
              <TasksDashboard />
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 gap-6 xl:grid-rows-2">
            <Card>
              <CardHeader>
                <div className="space-y-1">
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Jump back into common workflows</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/contacts/new')}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add New Contact
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/properties/new')}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add New Property
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/tasks')}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create Task
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/email/campaigns/new')}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Start Email Campaign
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Upcoming Deadlines</CardTitle>
                <CardDescription>Tasks and activities due soon</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Coming soon...</p>
              </CardContent>
              <CardFooter>
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary" onClick={() => navigate('/calendar')}>
                  View calendar
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
