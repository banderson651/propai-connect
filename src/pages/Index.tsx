import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Users, Mail, Calendar, CheckSquare, BarChart3, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    properties: 0,
    contacts: 0,
    tasks: 0,
    emails: 0,
    whatsapp: 0,
  });

  useEffect(() => {
    // Fetch dashboard stats here
    // This is a placeholder for actual data fetching
    setStats({
      properties: 5,
      contacts: 12,
      tasks: 8,
      emails: 3,
      whatsapp: 15,
    });
  }, []);

  const quickActions = [
    {
      title: 'Properties',
      description: 'Manage your property listings',
      icon: Building2,
      href: '/properties',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
    },
    {
      title: 'Contacts',
      description: 'View and manage contacts',
      icon: Users,
      href: '/contacts',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Tasks',
      description: 'Track your tasks and deadlines',
      icon: CheckSquare,
      href: '/tasks',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Email Campaigns',
      description: 'Manage your email campaigns',
      icon: Mail,
      href: '/email',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      title: 'WhatsApp',
      description: 'Manage WhatsApp communications',
      icon: MessageSquare,
      href: '/whatsapp',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Calendar',
      description: 'View your schedule',
      icon: Calendar,
      href: '/dashboard/calendar',
      color: 'text-pink-600',
      bgColor: 'bg-pink-50',
    },
    {
      title: 'Analytics',
      description: 'View your performance metrics',
      icon: BarChart3,
      href: '/analytics',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
    },
  ];

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Welcome back, {user?.email?.split('@')[0]}</h1>
          <p className="text-slate-600 mt-2">Here's what's happening with your properties today.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card className="border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Total Properties</CardTitle>
              <Building2 className="h-4 w-4 text-indigo-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{stats.properties}</div>
              <p className="text-xs text-slate-500">Active listings</p>
            </CardContent>
          </Card>
          <Card className="border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Contacts</CardTitle>
              <Users className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{stats.contacts}</div>
              <p className="text-xs text-slate-500">Total contacts</p>
            </CardContent>
          </Card>
          <Card className="border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Tasks</CardTitle>
              <CheckSquare className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{stats.tasks}</div>
              <p className="text-xs text-slate-500">Pending tasks</p>
            </CardContent>
          </Card>
          <Card className="border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Email Campaigns</CardTitle>
              <Mail className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{stats.emails}</div>
              <p className="text-xs text-slate-500">Active campaigns</p>
            </CardContent>
          </Card>
          <Card className="border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">WhatsApp Messages</CardTitle>
              <MessageSquare className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{stats.whatsapp}</div>
              <p className="text-xs text-slate-500">Today's messages</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickActions.map((action) => (
              <Card
                key={action.title}
                className="cursor-pointer hover:shadow-md transition-shadow border-slate-200"
                onClick={() => navigate(action.href)}
              >
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-lg ${action.bgColor}`}>
                      <action.icon className={`h-6 w-6 ${action.color}`} />
                    </div>
                    <div>
                      <CardTitle className="text-lg text-slate-900">{action.title}</CardTitle>
                      <p className="text-sm text-slate-500">{action.description}</p>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Recent Activity</h2>
          <Card className="border-slate-200">
            <CardContent className="p-6">
              <p className="text-slate-500 text-center">No recent activity to display</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Index;
