
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DashboardNav } from '@/components/dashboard/DashboardNav';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ActivityTimeline } from '@/components/dashboard/ActivityTimeline';
import { TasksDashboard } from '@/components/tasks/TasksDashboard';
import { Building2, Calendar, CheckSquare, MailOpen, MessageSquare, PlusCircle, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

export default function Index() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const displayName = user?.email ? user.email.split('@')[0] : 'User';

  // Mock statistics
  const stats = [
    { id: 1, name: 'Properties', value: '24', icon: Building2, color: 'text-blue-500' },
    { id: 2, name: 'Contacts', value: '142', icon: User, color: 'text-green-500' },
    { id: 3, name: 'Active Tasks', value: '8', icon: CheckSquare, color: 'text-amber-500' },
    { id: 4, name: 'Meetings Today', value: '3', icon: Calendar, color: 'text-purple-500' },
    { id: 5, name: 'Email Campaigns', value: '5', icon: MailOpen, color: 'text-rose-500' },
    { id: 6, name: 'WhatsApp Messages', value: '28', icon: MessageSquare, color: 'text-teal-500' },
  ];

  return (
    <DashboardLayout pageTitle="Dashboard">
      <div className="space-y-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-2xl md:text-3xl font-bold">Welcome back, {displayName}!</h1>
          <p className="text-muted-foreground">
            Here's what's happening with your properties today.
          </p>
        </div>

        <DashboardNav />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stats.map((stat) => (
            <Card key={stat.id} className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{stat.name}</CardTitle>
                <stat.icon className={cn("h-5 w-5", stat.color)} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <TasksDashboard />
            <div className="mt-4 flex justify-end">
              <Button onClick={() => navigate('/tasks')}>
                View All Tasks
              </Button>
            </div>
          </div>
          
          <div className="lg:col-span-1">
            <ActivityTimeline />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="space-y-1">
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common tasks you can perform</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => navigate('/contacts/new')}
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Add New Contact
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => navigate('/properties/new')}
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Add New Property
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => navigate('/tasks')}
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Create Task
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => navigate('/email/campaigns/new')}
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Start Email Campaign
              </Button>
            </CardContent>
          </Card>
          
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Upcoming Deadlines</CardTitle>
              <CardDescription>Tasks and activities due soon</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">Coming soon...</p>
            </CardContent>
            <CardFooter>
              <Button variant="ghost" size="sm">
                View calendar
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
