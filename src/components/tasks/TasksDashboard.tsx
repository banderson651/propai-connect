import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getTasks } from "@/services/taskService";
import { TaskStatus } from "@/types/task";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Clock, PlayCircle } from "lucide-react";
import { format, isToday, isTomorrow, isAfter, isBefore, endOfDay } from "date-fns";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
export const TasksDashboard = () => {
  const [statusView, setStatusView] = useState<TaskStatus | 'due-today' | 'due-tomorrow' | 'overdue'>('todo');
  const { user } = useAuth();
  const userId = user?.id;
  const {
    data: tasksData,
    isLoading
  } = useQuery({
    queryKey: ['tasks-dashboard', userId],
    queryFn: () => getTasks(),
    enabled: Boolean(userId)
  });
  const tasks = tasksData ?? [];
  const today = new Date();
  const todayEnd = endOfDay(today);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowEnd = endOfDay(tomorrow);
  const filteredTasks = tasks.filter(task => {
    if (statusView === 'due-today' && task.dueDate) {
      return isToday(new Date(task.dueDate)) && task.status !== 'completed' && task.status !== 'canceled';
    }
    if (statusView === 'due-tomorrow' && task.dueDate) {
      return isTomorrow(new Date(task.dueDate)) && task.status !== 'completed' && task.status !== 'canceled';
    }
    if (statusView === 'overdue' && task.dueDate) {
      return isBefore(new Date(task.dueDate), today) && task.status !== 'completed' && task.status !== 'canceled';
    }
    return task.status === statusView;
  });
  const todoCount = tasks.filter(task => task.status === 'todo').length;
  const inProgressCount = tasks.filter(task => task.status === 'in-progress').length;
  const completedCount = tasks.filter(task => task.status === 'completed').length;
  const dueTodayCount = tasks.filter(task => task.dueDate && isToday(new Date(task.dueDate)) && task.status !== 'completed' && task.status !== 'canceled').length;
  const dueTomorrowCount = tasks.filter(task => task.dueDate && isTomorrow(new Date(task.dueDate)) && task.status !== 'completed' && task.status !== 'canceled').length;
  const overdueCount = tasks.filter(task => task.dueDate && isBefore(new Date(task.dueDate), today) && task.status !== 'completed' && task.status !== 'canceled').length;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <button onClick={() => setStatusView('todo')} className={`flex items-center justify-center rounded-lg border p-2 text-sm font-medium transition-colors ${statusView === 'todo' ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-card text-muted-foreground hover:text-foreground'}`}>
          <Clock className="mr-2 h-4 w-4" />
          To Do ({todoCount})
        </button>
        <button onClick={() => setStatusView('in-progress')} className={`flex items-center justify-center rounded-lg border p-2 text-sm font-medium transition-colors ${statusView === 'in-progress' ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-card text-muted-foreground hover:text-foreground'}`}>
          <PlayCircle className="mr-2 h-4 w-4" />
          In Progress ({inProgressCount})
        </button>
        <button onClick={() => setStatusView('completed')} className={`hidden items-center justify-center rounded-lg border p-2 text-sm font-medium transition-colors sm:flex ${statusView === 'completed' ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-card text-muted-foreground hover:text-foreground'}`}>
          <CheckCircle className="mr-2 h-4 w-4" />
          Completed ({completedCount})
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <button onClick={() => setStatusView('due-today')} className={`flex items-center justify-center rounded-lg border p-2 text-sm font-medium transition-colors ${statusView === 'due-today' ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-card text-muted-foreground hover:text-foreground'}`}>
          Today ({dueTodayCount})
        </button>
        <button onClick={() => setStatusView('due-tomorrow')} className={`flex items-center justify-center rounded-lg border p-2 text-sm font-medium transition-colors ${statusView === 'due-tomorrow' ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-card text-muted-foreground hover:text-foreground'}`}>
          Tomorrow ({dueTomorrowCount})
        </button>
        <button onClick={() => setStatusView('overdue')} className={`hidden items-center justify-center rounded-lg border p-2 text-sm font-medium transition-colors sm:flex ${statusView === 'overdue' ? 'border-destructive bg-destructive/10 text-destructive' : 'border-border bg-card text-muted-foreground hover:text-foreground'}`}>
          Overdue ({overdueCount})
        </button>
      </div>

      {isLoading ? (
        <div className="py-8 text-center text-muted-foreground">Loading tasks...</div>
      ) : filteredTasks.length === 0 ? (
        <div className="py-8 text-center text-muted-foreground">No tasks found in this category.</div>
      ) : (
        <div className="space-y-2">
          {filteredTasks.slice(0, 6).map(task => (
            <Link
              key={task.id}
              to={`/tasks?id=${task.id}`}
              className="block rounded-lg border border-border bg-card p-3 transition-colors hover:bg-secondary"
            >
              <div className="flex items-start justify-between">
                <h3 className="text-sm font-medium text-foreground line-clamp-1">{task.title}</h3>
                {task.priority === 'high' || task.priority === 'urgent' ? (
                  <div className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-semibold capitalize text-red-700">
                    {task.priority}
                  </div>
                ) : null}
              </div>
              {task.dueDate && (
                <div className="mt-1 text-xs text-muted-foreground">
                  Due: {isToday(new Date(task.dueDate)) ? 'Today' : isTomorrow(new Date(task.dueDate)) ? 'Tomorrow' : format(new Date(task.dueDate), 'MMM d, yyyy')}
                </div>
              )}
            </Link>
          ))}
        </div>
      )}

      <div className="flex justify-end">
        <Button variant="link" size="sm" asChild>
          <Link to="/tasks">View all tasks</Link>
        </Button>
      </div>
    </div>
  );
};
