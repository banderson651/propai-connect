
import { Badge } from "@/components/ui/badge";
import { TaskStatus } from "@/types/task";
import { CheckCircle, Clock, PauseCircle, PlayCircle, XCircle } from "lucide-react";

interface TaskStatusBadgeProps {
  status: TaskStatus;
}

export const TaskStatusBadge = ({ status }: TaskStatusBadgeProps) => {
  switch (status) {
    case "todo":
      return (
        <Badge variant="outline" className="bg-secondary text-secondary-foreground border-border">
          <Clock className="h-3 w-3 mr-1" />
          To Do
        </Badge>
      );
    case "in-progress":
      return (
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          <PlayCircle className="h-3 w-3 mr-1" />
          In Progress
        </Badge>
      );
    case "review":
      return (
        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
          <PauseCircle className="h-3 w-3 mr-1" />
          Review
        </Badge>
      );
    case "completed":
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          <CheckCircle className="h-3 w-3 mr-1" />
          Completed
        </Badge>
      );
    case "canceled":
      return (
        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
          <XCircle className="h-3 w-3 mr-1" />
          Canceled
        </Badge>
      );
    default:
      return null;
  }
};
