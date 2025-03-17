
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Task } from "@/types/task";
import { formatDistanceToNow } from "date-fns";
import { Calendar, Clock, LinkIcon, MapPin, MessageSquare, User } from "lucide-react";
import { TaskPriorityBadge } from "./TaskPriorityBadge";
import { TaskStatusBadge } from "./TaskStatusBadge";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onStatusChange: (taskId: string, status: Task['status']) => void;
}

export const TaskCard = ({ task, onEdit, onDelete, onStatusChange }: TaskCardProps) => {
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed' && task.status !== 'canceled';
  
  return (
    <Card className={`mb-4 ${isOverdue ? 'border-red-300' : ''}`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold">{task.title}</h3>
          <TaskPriorityBadge priority={task.priority} />
        </div>
        <div className="flex justify-between items-center mt-1">
          <TaskStatusBadge status={task.status} />
          {task.dueDate && (
            <div className="flex items-center text-xs text-gray-500">
              <Calendar className="h-3 w-3 mr-1" />
              <span className={isOverdue ? 'text-red-500 font-medium' : ''}>
                {isOverdue ? 'Overdue: ' : 'Due: '}
                {formatDistanceToNow(new Date(task.dueDate), { addSuffix: true })}
              </span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="py-2">
        {task.description && <p className="text-sm text-gray-600 mb-2">{task.description}</p>}
        
        <div className="space-y-2">
          {task.relatedPropertyId && (
            <div className="flex items-center text-xs text-gray-500">
              <MapPin className="h-3 w-3 mr-1" />
              <span>Connected to property</span>
            </div>
          )}
          
          {task.relatedContactId && (
            <div className="flex items-center text-xs text-gray-500">
              <User className="h-3 w-3 mr-1" />
              <span>Connected to contact</span>
            </div>
          )}
          
          {task.relatedCampaignId && (
            <div className="flex items-center text-xs text-gray-500">
              <MessageSquare className="h-3 w-3 mr-1" />
              <span>Connected to campaign</span>
            </div>
          )}
          
          {task.reminders.length > 0 && (
            <div className="flex items-center text-xs text-gray-500">
              <Clock className="h-3 w-3 mr-1" />
              <span>{task.reminders.length} reminder{task.reminders.length > 1 ? 's' : ''}</span>
            </div>
          )}
        </div>
        
        {task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {task.tags.map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-2 flex justify-between">
        <div className="text-xs text-gray-500">
          Created {formatDistanceToNow(new Date(task.createdAt), { addSuffix: true })}
        </div>
        <div className="flex space-x-2">
          {task.status !== 'completed' && task.status !== 'canceled' && (
            <Button 
              variant="outline" 
              size="sm" 
              className="text-xs"
              onClick={() => onStatusChange(task.id, 'completed')}
            >
              Complete
            </Button>
          )}
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-xs"
            onClick={() => onEdit(task)}
          >
            Edit
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};
