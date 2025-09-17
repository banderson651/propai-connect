import { useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  format,
  formatDistanceToNow,
  isSameDay,
  startOfDay,
  subDays,
} from 'date-fns';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/integrations/supabase/types';
import {
  AlertCircle,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
  LifeBuoy,
  Loader2,
  RefreshCw,
  Shield,
  UserPlus,
  Users,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

import { cn } from '@/lib/utils';

// Data aliases for Supabase rows

type ProfileRow = Database['public']['Tables']['profiles']['Row'];
type PropertyRow = Database['public']['Tables']['properties']['Row'];
type ContactRow = Database['public']['Tables']['contacts']['Row'];
type TaskRow = Database['public']['Tables']['tasks']['Row'];
type EmailAccountRow = Database['public']['Tables']['email_accounts']['Row'];
type EmailCampaignRow = Database['public']['Tables']['email_campaigns']['Row'];
type AutomationRuleRow = Database['public']['Tables']['automation_rules']['Row'];
type NotificationRow = Database['public']['Tables']['notifications']['Row'];
type InteractionRow = Database['public']['Tables']['interactions']['Row'];
type ContactImportRow = Database['public']['Tables']['contact_imports']['Row'];

type AdminDashboardData = {
  profiles: ProfileRow[];
  properties: PropertyRow[];
  contacts: ContactRow[];
  tasks: TaskRow[];
  emailAccounts: EmailAccountRow[];
  emailCampaigns: EmailCampaignRow[];
  automationRules: AutomationRuleRow[];
  notifications: NotificationRow[];
  interactions: InteractionRow[];
  contactImports: ContactImportRow[];
};

const trendToneClasses: Record<'positive' | 'negative' | 'neutral', string> = {
  positive:
    'text-emerald-600 bg-emerald-50 border border-emerald-200 dark:text-emerald-300 dark:bg-emerald-500/10 dark:border-emerald-500/20',
  negative:
    'text-red-600 bg-red-50 border border-red-200 dark:text-red-300 dark:bg-red-500/10 dark:border-red-500/20',
  neutral:
    'text-slate-600 bg-slate-50 border border-slate-200 dark:text-slate-200 dark:bg-slate-500/10 dark:border-slate-500/20',
};

const ticketStatusStyles: Record<string, string> = {
  open: 'bg-amber-100 text-amber-700 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/20',
  in_progress:
    'bg-blue-100 text-blue-700 border border-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-500/20',
  resolved:
    'bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/20',
  closed:
    'bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-500/10 dark:text-slate-200 dark:border-slate-500/20',
};

const priorityStyles: Record<string, string> = {
  high: 'bg-red-100 text-red-700 border border-red-200 dark:bg-red-500/10 dark:text-red-300 dark:border-red-500/20',
  medium:
    'bg-amber-100 text-amber-700 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/20',
  low: 'bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-500/10 dark:text-slate-200 dark:border-slate-500/20',
};

const pieColors = ['#10b981', '#6366f1', '#f59e0b'];

const RESOLVED_STATUSES = ['completed', 'done', 'resolved', 'closed'];

const deriveTicketStatus = (status: string | null) => {
  if (!status) return 'open';
  const normalized = status.toLowerCase();
  if (RESOLVED_STATUSES.includes(normalized)) return 'resolved';
  if (normalized === 'in progress' || normalized === 'in_progress') return 'in_progress';
  return 'open';
};

const derivePriority = (priority: string | null) => {
  if (!priority) return 'medium';
  const normalized = priority.toLowerCase();
  if (normalized.includes('high')) return 'high';
  if (normalized.includes('low')) return 'low';
  return 'medium';
};

const fetchAdminDashboardData = async (): Promise<AdminDashboardData> => {
  const [
    profilesRes,
    propertiesRes,
    contactsRes,
    tasksRes,
    emailAccountsRes,
    emailCampaignsRes,
    automationRulesRes,
    notificationsRes,
    interactionsRes,
    contactImportsRes,
  ] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, email, name, role, created_at, updated_at')
      .order('created_at', { ascending: false }),
    supabase
      .from('properties')
      .select('id, title, status, property_type, created_at, updated_at, user_id')
      .order('created_at', { ascending: false }),
    supabase
      .from('contacts')
      .select('id, name, email, created_at, updated_at, user_id, tags')
      .order('created_at', { ascending: false })
      .limit(1000),
    supabase
      .from('tasks')
      .select('id, title, status, priority, created_at, updated_at, due_date, user_id, assigned_to')
      .order('updated_at', { ascending: false })
      .limit(500),
    supabase
      .from('email_accounts')
      .select('id, email, name, status, is_active, domain_verified, last_checked, created_at, updated_at, user_id')
      .order('created_at', { ascending: false }),
    supabase
      .from('email_campaigns')
      .select('id, name, status, created_at, updated_at')
      .order('created_at', { ascending: false }),
    supabase
      .from('automation_rules')
      .select('id, name, trigger_type, trigger_condition, is_active, updated_at, created_at')
      .order('updated_at', { ascending: false }),
    supabase
      .from('notifications')
      .select('id, title, type, message, created_at, user_id, read')
      .order('created_at', { ascending: false })
      .limit(50),
    supabase
      .from('interactions')
      .select('id, contact_id, type, subject, content, created_at, user_id')
      .order('created_at', { ascending: false })
      .limit(25),
    supabase
      .from('contact_imports')
      .select('id, filename, status, total_rows, imported_rows, created_at, updated_at, user_id')
      .order('created_at', { ascending: false }),
  ]);

  const responses = [
    profilesRes,
    propertiesRes,
    contactsRes,
    tasksRes,
    emailAccountsRes,
    emailCampaignsRes,
    automationRulesRes,
    notificationsRes,
    interactionsRes,
    contactImportsRes,
  ];

  const failed = responses.find((res) => res.error);
  if (failed?.error) {
    throw new Error(failed.error.message ?? 'Failed to load admin dashboard data');
  }

  return {
    profiles: profilesRes.data ?? [],
    properties: propertiesRes.data ?? [],
    contacts: contactsRes.data ?? [],
    tasks: tasksRes.data ?? [],
    emailAccounts: emailAccountsRes.data ?? [],
    emailCampaigns: emailCampaignsRes.data ?? [],
    automationRules: automationRulesRes.data ?? [],
    notifications: notificationsRes.data ?? [],
    interactions: interactionsRes.data ?? [],
    contactImports: contactImportsRes.data ?? [],
  };
};

const buildDayRange = (days: number) => {
  const result: Date[] = [];
  for (let i = days - 1; i >= 0; i -= 1) {
    result.push(startOfDay(subDays(new Date(), i)));
  }
  return result;
};

const countForDay = <T extends Record<string, any>>(items: T[], field: keyof T, day: Date) =>
  items.filter((item) => {
    const value = item[field];
    if (!value) return false;
    const date = new Date(value as string);
    return isSameDay(date, day);
  }).length;

const calculateChange = (current: number, previous: number) => {
  if (previous === 0) {
    if (current === 0) return { label: '0%', tone: 'neutral' as const };
    return { label: '+100%', tone: 'positive' as const };
  }
  const diff = ((current - previous) / previous) * 100;
  const label = `${diff >= 0 ? '+' : ''}${diff.toFixed(1)}%`;
  if (Math.abs(diff) < 0.1) {
    return { label: '0%', tone: 'neutral' as const };
  }
  return { label, tone: diff >= 0 ? ('positive' as const) : ('negative' as const) };
};

const resolvedTicketCount = (tasks: TaskRow[]) =>
  tasks.filter((task) => RESOLVED_STATUSES.includes((task.status ?? '').toLowerCase())).length;

const AdminDashboard = () => {
  const { isAdmin } = useAuth();
  const queryClient = useQueryClient();
  const [signupQuery, setSignupQuery] = useState('');
  const [ticketStatusFilter, setTicketStatusFilter] = useState<'all' | 'open' | 'resolved'>('all');

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: fetchAdminDashboardData,
    enabled: isAdmin,
    staleTime: 60_000,
  });

  useEffect(() => {
    if (!isAdmin) return;

    const tables = [
      'profiles',
      'properties',
      'contacts',
      'tasks',
      'email_accounts',
      'email_campaigns',
      'automation_rules',
      'notifications',
      'interactions',
      'contact_imports',
    ];

    const channel = supabase.channel('admin-dashboard-realtime');

    tables.forEach((table) => {
      channel.on('postgres_changes', { event: '*', schema: 'public', table }, () => {
        queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
      });
    });

    channel.subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAdmin, queryClient]);

  const profileMap = useMemo(() => {
    if (!data) return new Map<string, ProfileRow>();
    return new Map(data.profiles.map((profile) => [profile.id, profile]));
  }, [data]);

  const contactMap = useMemo(() => {
    if (!data) return new Map<string, ContactRow>();
    return new Map(data.contacts.map((contact) => [contact.id, contact]));
  }, [data]);

  const last7Days = useMemo(() => buildDayRange(7), []);
  const last30DaysStart = useMemo(() => subDays(new Date(), 30), []);
  const prev30DaysStart = useMemo(() => subDays(new Date(), 60), []);

  const summaryMetrics = useMemo(() => {
    if (!data) {
      return [];
    }

    const { profiles, tasks, automationRules } = data;
    const totalUsers = profiles.length;
    const currentPeriodUsers = profiles.filter((profile) => new Date(profile.created_at) >= last30DaysStart).length;
    const previousPeriodUsers = profiles.filter((profile) => {
      const created = new Date(profile.created_at);
      return created >= prev30DaysStart && created < last30DaysStart;
    }).length;
    const totalUsersChange = calculateChange(currentPeriodUsers, previousPeriodUsers);

    const currentSignups = profiles.filter((profile) => new Date(profile.created_at) >= subDays(new Date(), 7)).length;
    const previousSignups = profiles.filter((profile) => {
      const created = new Date(profile.created_at);
      return created >= subDays(new Date(), 14) && created < subDays(new Date(), 7);
    }).length;
    const signupChange = calculateChange(currentSignups, previousSignups);

    const openTasks = tasks.filter(
      (task) => !RESOLVED_STATUSES.includes((task.status ?? '').toLowerCase())
    ).length;
    const previousResolved = resolvedTicketCount(
      tasks.filter((task) => new Date(task.updated_at) < subDays(new Date(), 7))
    );
    const currentResolved = resolvedTicketCount(tasks);
    const openTaskChange = calculateChange(currentResolved, previousResolved);

    const activeAutomations = automationRules.filter((rule) => rule.is_active).length;
    const inactiveAutomations = automationRules.length - activeAutomations;
    const automationChange = calculateChange(activeAutomations, inactiveAutomations || 1);

    return [
      {
        id: 'total-users',
        label: 'Total Users',
        value: totalUsers.toLocaleString(),
        change: totalUsersChange.label,
        tone: totalUsersChange.tone,
        sublabel: 'Created in last 30 days',
        icon: Users,
      },
      {
        id: 'new-signups',
        label: 'New Signups',
        value: currentSignups.toLocaleString(),
        change: signupChange.label,
        tone: signupChange.tone,
        sublabel: 'Last 7 days',
        icon: UserPlus,
      },
      {
        id: 'open-tasks',
        label: 'Open Tasks',
        value: openTasks.toLocaleString(),
        change: openTaskChange.label,
        tone: openTaskChange.tone,
        sublabel: 'Resolved trend vs prior 7 days',
        icon: LifeBuoy,
      },
      {
        id: 'active-automations',
        label: 'Active Automations',
        value: activeAutomations.toLocaleString(),
        change: automationChange.label,
        tone: automationChange.tone,
        sublabel: `${automationRules.length} total rules`,
        icon: Shield,
      },
    ];
  }, [data, last30DaysStart, prev30DaysStart]);

  const timelineData = useMemo(() => {
    if (!data) return [];

    return last7Days.map((day) => ({
      day: format(day, 'EEE'),
      signups: countForDay(data.profiles, 'created_at', day),
      properties: countForDay(data.properties, 'created_at', day),
    }));
  }, [data, last7Days]);

  const creationActivity = useMemo(() => {
    if (!data) return [];

    return last7Days.map((day) => ({
      day: format(day, 'EEE'),
      contacts: countForDay(data.contacts, 'created_at', day),
      tasks: countForDay(data.tasks, 'created_at', day),
    }));
  }, [data, last7Days]);

  const userDistributionData = useMemo(() => {
    if (!data) return [];

    const totals = data.profiles.reduce(
      (acc, profile) => {
        const role = (profile.role ?? 'user').toLowerCase();
        if (role === 'admin') acc.admin += 1;
        else if (role === 'manager') acc.manager += 1;
        else acc.user += 1;
        return acc;
      },
      { admin: 0, manager: 0, user: 0 }
    );

    return [
      { name: 'Admins', value: totals.admin },
      { name: 'Managers', value: totals.manager },
      { name: 'Users', value: totals.user },
    ];
  }, [data]);

  const recentInteractions = useMemo(() => {
    if (!data) return [];
    return data.interactions
      .slice()
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 6)
      .map((interaction) => {
        const actor = profileMap.get(interaction.user_id ?? '')?.name ?? 'Team member';
        const contactName = contactMap.get(interaction.contact_id ?? '')?.name ?? 'Unknown contact';
        return {
          id: interaction.id,
          actor,
          contact: contactName,
          type: interaction.type,
          subject: interaction.subject ?? 'Untitled interaction',
          timeAgo: formatDistanceToNow(new Date(interaction.created_at), { addSuffix: true }),
        };
      });
  }, [data, profileMap, contactMap]);

  const campaignSummary = useMemo(() => {
    if (!data) return { scheduled: 0, running: 0, completed: 0 };
    return data.emailCampaigns.reduce(
      (acc, campaign) => {
        const status = (campaign.status ?? '').toLowerCase();
        if (status.includes('scheduled')) acc.scheduled += 1;
        else if (status.includes('running') || status.includes('active')) acc.running += 1;
        else if (status.includes('completed') || status.includes('sent')) acc.completed += 1;
        else acc.scheduled += 1;
        return acc;
      },
      { scheduled: 0, running: 0, completed: 0 }
    );
  }, [data]);

  const filteredProfiles = useMemo(() => {
    if (!data) return [];
    if (!signupQuery.trim()) {
      return data.profiles.slice(0, 40);
    }
    const query = signupQuery.toLowerCase();
    return data.profiles.filter((profile) => {
      const name = profile.name ?? '';
      return (
        profile.email.toLowerCase().includes(query) ||
        name.toLowerCase().includes(query) ||
        (profile.role ?? '').toLowerCase().includes(query)
      );
    });
  }, [data, signupQuery]);

  const supportTickets = useMemo(() => {
    if (!data) return [];

    const sortedTasks = data.tasks
      .slice()
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());

    return sortedTasks.map((task) => {
      const owner = profileMap.get(task.assigned_to ?? task.user_id);
      const ticketStatus = deriveTicketStatus(task.status);
      const priority = derivePriority(task.priority);
      return {
        id: task.id,
        title: task.title,
        owner: owner?.name ?? owner?.email ?? 'Unassigned',
        status: ticketStatus,
        priority,
        channel: task.related_contact_id ? 'Contact' : task.related_property_id ? 'Property' : 'General',
        updatedAt: task.updated_at,
        dueDate: task.due_date,
      };
    });
  }, [data, profileMap]);

  const filteredTickets = useMemo(() => {
    if (!supportTickets.length) return [];

    if (ticketStatusFilter === 'all') {
      return supportTickets;
    }

    if (ticketStatusFilter === 'resolved') {
      return supportTickets.filter((ticket) => ticket.status === 'resolved');
    }

    return supportTickets.filter((ticket) => ticket.status !== 'resolved');
  }, [supportTickets, ticketStatusFilter]);

  const automationSummaries = useMemo(() => {
    if (!data) return [];

    return data.automationRules
      .slice()
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      .map((rule) => ({
        id: rule.id,
        name: rule.name,
        status: rule.is_active ? 'Active' : 'Paused',
        progress: rule.is_active ? 100 : 10,
        trigger: rule.trigger_type,
        updated: formatDistanceToNow(new Date(rule.updated_at), { addSuffix: true }),
      }));
  }, [data]);

  const auditLog = useMemo(() => {
    if (!data) return [];

    return data.notifications
      .slice()
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .map((event) => {
        const actor = profileMap.get(event.user_id ?? '');
        const actorDisplay = actor?.name || actor?.email || 'System';
        return {
          id: event.id,
          actor: actorDisplay,
          scope: event.type ?? 'general',
          description: event.message ?? event.title,
          time: formatDistanceToNow(new Date(event.created_at), { addSuffix: true }),
          severity: event.type?.toLowerCase().includes('error') ? 'high' : 'medium',
        };
      });
  }, [data, profileMap]);

  const contactImportStatus = useMemo(() => {
    if (!data) return [];

    return data.contactImports
      .slice()
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .map((importJob) => ({
        id: importJob.id,
        filename: importJob.filename,
        status: importJob.status,
        progress:
          importJob.total_rows === 0
            ? 0
            : Math.round((importJob.imported_rows / importJob.total_rows) * 100),
        created: format(importJob.created_at ? new Date(importJob.created_at) : new Date(), 'PP'),
      }));
  }, [data]);

  const emailAccountDerived = useMemo(() => {
    if (!data) return [];

    return data.emailAccounts.map((account) => {
      const status = (account.status ?? '').toLowerCase();
      const hasIssue = status.includes('error') || status.includes('failed');
      const isActive = Boolean(account.is_active);
      const isVerified = Boolean(account.domain_verified);
      const derivedStatus = hasIssue
        ? 'warning'
        : isActive && isVerified
        ? 'operational'
        : 'maintenance';

      return {
        id: account.id,
        name: account.name,
        email: account.email,
        status: derivedStatus,
        statusLabel:
          derivedStatus === 'operational'
            ? 'Operational'
            : derivedStatus === 'warning'
            ? 'Attention'
            : 'Needs setup',
        lastChecked: account.last_checked
          ? formatDistanceToNow(new Date(account.last_checked), { addSuffix: true })
          : 'No sync recorded',
        isActive,
      };
    });
  }, [data]);

  const summaryCampaignCards = useMemo(() => {
    const total = data?.emailCampaigns.length ?? 0;
    if (!total) {
      return {
        scheduled: { value: 0, percent: 0 },
        running: { value: 0, percent: 0 },
        completed: { value: 0, percent: 0 },
      };
    }
    return {
      scheduled: {
        value: campaignSummary.scheduled,
        percent: Math.round((campaignSummary.scheduled / total) * 100),
      },
      running: {
        value: campaignSummary.running,
        percent: Math.round((campaignSummary.running / total) * 100),
      },
      completed: {
        value: campaignSummary.completed,
        percent: Math.round((campaignSummary.completed / total) * 100),
      },
    };
  }, [campaignSummary, data]);

  if (!isAdmin) {
    return (
      <DashboardLayout pageTitle="Admin Control Center">
        <div className="flex items-center justify-center h-[80vh]">
          <Card className="p-8 text-center max-w-md">
            <CardTitle className="text-xl text-red-600">Access Denied</CardTitle>
            <CardDescription className="mt-2">
              You need elevated permissions to access the admin control center.
            </CardDescription>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout pageTitle="Admin Control Center">
      <div className="p-6 lg:p-8 space-y-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-foreground">Admin Control Center</h1>
            <p className="text-sm text-muted-foreground mt-2">
              Real-time insight into user growth, CRM activity, automations and communications across PropAI.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" className="flex items-center gap-2" onClick={() => refetch()} disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              Refresh
            </Button>
            <Button className="flex items-center gap-2" disabled>
              <Shield className="h-4 w-4" />
              Maintenance Controls
            </Button>
          </div>
        </div>

        {error ? (
          <Card className="border border-destructive/40 bg-destructive/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-5 w-5" />
                Unable to load admin data
              </CardTitle>
              <CardDescription className="text-destructive/80">
                {error.message}
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Button variant="outline" onClick={() => refetch()}>
                Try again
              </Button>
            </CardFooter>
          </Card>
        ) : null}

        {isLoading && !data ? (
          <div className="flex items-center justify-center py-40">
            <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
          </div>
        ) : null}

        {data ? (
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="signups">User Signups</TabsTrigger>
              <TabsTrigger value="tickets">Support Tickets</TabsTrigger>
              <TabsTrigger value="operations">Operations</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {summaryMetrics.map((metric) => {
                  const TrendIcon = metric.tone === 'negative' ? ArrowDownRight : ArrowUpRight;
                  return (
                    <Card key={metric.id} className="p-6">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">{metric.label}</p>
                          <p className="text-3xl font-semibold mt-2 text-foreground">{metric.value}</p>
                          <p className="text-xs text-muted-foreground mt-3">{metric.sublabel}</p>
                        </div>
                        <metric.icon className="h-10 w-10 text-primary/80" />
                      </div>
                      <div
                        className={cn(
                          'mt-4 inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold',
                          trendToneClasses[metric.tone]
                        )}
                      >
                        <TrendIcon className="h-4 w-4" />
                        <span>{metric.change}</span>
                      </div>
                    </Card>
                  );
                })}
              </div>

              <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
                <Card>
                  <CardHeader>
                    <CardTitle>Platform activity</CardTitle>
                    <CardDescription>New signups and property intake for the past 7 days.</CardDescription>
                  </CardHeader>
                  <CardContent className="h-[320px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={timelineData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="day" stroke="#888888" />
                        <YAxis stroke="#888888" allowDecimals={false} />
                        <Tooltip />
                        <Line type="monotone" dataKey="signups" stroke="#3b82f6" name="Signups" strokeWidth={2} />
                        <Line type="monotone" dataKey="properties" stroke="#10b981" name="Properties" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>User distribution</CardTitle>
                    <CardDescription>Breakdown of profiles by role.</CardDescription>
                  </CardHeader>
                  <CardContent className="h-[320px] flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={userDistributionData}
                          cx="50%"
                          cy="50%"
                          outerRadius={90}
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {userDistributionData.map((entry, index) => (
                            <Cell key={entry.name} fill={pieColors[index % pieColors.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
                <Card>
                  <CardHeader>
                    <CardTitle>Engagement across CRM</CardTitle>
                    <CardDescription>Contacts created and team tasks logged per day.</CardDescription>
                  </CardHeader>
                  <CardContent className="h-[320px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={creationActivity}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="day" stroke="#888888" />
                        <YAxis stroke="#888888" allowDecimals={false} />
                        <Tooltip />
                        <Bar dataKey="contacts" name="Contacts" fill="#6366f1" radius={[6, 6, 0, 0]} />
                        <Bar dataKey="tasks" name="Tasks" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Email campaigns summary</CardTitle>
                    <CardDescription>Total campaigns: {data.emailCampaigns.length}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="rounded-lg border border-border/70 p-3">
                      <div className="flex items-center justify-between text-sm">
                        <span>Scheduled</span>
                        <span className="font-semibold">{summaryCampaignCards.scheduled.percent}%</span>
                      </div>
                      <Progress value={summaryCampaignCards.scheduled.percent} className="h-2 mt-2" />
                    </div>
                    <div className="rounded-lg border border-border/70 p-3">
                      <div className="flex items-center justify-between text-sm">
                        <span>Running</span>
                        <span className="font-semibold">{summaryCampaignCards.running.percent}%</span>
                      </div>
                      <Progress value={summaryCampaignCards.running.percent} className="h-2 mt-2" />
                    </div>
                    <div className="rounded-lg border border-border/70 p-3">
                      <div className="flex items-center justify-between text-sm">
                        <span>Completed</span>
                        <span className="font-semibold">{summaryCampaignCards.completed.percent}%</span>
                      </div>
                      <Progress value={summaryCampaignCards.completed.percent} className="h-2 mt-2" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
                <Card className="border-dashed">
                  <CardHeader>
                    <CardTitle>Email account health</CardTitle>
                    <CardDescription>Current connection status for authenticated domains.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {emailAccountDerived.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No email accounts connected yet.</p>
                    ) : (
                      emailAccountDerived.map((account) => (
                        <div
                          key={account.id}
                          className="flex flex-col gap-3 rounded-xl border border-border/80 bg-muted/40 p-4 md:flex-row md:items-center md:gap-6"
                        >
                          <div className="flex flex-col">
                            <h3 className="text-sm font-semibold text-foreground">{account.name}</h3>
                            <span className="text-xs text-muted-foreground">{account.email}</span>
                            <span className="text-xs text-muted-foreground mt-1">
                              Last checked {account.lastChecked}
                            </span>
                          </div>
                          <div className="ml-auto flex items-center gap-3">
                            <Badge
                              className={cn(
                                'px-2.5 py-0.5 text-xs font-semibold',
                                account.status === 'operational'
                                  ? 'bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/20'
                                  : account.status === 'warning'
                                  ? 'bg-amber-100 text-amber-700 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/20'
                                  : 'bg-blue-100 text-blue-700 border border-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-500/20'
                              )}
                            >
                              {account.statusLabel}
                            </Badge>
                            <Switch checked={account.isActive} disabled aria-label={`Account ${account.name} toggle`} />
                          </div>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Recent interactions</CardTitle>
                    <CardDescription>Latest touchpoints recorded by the team.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {recentInteractions.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No interactions logged yet.</p>
                    ) : (
                      recentInteractions.map((interaction) => (
                        <div key={interaction.id} className="rounded-lg border border-border/70 p-3">
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>{interaction.actor}</span>
                            <span>{interaction.timeAgo}</span>
                          </div>
                          <p className="text-sm font-semibold text-foreground mt-1">{interaction.subject}</p>
                          <p className="text-xs text-muted-foreground mt-1">{interaction.type} with {interaction.contact}</p>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="signups">
              <Card>
                <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <CardTitle>Recent user signups</CardTitle>
                    <CardDescription>Track activation progress across roles and invite sources.</CardDescription>
                  </div>
                  <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
                    <Input
                      placeholder="Search by name, email or role"
                      value={signupQuery}
                      onChange={(event) => setSignupQuery(event.target.value)}
                      className="w-full sm:w-72"
                    />
                    <Button variant="outline" onClick={() => setSignupQuery('')}>
                      Clear
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Last Updated</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredProfiles.map((profile) => (
                        <TableRow key={profile.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback>
                                  {(profile.name ?? profile.email).charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-sm font-medium text-foreground">{profile.name ?? '—'}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">{profile.email}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">{profile.role ?? 'user'}</Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {format(new Date(profile.created_at), 'PPpp')}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {format(new Date(profile.updated_at), 'PPpp')}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tickets">
              <Card>
                <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <CardTitle>Support ticket queue</CardTitle>
                    <CardDescription>
                      Tasks from across the workspace grouped as support follow-ups.
                    </CardDescription>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {[
                      { label: 'All', value: 'all' },
                      { label: 'Open', value: 'open' },
                      { label: 'Resolved', value: 'resolved' },
                    ].map((filter) => (
                      <Button
                        key={filter.value}
                        variant={ticketStatusFilter === filter.value ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setTicketStatusFilter(filter.value as typeof ticketStatusFilter)}
                      >
                        {filter.label}
                      </Button>
                    ))}
                  </div>
                </CardHeader>
                <CardContent className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead>Owner</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Channel</TableHead>
                        <TableHead>Updated</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTickets.map((ticket) => (
                        <TableRow key={ticket.id}>
                          <TableCell className="font-medium">{ticket.id.slice(0, 8)}</TableCell>
                          <TableCell className="max-w-xs text-sm text-foreground">{ticket.title}</TableCell>
                          <TableCell className="text-sm">{ticket.owner}</TableCell>
                          <TableCell>
                            <Badge className={ticketStatusStyles[ticket.status] ?? ticketStatusStyles.open}>
                              {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={priorityStyles[ticket.priority] ?? priorityStyles.medium}>
                              {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{ticket.channel}</Badge>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(ticket.updatedAt), { addSuffix: true })}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
                <CardFooter className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Task pipeline updates in real-time. Group tasks with the tag “support” to surface them here.</span>
                  <Button size="sm" variant="outline" className="gap-2" disabled>
                    <LifeBuoy className="h-4 w-4" />
                    Open helpdesk
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="operations" className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Automation rules</CardTitle>
                    <CardDescription>Latest workflow changes across the platform.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {automationSummaries.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No automation rules configured yet.</p>
                    ) : (
                      automationSummaries.map((rule) => (
                        <div key={rule.id} className="rounded-lg border border-border/70 p-4">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div>
                              <h3 className="text-sm font-semibold text-foreground">{rule.name}</h3>
                              <p className="text-xs text-muted-foreground mt-1">Trigger: {rule.trigger}</p>
                            </div>
                            <Badge variant={rule.status === 'Active' ? 'secondary' : 'outline'} className="text-xs">
                              {rule.status}
                            </Badge>
                          </div>
                          <div className="mt-4 space-y-2">
                            <Progress value={rule.progress} className="h-2" />
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>{rule.progress}% readiness</span>
                              <span>{rule.updated}</span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Audit log</CardTitle>
                    <CardDescription>Recent high-signal events and notifications.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {auditLog.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No audit activity detected.</p>
                    ) : (
                      auditLog.slice(0, 10).map((event) => (
                        <div key={event.id} className="flex items-start gap-3 rounded-lg border border-border/60 bg-muted/20 p-3">
                          <div className="mt-1">
                            {event.severity === 'high' ? (
                              <AlertTriangle className="h-5 w-5 text-amber-500" />
                            ) : (
                              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                            )}
                          </div>
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="text-sm font-semibold text-foreground">{event.actor}</p>
                              <Badge variant="outline" className="text-xs">
                                {event.scope}
                              </Badge>
                              <span className="text-[11px] text-muted-foreground">{event.time}</span>
                            </div>
                            <p className="mt-1 text-sm text-muted-foreground">{event.description}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Contact import activity</CardTitle>
                  <CardDescription>Monitor CSV imports performed across all workspaces.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {contactImportStatus.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No imports have been initiated yet.</p>
                  ) : (
                    contactImportStatus.map((item) => (
                      <div key={item.id} className="rounded-lg border border-border/70 p-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium text-foreground">{item.filename}</span>
                          <Badge variant="secondary">{item.status}</Badge>
                        </div>
                        <div className="mt-3 space-y-2">
                          <Progress value={item.progress} className="h-2" />
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>{item.progress}% completed</span>
                            <span>{item.created}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        ) : null}
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
