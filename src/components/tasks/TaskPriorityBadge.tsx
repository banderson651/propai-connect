
import { Badge } from "@/components/ui/badge";
import { TaskPriority } from "@/types/task";
import { AlertTriangle, ArrowUp, CheckCircle, CircleDot } from "lucide-react";

interface TaskPriorityBadgeProps {
  priority: TaskPriority;
}

export const TaskPriorityBadge = ({ priority }: TaskPriorityBadgeProps) => {
  switch (priority) {
    case "low":
      return (
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          <CircleDot className="h-3 w-3 mr-1" />
          Low
        </Badge>
      );
    case "medium":
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          <CheckCircle className="h-3 w-3 mr-1" />
          Medium
        </Badge>
      );
    case "high":
      return (
        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
          <ArrowUp className="h-3 w-3 mr-1" />
          High
        </Badge>
      );
    case "urgent":
      return (
        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
          <AlertTriangle className="h-3 w-3 mr-1" />
          Urgent
        </Badge>
      );
    default:
      return null;
  }
};
