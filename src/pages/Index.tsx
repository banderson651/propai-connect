
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { ArrowUpRight, Users, Building2, DollarSign, Activity, CheckSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getProperties } from '@/services/propertyService';
import { useAuth } from '@/contexts/AuthContext';
import { formatCurrency } from '@/lib/utils';
import { TasksDashboard } from '@/components/tasks/TasksDashboard';

const data = [
  { name: 'Jan', value: 400 },
  { name: 'Feb', value: 300 },
  { name: 'Mar', value: 600 },
  { name: 'Apr', value: 800 },
  { name: 'May', value: 700 },
];

const userActivityData = [
  { name: 'Mon', contacts: 20, properties: 5, emails: 35 },
  { name: 'Tue', contacts: 25, properties: 8, emails: 40 },
  { name: 'Wed', contacts: 30, properties: 3, emails: 45 },
  { name: 'Thu', contacts: 15, properties: 7, emails: 30 },
  { name: 'Fri', contacts: 35, properties: 10, emails: 50 },
];

const Index = () => {
  const { user, isAdmin } = useAuth();
  
  const { data: properties = [], isLoading } = useQuery({
    queryKey: ['properties-dashboard'],
    queryFn: () => getProperties({}),
  });

  const stats = [
    { label: 'Total Leads', value: '3,456', icon: Users, change: '+12.5%' },
    { label: 'Active Properties', value: properties.length.toString(), icon: Building2, change: '+5.2%' },
    { label: 'Revenue', value: '$124.5k', icon: DollarSign, change: '+8.1%' },
    { label: 'Tasks', value: '24', icon: CheckSquare, change: '+15.3%' },
  ];

  const totalPropertyValue = properties.reduce((total, property) => total + property.price, 0);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[80vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          <span className="ml-3 font-playfair text-xl">Loading dashboard data...</span>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-playfair font-semibold text-gray-900">Dashboard</h1>
            <p className="text-sm text-gray-500 mt-1 font-inter">Welcome back, {user?.name || 'User'}</p>
          </div>
          
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link to="/contacts">
                <Users className="h-4 w-4 mr-1" /> Contacts
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/tasks">
                <CheckSquare className="h-4 w-4 mr-1" /> Tasks
              </Link>
            </Button>
            <Button asChild>
              <Link to="/properties">
                <Building2 className="h-4 w-4 mr-1" /> Properties
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <Card key={stat.label} className="p-6 glass-card">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                  <h3 className="text-2xl font-playfair font-semibold text-gray-900 mt-1">{stat.value}</h3>
                </div>
                <div className="h-10 w-10 bg-blue-50 rounded-full flex items-center justify-center">
                  <stat.icon className="h-5 w-5 text-blue-500" />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-4 text-sm text-green-600">
                <ArrowUpRight className="h-4 w-4" />
                <span>{stat.change} from last month</span>
              </div>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6 glass-card">
            <h2 className="text-xl font-playfair font-semibold text-gray-900 mb-4">Lead Generation Overview</h2>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" stroke="#888888" />
                  <YAxis stroke="#888888" />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#2563eb"
                    strokeWidth={2}
                    dot={{ fill: '#2563eb' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <TasksDashboard />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6 glass-card">
            <h2 className="text-xl font-playfair font-semibold text-gray-900 mb-4">Properties Overview</h2>
            <div className="mb-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">Total Portfolio Value</p>
                <h3 className="text-xl font-playfair font-semibold">{formatCurrency(totalPropertyValue)}</h3>
              </div>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Available</p>
                  <h4 className="text-lg font-playfair font-semibold">
                    {properties.filter(p => p.status === 'available').length}
                  </h4>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Pending</p>
                  <h4 className="text-lg font-playfair font-semibold">
                    {properties.filter(p => p.status === 'pending').length}
                  </h4>
                </div>
              </div>
              <Button asChild className="w-full">
                <Link to="/properties">View All Properties</Link>
              </Button>
            </div>
          </Card>
        </div>

        {isAdmin && (
          <Card className="p-6 glass-card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-playfair font-semibold text-gray-900">User Activity</h2>
              <Button variant="outline" size="sm" asChild>
                <Link to="/admin/users">
                  <Activity className="h-4 w-4 mr-1" /> View All Users
                </Link>
              </Button>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={userActivityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" stroke="#888888" />
                  <YAxis stroke="#888888" />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="contacts" name="Contacts" fill="#3b82f6" />
                  <Bar dataKey="properties" name="Properties" fill="#10b981" />
                  <Bar dataKey="emails" name="Emails" fill="#f59e0b" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Index;
