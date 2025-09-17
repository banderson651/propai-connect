import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DashboardNav } from '@/components/dashboard/DashboardNav';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ActivityTimeline } from '@/components/dashboard/ActivityTimeline';
import { TasksDashboard } from '@/components/tasks/TasksDashboard';
import { Building2, Calendar, CheckSquare, MailOpen, MessageSquare, PlusCircle, User, TrendingUp, TrendingDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
export default function Index() {
  const navigate = useNavigate();
  const {
    user
  } = useAuth();
  const displayName = user?.email ? user.email.split('@')[0] : 'User';

  // Mock statistics with trend indicators
  const stats = [{
    id: 1,
    name: 'Properties',
    value: '24',
    icon: Building2,
    color: 'text-blue-500',
    trend: '+5%',
    trendUp: true
  }, {
    id: 2,
    name: 'Contacts',
    value: '142',
    icon: User,
    color: 'text-green-500',
    trend: '+12%',
    trendUp: true
  }, {
    id: 3,
    name: 'Active Tasks',
    value: '8',
    icon: CheckSquare,
    color: 'text-amber-500',
    trend: '-3%',
    trendUp: false
  }, {
    id: 4,
    name: 'Meetings Today',
    value: '3',
    icon: Calendar,
    color: 'text-purple-500',
    trend: '+2%',
    trendUp: true
  }, {
    id: 5,
    name: 'Email Campaigns',
    value: '5',
    icon: MailOpen,
    color: 'text-rose-500',
    trend: '+8%',
    trendUp: true
  }, {
    id: 6,
    name: 'WhatsApp Messages',
    value: '28',
    icon: MessageSquare,
    color: 'text-teal-500',
    trend: '+15%',
    trendUp: true
  }];
  return <DashboardLayout pageTitle="Analytics Dashboard">
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Welcome back, {displayName}!</h1>
            <p className="text-gray-600 text-base">Track key performance indicators for your property portfolio.</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {stats.map(stat => <div key={stat.id} className="stat-card">
              <div className="flex items-center justify-between mb-2">
                <p className="text-gray-600 text-sm font-medium">{stat.name}</p>
                <stat.icon className={cn("h-5 w-5", stat.color)} />
              </div>
              <div className="flex items-end justify-between">
                <p className="text-3xl font-bold text-gray-900 tracking-tight">{stat.value}</p>
                <div className={cn("flex items-center text-sm font-semibold", stat.trendUp ? "text-green-600" : "text-red-600")}>
                  {stat.trendUp ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                  {stat.trend}
                </div>
              </div>
            </div>)}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <TasksDashboard />
            <div className="mt-4 flex justify-end">
              <Button onClick={() => navigate('/tasks')} className="text-white">
                View All Tasks
              </Button>
            </div>
          </div>
          
          <div className="lg:col-span-1 bg-white">
            <ActivityTimeline />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <div className="space-y-1">
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common tasks you can perform</CardDescription>
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
          
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Upcoming Deadlines</CardTitle>
              <CardDescription>Tasks and activities due soon</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">Coming soon...</p>
            </CardContent>
            <CardFooter>
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
                View calendar
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </DashboardLayout>;
}
