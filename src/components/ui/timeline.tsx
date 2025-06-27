import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
type TimelineDotStatus = 'default' | 'primary' | 'success' | 'warning' | 'error' | 'muted' | 'empty';
interface TimelineItemProps {
  date?: string;
  title?: string;
  dotStatus?: TimelineDotStatus;
  icon?: ReactNode;
  children?: ReactNode;
}
const getDotColor = (status: TimelineDotStatus) => {
  switch (status) {
    case 'primary':
      return 'bg-primary border-primary-foreground';
    case 'success':
      return 'bg-green-500 border-green-100 dark:border-green-900';
    case 'warning':
      return 'bg-yellow-500 border-yellow-100 dark:border-yellow-900';
    case 'error':
      return 'bg-destructive border-destructive-foreground';
    case 'muted':
      return 'bg-muted border-muted-foreground';
    case 'empty':
      return 'bg-background border-primary';
    default:
      return 'bg-timeline-dot border-timeline-dotBorder';
  }
};
export function TimelineItem({
  date,
  title,
  dotStatus = 'default',
  icon,
  children
}: TimelineItemProps) {
  return <div className="timeline-content">
      {date && <div className="timeline-date bg-white">{date}</div>}
      <div className={cn("timeline-dot", getDotColor(dotStatus))}>
        {icon && <span className="text-white">{icon}</span>}
      </div>
      <div className="timeline-card bg-blue-100">
        {title && <h3 className="font-medium text-sm mb-2">{title}</h3>}
        {children}
      </div>
    </div>;
}
interface TimelineProps {
  children: ReactNode;
}
export function Timeline({
  children
}: TimelineProps) {
  return <div className="timeline-container">
      <div className="timeline-line bg-zinc-950" />
      {children}
    </div>;
}