import { supabase } from '@/lib/supabase';
import { startOfMonth, endOfMonth, subMonths, format } from 'date-fns';

export class AnalyticsService {
  private static instance: AnalyticsService;

  private constructor() {}

  public static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  async getOverviewMetrics(startDate: Date) {
    const { data: leads, error: leadsError } = await supabase
      .from('leads')
      .select('created_at')
      .gte('created_at', startDate.toISOString());

    const { data: properties, error: propertiesError } = await supabase
      .from('properties')
      .select('created_at')
      .gte('created_at', startDate.toISOString());

    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select('created_at')
      .gte('created_at', startDate.toISOString());

    const { data: revenue, error: revenueError } = await supabase
      .from('transactions')
      .select('amount')
      .gte('created_at', startDate.toISOString());

    if (leadsError || propertiesError || tasksError || revenueError) {
      throw new Error('Failed to fetch overview metrics');
    }

    // Process data into monthly buckets
    const months = Array.from({ length: 6 }, (_, i) => subMonths(new Date(), 5 - i));
    const leadsByMonth = months.map(month => ({
      date: month,
      count: leads.filter(lead => 
        new Date(lead.created_at).getMonth() === month.getMonth() &&
        new Date(lead.created_at).getFullYear() === month.getFullYear()
      ).length
    }));

    const propertiesByMonth = months.map(month => ({
      date: month,
      count: properties.filter(property => 
        new Date(property.created_at).getMonth() === month.getMonth() &&
        new Date(property.created_at).getFullYear() === month.getFullYear()
      ).length
    }));

    const tasksByMonth = months.map(month => ({
      date: month,
      count: tasks.filter(task => 
        new Date(task.created_at).getMonth() === month.getMonth() &&
        new Date(task.created_at).getFullYear() === month.getFullYear()
      ).length
    }));

    const revenueByMonth = months.map(month => ({
      date: month,
      amount: revenue
        .filter(transaction => 
          new Date(transaction.created_at).getMonth() === month.getMonth() &&
          new Date(transaction.created_at).getFullYear() === month.getFullYear()
        )
        .reduce((sum, transaction) => sum + transaction.amount, 0)
    }));

    return {
      leads: leadsByMonth.map(m => m.count),
      properties: propertiesByMonth.map(m => m.count),
      tasks: tasksByMonth.map(m => m.count),
      revenue: revenueByMonth.map(m => m.amount),
    };
  }

  async getLeadMetrics() {
    const { data: leads, error: leadsError } = await supabase
      .from('leads')
      .select('source, status, created_at, updated_at');

    if (leadsError) {
      throw new Error('Failed to fetch lead metrics');
    }

    // Process lead sources
    const sources = leads.reduce((acc, lead) => {
      acc[lead.source] = (acc[lead.source] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Process lead statuses
    const statuses = leads.reduce((acc, lead) => {
      acc[lead.status] = (acc[lead.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Calculate average response time
    const responseTimes = leads
      .filter(lead => lead.created_at && lead.updated_at)
      .map(lead => {
        const created = new Date(lead.created_at);
        const updated = new Date(lead.updated_at);
        return (updated.getTime() - created.getTime()) / (1000 * 60 * 60); // Convert to hours
      });

    const avgResponseTime = responseTimes.length > 0
      ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length
      : 0;

    // Calculate conversion rate
    const convertedLeads = leads.filter(lead => lead.status === 'converted').length;
    const conversionRate = leads.length > 0
      ? (convertedLeads / leads.length) * 100
      : 0;

    return {
      sources: Object.entries(sources).map(([name, count]) => ({ name, count })),
      status: Object.entries(statuses).map(([name, count]) => ({ name, count })),
      conversion: {
        rate: Math.round(conversionRate),
        avgResponseTime: Math.round(avgResponseTime * 10) / 10,
      },
    };
  }

  async getPropertyMetrics() {
    const { data: properties, error: propertiesError } = await supabase
      .from('properties')
      .select('type, status, price, views');

    if (propertiesError) {
      throw new Error('Failed to fetch property metrics');
    }

    // Process property types
    const types = properties.reduce((acc, property) => {
      acc[property.type] = (acc[property.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Process property statuses
    const statuses = properties.reduce((acc, property) => {
      acc[property.status] = (acc[property.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Calculate average price
    const averagePrice = properties.length > 0
      ? properties.reduce((sum, property) => sum + property.price, 0) / properties.length
      : 0;

    // Process views
    const views = properties.reduce((acc, property) => {
      const date = format(new Date(), 'yyyy-MM-dd');
      acc[date] = (acc[date] || 0) + property.views;
      return acc;
    }, {} as Record<string, number>);

    return {
      types: Object.entries(types).map(([name, count]) => ({ name, count })),
      status: Object.entries(statuses).map(([name, count]) => ({ name, count })),
      priceRanges: {
        average: Math.round(averagePrice),
      },
      views: Object.entries(views).map(([date, count]) => ({ date, count })),
    };
  }

  async getTaskMetrics() {
    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select('status, priority, due_date, completed_at');

    if (tasksError) {
      throw new Error('Failed to fetch task metrics');
    }

    // Process task statuses
    const statuses = tasks.reduce((acc, task) => {
      acc[task.status] = (acc[task.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Process task priorities
    const priorities = tasks.reduce((acc, task) => {
      acc[task.priority] = (acc[task.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Calculate completion rate
    const completedTasks = tasks.filter(task => task.completed_at).length;
    const completionRate = tasks.length > 0
      ? (completedTasks / tasks.length) * 100
      : 0;

    // Calculate overdue tasks
    const overdueTasks = tasks.filter(task => {
      if (!task.due_date || task.completed_at) return false;
      return new Date(task.due_date) < new Date();
    }).length;

    // Process completion rate by date
    const completionByDate = tasks.reduce((acc, task) => {
      if (!task.completed_at) return acc;
      const date = format(new Date(task.completed_at), 'yyyy-MM-dd');
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      status: Object.entries(statuses).map(([name, count]) => ({ name, count })),
      priority: Object.entries(priorities).map(([name, count]) => ({ name, count })),
      completion: Object.entries(completionByDate).map(([date, count]) => ({
        date,
        rate: Math.round((count / tasks.length) * 100),
      })),
      overdue: overdueTasks,
    };
  }

  async getCommunicationMetrics() {
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select('channel, created_at, responded_at, engagement');

    if (messagesError) {
      throw new Error('Failed to fetch communication metrics');
    }

    // Process messages by channel
    const channels = messages.reduce((acc, message) => {
      acc[message.channel] = (acc[message.channel] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Calculate response time
    const responseTimes = messages
      .filter(message => message.created_at && message.responded_at)
      .map(message => {
        const created = new Date(message.created_at);
        const responded = new Date(message.responded_at);
        return (responded.getTime() - created.getTime()) / (1000 * 60); // Convert to minutes
      });

    const avgResponseTime = responseTimes.length > 0
      ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length
      : 0;

    // Process engagement rate
    const engagementByDate = messages.reduce((acc, message) => {
      const date = format(new Date(message.created_at), 'yyyy-MM-dd');
      acc[date] = acc[date] || { total: 0, engaged: 0 };
      acc[date].total++;
      if (message.engagement) acc[date].engaged++;
      return acc;
    }, {} as Record<string, { total: number; engaged: number }>);

    return {
      channels: Object.entries(channels).map(([name, count]) => ({ name, count })),
      responseTime: Object.entries(engagementByDate).map(([date, data]) => ({
        date,
        time: Math.round(avgResponseTime),
      })),
      engagement: Object.entries(engagementByDate).map(([date, data]) => ({
        date,
        rate: Math.round((data.engaged / data.total) * 100),
      })),
      volume: messages.length,
    };
  }
} 