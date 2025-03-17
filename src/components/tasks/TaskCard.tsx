
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Task } from "@/types/task";
import { formatDistanceToNow } from "date-fns";
import { Calendar, Clock, LinkIcon, MapPin, MessageSquare, MoreHorizontal, User, Bell, Calendar as CalendarIcon } from "lucide-react";
import { TaskPriorityBadge } from "./TaskPriorityBadge";
import { TaskStatusBadge } from "./TaskStatusBadge";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onStatusChange: (taskId: string, status: Task['status']) => void;
}

export const TaskCard = ({ task, onEdit, onDelete, onStatusChange }: TaskCardProps) => {
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed' && task.status !== 'canceled';
  
  return (
    <Card className={`mb-4 ${isOverdue ? 'border-red-300 shadow-sm' : ''}`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold line-clamp-2">{task.title}</h3>
          <div className="flex items-start space-x-2">
            <TaskPriorityBadge priority={task.priority} />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(task)}>
                  Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {task.status !== 'completed' && (
                  <DropdownMenuItem onClick={() => onStatusChange(task.id, 'completed')}>
                    Mark as completed
                  </DropdownMenuItem>
                )}
                {task.status !== 'in-progress' && task.status !== 'completed' && (
                  <DropdownMenuItem onClick={() => onStatusChange(task.id, 'in-progress')}>
                    Start progress
                  </DropdownMenuItem>
                )}
                {task.status !== 'todo' && task.status !== 'completed' && (
                  <DropdownMenuItem onClick={() => onStatusChange(task.id, 'todo')}>
                    Move to to-do
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => onDelete(task.id)}
                  className="text-red-600"
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <div className="flex justify-between items-center mt-1">
          <TaskStatusBadge status={task.status} />
          {task.dueDate && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center text-xs text-gray-500">
                    <Calendar className="h-3 w-3 mr-1" />
                    <span className={isOverdue ? 'text-red-500 font-medium' : ''}>
                      {isOverdue ? 'Overdue: ' : 'Due: '}
                      {formatDistanceToNow(new Date(task.dueDate), { addSuffix: true })}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  {new Date(task.dueDate).toLocaleDateString()} at {new Date(task.dueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </CardHeader>
      <CardContent className="py-2">
        {task.description && <p className="text-sm text-gray-600 mb-2 line-clamp-2">{task.description}</p>}
        
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
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center text-xs text-gray-500">
                    <Bell className="h-3 w-3 mr-1" />
                    <span>{task.reminders.length} reminder{task.reminders.length > 1 ? 's' : ''}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="space-y-1">
                    {task.reminders.map((reminder, index) => (
                      <div key={reminder.id} className="text-xs">
                        {reminder.type}: {new Date(reminder.time).toLocaleDateString()} at {new Date(reminder.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    ))}
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          
          {task.assignedTo && (
            <div className="flex items-center text-xs text-gray-500">
              <User className="h-3 w-3 mr-1" />
              <span>Assigned to: {task.assignedTo === 'current-user' ? 'You' : task.assignedTo}</span>
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
