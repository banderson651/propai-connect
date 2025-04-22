
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getTasks } from "@/services/taskService";
import { TaskStatus } from "@/types/task";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Clock, PlayCircle } from "lucide-react";
import { format, isToday, isTomorrow, isAfter, isBefore, endOfDay } from "date-fns";
import { Link } from "react-router-dom";

export const TasksDashboard = () => {
  const [statusView, setStatusView] = useState<TaskStatus | 'due-today' | 'due-tomorrow' | 'overdue'>('todo');
  
  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks-dashboard'],
    queryFn: () => getTasks(),
  });
  
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
  
  const dueTodayCount = tasks.filter(task => 
    task.dueDate && 
    isToday(new Date(task.dueDate)) && 
    task.status !== 'completed' && 
    task.status !== 'canceled'
  ).length;
  
  const dueTomorrowCount = tasks.filter(task => 
    task.dueDate && 
    isTomorrow(new Date(task.dueDate)) && 
    task.status !== 'completed' && 
    task.status !== 'canceled'
  ).length;
  
  const overdueCount = tasks.filter(task => 
    task.dueDate && 
    isBefore(new Date(task.dueDate), today) && 
    task.status !== 'completed' && 
    task.status !== 'canceled'
  ).length;
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle>Tasks Overview</CardTitle>
          <Button variant="outline" size="sm" asChild>
            <Link to="/tasks">View All</Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-2 mb-4">
          <button
            onClick={() => setStatusView('todo')}
            className={`flex items-center justify-center p-2 rounded-md ${
              statusView === 'todo' ? 'bg-blue-50 text-blue-700' : 'bg-gray-50 text-gray-700'
            }`}
          >
            <Clock className="h-4 w-4 mr-1" />
            <span className="text-sm font-medium">To Do ({todoCount})</span>
          </button>
          <button
            onClick={() => setStatusView('in-progress')}
            className={`flex items-center justify-center p-2 rounded-md ${
              statusView === 'in-progress' ? 'bg-blue-50 text-blue-700' : 'bg-gray-50 text-gray-700'
            }`}
          >
            <PlayCircle className="h-4 w-4 mr-1" />
            <span className="text-sm font-medium">In Progress ({inProgressCount})</span>
          </button>
          <button
            onClick={() => setStatusView('completed')}
            className={`flex items-center justify-center p-2 rounded-md ${
              statusView === 'completed' ? 'bg-blue-50 text-blue-700' : 'bg-gray-50 text-gray-700'
            }`}
          >
            <CheckCircle className="h-4 w-4 mr-1" />
            <span className="text-sm font-medium">Completed ({completedCount})</span>
          </button>
        </div>
        
        <div className="grid grid-cols-3 gap-2 mb-4">
          <button
            onClick={() => setStatusView('due-today')}
            className={`flex items-center justify-center p-2 rounded-md ${
              statusView === 'due-today' ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-700'
            }`}
          >
            <span className="text-sm font-medium">Today ({dueTodayCount})</span>
          </button>
          <button
            onClick={() => setStatusView('due-tomorrow')}
            className={`flex items-center justify-center p-2 rounded-md ${
              statusView === 'due-tomorrow' ? 'bg-amber-50 text-amber-700' : 'bg-gray-50 text-gray-700'
            }`}
          >
            <span className="text-sm font-medium">Tomorrow ({dueTomorrowCount})</span>
          </button>
          <button
            onClick={() => setStatusView('overdue')}
            className={`flex items-center justify-center p-2 rounded-md ${
              statusView === 'overdue' ? 'bg-red-50 text-red-700' : 'bg-gray-50 text-gray-700'
            } ${overdueCount > 0 ? 'font-semibold' : ''}`}
          >
            <span className="text-sm font-medium">Overdue ({overdueCount})</span>
          </button>
        </div>
        
        {isLoading ? (
          <div className="text-center py-4">
            <p className="text-gray-500">Loading tasks...</p>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-gray-500">No tasks found in this category.</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
            {filteredTasks.slice(0, 5).map((task) => (
              <Link 
                key={task.id} 
                to={`/tasks?id=${task.id}`}
                className="block p-3 hover:bg-gray-50 rounded-md border transition-colors"
              >
                <div className="flex justify-between items-start">
                  <h3 className="text-sm font-medium line-clamp-1">{task.title}</h3>
                  {task.priority === 'high' || task.priority === 'urgent' ? (
                    <div className="bg-red-50 text-xs text-red-700 px-1.5 py-0.5 rounded">
                      {task.priority}
                    </div>
                  ) : null}
                </div>
                {task.dueDate && (
                  <div className="text-xs text-gray-500 mt-1">
                    Due: {
                      isToday(new Date(task.dueDate)) 
                        ? 'Today' 
                        : isTomorrow(new Date(task.dueDate))
                          ? 'Tomorrow'
                          : format(new Date(task.dueDate), 'MMM d, yyyy')
                    }
                  </div>
                )}
              </Link>
            ))}
            {filteredTasks.length > 5 && (
              <div className="text-center pt-2">
                <Button variant="link" size="sm" asChild>
                  <Link to="/tasks">View {filteredTasks.length - 5} more</Link>
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
