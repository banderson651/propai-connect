import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import type { Property, Lead, Communication, Task } from '@/types/database';
import { MetricsGrid } from '@/components/analytics/MetricsGrid';
import { MonthlyTrendsChart } from '@/components/analytics/MonthlyTrendsChart';

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

      <MetricsGrid data={data} />
      <MonthlyTrendsChart data={data.monthlyStats} />
    </div>
  );
};

export default Analytics; 