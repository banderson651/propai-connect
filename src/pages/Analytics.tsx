import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Mail, MessageSquare, CheckCircle, Clock, DollarSign, Users, TrendingUp, BarChart3 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { Property, Lead, Communication, Task } from '@/types/database';

interface AnalyticsData {
  totalProperties: number;
  totalValue: number;
  totalLeads: number;
  warmLeads: number;
  hotLeads: number;
  coldLeads: number;
  totalEmails: number;
  totalWhatsappSent: number;
  totalWhatsappReceived: number;
  pendingTasks: number;
  completedTasks: number;
  monthlyStats: {
    month: string;
    properties: number;
    leads: number;
    value: number;
  }[];
}

const Analytics = () => {
  const { user } = useAuth();
  const [data, setData] = useState<AnalyticsData>({
    totalProperties: 0,
    totalValue: 0,
    totalLeads: 0,
    warmLeads: 0,
    hotLeads: 0,
    coldLeads: 0,
    totalEmails: 0,
    totalWhatsappSent: 0,
    totalWhatsappReceived: 0,
    pendingTasks: 0,
    completedTasks: 0,
    monthlyStats: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!user) return;

      try {
        // Fetch properties data
        const { data: properties, error: propertiesError } = await supabase
          .from('properties')
          .select('*')
          .eq('user_id', user.id);

        if (propertiesError) throw propertiesError;

        // Fetch leads data
        const { data: leads, error: leadsError } = await supabase
          .from('leads')
          .select('*')
          .eq('user_id', user.id);

        if (leadsError) throw leadsError;

        // Fetch communication data
        const { data: communications, error: communicationsError } = await supabase
          .from('communications')
          .select('*')
          .eq('user_id', user.id);

        if (communicationsError) throw communicationsError;

        // Fetch tasks data
        const { data: tasks, error: tasksError } = await supabase
          .from('tasks')
          .select('*')
          .eq('user_id', user.id);

        if (tasksError) throw tasksError;

        // Calculate analytics
        const totalValue = (properties as Property[]).reduce((sum, property) => sum + (property.price || 0), 0);
        const warmLeads = (leads as Lead[]).filter(lead => lead.status === 'warm').length;
        const hotLeads = (leads as Lead[]).filter(lead => lead.status === 'hot').length;
        const coldLeads = (leads as Lead[]).filter(lead => lead.status === 'cold').length;
        const emails = (communications as Communication[]).filter(comm => comm.type === 'email').length;
        const whatsappSent = (communications as Communication[]).filter(comm => comm.type === 'whatsapp' && comm.direction === 'sent').length;
        const whatsappReceived = (communications as Communication[]).filter(comm => comm.type === 'whatsapp' && comm.direction === 'received').length;
        const pendingTasks = (tasks as Task[]).filter(task => task.status === 'pending').length;
        const completedTasks = (tasks as Task[]).filter(task => task.status === 'completed').length;

        // Calculate monthly stats
        const monthlyStats = Array.from({ length: 12 }, (_, i) => {
          const month = new Date(2024, i, 1).toLocaleString('default', { month: 'short' });
          const monthProperties = (properties as Property[]).filter(p => new Date(p.created_at).getMonth() === i).length;
          const monthLeads = (leads as Lead[]).filter(l => new Date(l.created_at).getMonth() === i).length;
          const monthValue = (properties as Property[])
            .filter(p => new Date(p.created_at).getMonth() === i)
            .reduce((sum, p) => sum + (p.price || 0), 0);

          return { month, properties: monthProperties, leads: monthLeads, value: monthValue };
        });

        setData({
          totalProperties: (properties as Property[]).length,
          totalValue,
          totalLeads: (leads as Lead[]).length,
          warmLeads,
          hotLeads,
          coldLeads,
          totalEmails: emails,
          totalWhatsappSent: whatsappSent,
          totalWhatsappReceived: whatsappReceived,
          pendingTasks,
          completedTasks,
          monthlyStats,
        });
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();

    // Set up real-time subscription
    const subscription = supabase
      .channel('analytics_changes')
      .on(
        'postgres_changes' as any,
        {
          event: '*',
          schema: 'public',
          tables: ['properties', 'leads', 'communications', 'tasks'],
        },
        () => {
          fetchAnalytics();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        <div className="flex items-center space-x-2">
          <BarChart3 className="h-6 w-6" />
          <span className="text-sm text-gray-500">Last updated: {new Date().toLocaleString()}</span>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalProperties}</div>
            <p className="text-xs text-muted-foreground">
              Total Value: ${data.totalValue.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalLeads}</div>
            <p className="text-xs text-muted-foreground">
              Hot: {data.hotLeads} | Warm: {data.warmLeads} | Cold: {data.coldLeads}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Communications</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalEmails + data.totalWhatsappSent + data.totalWhatsappReceived}</div>
            <p className="text-xs text-muted-foreground">
              Emails: {data.totalEmails} | WhatsApp: {data.totalWhatsappSent + data.totalWhatsappReceived}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasks</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.pendingTasks + data.completedTasks}</div>
            <p className="text-xs text-muted-foreground">
              Pending: {data.pendingTasks} | Completed: {data.completedTasks}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Trends Chart */}
      <Card className="col-span-3">
        <CardHeader>
          <CardTitle>Monthly Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.monthlyStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="properties" stroke="#8884d8" name="Properties" />
                <Line type="monotone" dataKey="leads" stroke="#82ca9d" name="Leads" />
                <Line type="monotone" dataKey="value" stroke="#ffc658" name="Value" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Analytics; 