
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { WhatsAppAnalytics as WhatsAppAnalyticsType, useWhatsApp } from '@/contexts/WhatsAppContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Activity, BarChart2, CheckCheck, AlertCircle, Clock, MessageSquare } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export const WhatsAppAnalytics = () => {
  const { getAnalytics, isConnected } = useWhatsApp();
  const { toast } = useToast();
  const [analytics, setAnalytics] = useState<WhatsAppAnalyticsType | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (isConnected) {
      fetchAnalytics();
    } else {
      setLoading(false);
    }
  }, [isConnected]);
  
  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const data = await getAnalytics();
      setAnalytics(data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast({
        title: 'Error',
        description: 'Failed to load WhatsApp analytics',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };
  
  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Account Analytics</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-10">
          <p className="text-muted-foreground mb-4">
            Connect your WhatsApp Business account first to view analytics
          </p>
          <Activity className="w-12 h-12 text-muted-foreground mx-auto opacity-50" />
        </CardContent>
      </Card>
    );
  }
  
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Account Analytics</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-10">
          <p>Loading analytics data...</p>
        </CardContent>
      </Card>
    );
  }
  
  if (!analytics) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Account Analytics</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-10">
          <p className="text-muted-foreground mb-4">
            No analytics data available
          </p>
          <BarChart2 className="w-12 h-12 text-muted-foreground mx-auto opacity-50" />
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Account Analytics</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Messages Sent Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Messages Sent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div>
                <div className="text-2xl font-bold">{analytics.messageSent}</div>
                <p className="text-xs text-muted-foreground">
                  {analytics.messageDelivered} delivered
                </p>
              </div>
              <div className="h-12 w-12 bg-blue-50 rounded-full flex items-center justify-center">
                <MessageSquare className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Messages Read Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Messages Read
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div>
                <div className="text-2xl font-bold">{analytics.messageRead}</div>
                <p className="text-xs text-muted-foreground">
                  {Math.round((analytics.messageRead / analytics.messageDelivered) * 100)}% read rate
                </p>
              </div>
              <div className="h-12 w-12 bg-green-50 rounded-full flex items-center justify-center">
                <CheckCheck className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Failed Messages Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Failed Messages
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div>
                <div className="text-2xl font-bold">{analytics.messagesFailed}</div>
                <p className="text-xs text-muted-foreground">
                  {Math.round((analytics.messagesFailed / analytics.messageSent) * 100)}% failure rate
                </p>
              </div>
              <div className="h-12 w-12 bg-red-50 rounded-full flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-red-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Response Time Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg. Response Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div>
                <div className="text-2xl font-bold">{analytics.averageResponseTime.toFixed(1)} min</div>
                <p className="text-xs text-muted-foreground">
                  {analytics.responseRate}% response rate
                </p>
              </div>
              <div className="h-12 w-12 bg-purple-50 rounded-full flex items-center justify-center">
                <Clock className="h-6 w-6 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Message Volume Chart */}
      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>Message Volume (Last 14 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.dailyMessages.map(item => ({
                date: formatDate(item.date),
                messages: item.count
              }))}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="messages" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
