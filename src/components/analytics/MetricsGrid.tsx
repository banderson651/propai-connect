import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Users, MessageSquare, CheckCircle } from 'lucide-react';

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

interface MetricsGridProps {
  data: AnalyticsData;
}

export const MetricsGrid = ({ data }: MetricsGridProps) => {
  return (
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
  );
}; 