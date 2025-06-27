import { useState, useEffect } from 'react';
import { Timeline, TimelineItem } from '@/components/ui/timeline';
import { Building2, User, Mail, CheckCircle, Calendar, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatDate, formatTime } from '@/lib/utils';
import { Button } from '@/components/ui/button';
type ActivityType = 'contact' | 'property' | 'email' | 'task' | 'meeting' | 'message';
interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  timestamp: string;
  relatedId?: string;
  relatedLink?: string;
}
export function ActivityTimeline() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const navigate = useNavigate();
  useEffect(() => {
    // Here you would fetch real activities from your API
    // This is just mock data for demonstration
    const mockActivities: Activity[] = [{
      id: '1',
      type: 'contact',
      title: 'New Contact Added',
      description: 'John Smith was added to your contacts',
      timestamp: new Date(new Date().getTime() - 30 * 60000).toISOString(),
      relatedId: '123',
      relatedLink: '/contacts/123'
    }, {
      id: '2',
      type: 'property',
      title: 'Property Updated',
      description: 'Skyline Apartment price was updated',
      timestamp: new Date(new Date().getTime() - 2 * 3600000).toISOString(),
      relatedId: '456',
      relatedLink: '/properties/456'
    }, {
      id: '3',
      type: 'task',
      title: 'Task Completed',
      description: 'Call with potential client was completed',
      timestamp: new Date(new Date().getTime() - 1 * 86400000).toISOString()
    }, {
      id: '4',
      type: 'meeting',
      title: 'Upcoming Meeting',
      description: 'Property viewing with Sarah Johnson',
      timestamp: new Date(new Date().getTime() + 2 * 86400000).toISOString()
    }, {
      id: '5',
      type: 'email',
      title: 'Email Campaign Sent',
      description: 'Monthly newsletter was sent to 126 contacts',
      timestamp: new Date(new Date().getTime() - 3 * 86400000).toISOString(),
      relatedId: '789',
      relatedLink: '/email/campaigns/789'
    }, {
      id: '6',
      type: 'message',
      title: 'New WhatsApp Message',
      description: 'Michael Brown sent you a message',
      timestamp: new Date(new Date().getTime() - 4 * 3600000).toISOString()
    }];
    setActivities(mockActivities);
  }, []);
  const getActivityIcon = (type: ActivityType) => {
    switch (type) {
      case 'contact':
        return <User className="h-3 w-3" />;
      case 'property':
        return <Building2 className="h-3 w-3" />;
      case 'email':
        return <Mail className="h-3 w-3" />;
      case 'task':
        return <CheckCircle className="h-3 w-3" />;
      case 'meeting':
        return <Calendar className="h-3 w-3" />;
      case 'message':
        return <MessageSquare className="h-3 w-3" />;
      default:
        return null;
    }
  };
  const getActivityDotStatus = (type: ActivityType) => {
    switch (type) {
      case 'contact':
        return 'primary';
      case 'property':
        return 'success';
      case 'email':
        return 'warning';
      case 'task':
        return 'primary';
      case 'meeting':
        return 'error';
      case 'message':
        return 'success';
      default:
        return 'default';
    }
  };
  const handleNavigate = (activity: Activity) => {
    if (activity.relatedLink) {
      navigate(activity.relatedLink);
    }
  };
  const formatActivityDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.setHours(0, 0, 0, 0) === today.setHours(0, 0, 0, 0)) {
      return `Today, ${formatTime(date)}`;
    } else if (date.setHours(0, 0, 0, 0) === yesterday.setHours(0, 0, 0, 0)) {
      return `Yesterday, ${formatTime(date)}`;
    } else {
      return `${formatDate(date)}, ${formatTime(date)}`;
    }
  };
  return <div className="rounded-lg border p-4 bg-white">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Recent Activity</h2>
        <Button variant="ghost" size="sm">View All</Button>
      </div>
      
      <Timeline>
        {activities.map(activity => <TimelineItem key={activity.id} date={formatActivityDate(activity.timestamp)} title={activity.title} dotStatus={getActivityDotStatus(activity.type)} icon={getActivityIcon(activity.type)}>
            <p className="text-sm mb-2 text-inherit">{activity.description}</p>
            {activity.relatedLink && <Button variant="ghost" size="sm" className="text-xs p-0 h-auto hover:bg-transparent hover:underline" onClick={() => handleNavigate(activity)}>
                View details
              </Button>}
          </TimelineItem>)}
      </Timeline>
    </div>;
}