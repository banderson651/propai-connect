
import { useState } from "react";
import { Task, TaskStatus } from "@/types/task";
import { TaskCard } from "./TaskCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, ListFilter, PlusCircle, Search } from "lucide-react";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Badge } from "../ui/badge";

interface TaskListProps {
  tasks: Task[];
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onChangeTaskStatus: (taskId: string, status: TaskStatus) => void;
  onCreateTask: () => void;
}

export const TaskList = ({ tasks, onEditTask, onDeleteTask, onChangeTaskStatus, onCreateTask }: TaskListProps) => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [priorityFilter, setPriorityFilter] = useState<string>("");
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);
  
  const filteredTasks = tasks.filter(task => {
    // Text search
    const matchesSearch = !searchTerm || 
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      task.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Status filter
    const matchesStatus = !statusFilter || task.status === statusFilter;
    
    // Priority filter
    const matchesPriority = !priorityFilter || task.priority === priorityFilter;
    
    // Date filter
    const matchesDate = !dateFilter || 
      (task.dueDate && format(new Date(task.dueDate), 'yyyy-MM-dd') === format(dateFilter, 'yyyy-MM-dd'));
    
    return matchesSearch && matchesStatus && matchesPriority && matchesDate;
  });
  
  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("");
    setPriorityFilter("");
    setDateFilter(undefined);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Tasks</h2>
        <Button onClick={onCreateTask}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Task
        </Button>
      </div>
      
      <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <Input
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Statuses</SelectItem>
            <SelectItem value="todo">To Do</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="review">Review</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="canceled">Canceled</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Priorities</SelectItem>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
          </SelectContent>
        </Select>
        
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-[130px] justify-start">
              <Calendar className="mr-2 h-4 w-4" />
              {dateFilter ? format(dateFilter, 'PP') : 'Date'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <CalendarComponent
              mode="single"
              selected={dateFilter}
              onSelect={setDateFilter}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
      
      {(statusFilter || priorityFilter || dateFilter || searchTerm) && (
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500 flex items-center">
            <ListFilter className="h-4 w-4 mr-1" /> Filters:
          </span>
          {statusFilter && (
            <Badge variant="secondary" className="flex items-center">
              Status: {statusFilter}
              <button
                onClick={() => setStatusFilter("")}
                className="ml-1 text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </Badge>
          )}
          {priorityFilter && (
            <Badge variant="secondary" className="flex items-center">
              Priority: {priorityFilter}
              <button
                onClick={() => setPriorityFilter("")}
                className="ml-1 text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </Badge>
          )}
          {dateFilter && (
            <Badge variant="secondary" className="flex items-center">
              Due: {format(dateFilter, 'PP')}
              <button
                onClick={() => setDateFilter(undefined)}
                className="ml-1 text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </Badge>
          )}
          {searchTerm && (
            <Badge variant="secondary" className="flex items-center">
              Search: "{searchTerm}"
              <button
                onClick={() => setSearchTerm("")}
                className="ml-1 text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </Badge>
          )}
          <Button variant="ghost" size="sm" onClick={resetFilters}>
            Clear All
          </Button>
        </div>
      )}
      
      {filteredTasks.length === 0 ? (
        <div className="text-center py-8 border border-dashed rounded-lg">
          <p className="text-gray-500">No tasks found. Try adjusting your filters or create a new task.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={onEditTask}
              onDelete={onDeleteTask}
              onStatusChange={onChangeTaskStatus}
            />
          ))}
        </div>
      )}
    </div>
  );
};
