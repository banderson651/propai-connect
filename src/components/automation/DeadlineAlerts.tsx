
import React, { useState } from 'react';
import { CalendarIcon, AlertCircle, Bell, Check } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface DeadlineAlert {
  id: string;
  title: string;
  description: string;
  date: Date;
  category: 'payment' | 'contract' | 'follow-up' | 'other';
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'acknowledged' | 'resolved';
}

export const DeadlineAlerts = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  
  // Sample alerts - in a real app, these would come from the database
  const [alerts, setAlerts] = useState<DeadlineAlert[]>([
    {
      id: '1',
      title: 'Contract Expiration - Smith Property',
      description: 'The listing agreement expires in 5 days',
      date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      category: 'contract',
      priority: 'high',
      status: 'pending'
    },
    {
      id: '2',
      title: 'Payment Due - Johnson Family',
      description: 'Monthly rental payment due',
      date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      category: 'payment',
      priority: 'medium',
      status: 'pending'
    },
    {
      id: '3',
      title: 'Follow-up with Lead - Michael Brown',
      description: 'Lead viewed property listing 3 times',
      date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      category: 'follow-up',
      priority: 'medium',
      status: 'acknowledged'
    },
    {
      id: '4',
      title: 'Document Renewal - Davis Estate',
      description: 'Property tax documents need to be renewed',
      date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      category: 'other',
      priority: 'low',
      status: 'pending'
    }
  ]);

  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'low': return 'bg-blue-100 text-blue-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch(category) {
      case 'payment': return <AlertCircle className="h-4 w-4 text-green-600" />;
      case 'contract': return <AlertCircle className="h-4 w-4 text-blue-600" />;
      case 'follow-up': return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const updateAlertStatus = (id: string, status: 'pending' | 'acknowledged' | 'resolved') => {
    setAlerts(prevAlerts => 
      prevAlerts.map(alert => 
        alert.id === id ? { ...alert, status } : alert
      )
    );
  };

  const filteredAlerts = date 
    ? alerts.filter(alert => 
        format(alert.date, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
      )
    : alerts;

  const sortedAlerts = [...filteredAlerts].sort((a, b) => {
    // First by status (pending first)
    if (a.status === 'pending' && b.status !== 'pending') return -1;
    if (a.status !== 'pending' && b.status === 'pending') return 1;
    
    // Then by priority
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Deadline Alerts</CardTitle>
          <CardDescription>
            Manage your important deadlines and receive timely reminders
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4 mb-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-[240px] justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
            <Button variant="outline" onClick={() => setDate(undefined)}>
              Show All
            </Button>
          </div>

          {sortedAlerts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No deadlines found for the selected date</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sortedAlerts.map((alert) => (
                <div 
                  key={alert.id} 
                  className={`p-4 border rounded-lg ${alert.status === 'resolved' ? 'opacity-60' : ''}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center space-x-2">
                      {getCategoryIcon(alert.category)}
                      <span className="font-medium">{alert.title}</span>
                    </div>
                    <Badge className={getPriorityColor(alert.priority)}>
                      {alert.priority}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{alert.description}</p>
                  <div className="flex justify-between items-center">
                    <div className="text-sm">
                      <CalendarIcon className="inline h-4 w-4 mr-1" />
                      {format(new Date(alert.date), 'PPP')}
                    </div>
                    <div className="flex space-x-2">
                      {alert.status === 'pending' && (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => updateAlertStatus(alert.id, 'acknowledged')}
                        >
                          <Bell className="h-4 w-4 mr-1" /> Acknowledge
                        </Button>
                      )}
                      {alert.status !== 'resolved' && (
                        <Button 
                          size="sm" 
                          variant="default" 
                          onClick={() => updateAlertStatus(alert.id, 'resolved')}
                        >
                          <Check className="h-4 w-4 mr-1" /> Resolve
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
