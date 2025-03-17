
import { useState, useEffect } from "react";
import { Task, TaskStatus } from "@/types/task";
import { TaskCard } from "./TaskCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, ListFilter, PlusCircle, Search, X } from "lucide-react";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, isSameDay } from "date-fns";
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
  const [assigneeFilter, setAssigneeFilter] = useState<string>("");
  const [tagFilter, setTagFilter] = useState<string>("");
  const [view, setView] = useState<"grid" | "list">("grid");
  
  // Save filters to localStorage
  useEffect(() => {
    const filters = {
      searchTerm,
      statusFilter,
      priorityFilter,
      dateFilter: dateFilter?.toISOString() || "",
      assigneeFilter,
      tagFilter,
      view
    };
    localStorage.setItem('taskFilters', JSON.stringify(filters));
  }, [searchTerm, statusFilter, priorityFilter, dateFilter, assigneeFilter, tagFilter, view]);
  
  // Load filters from localStorage
  useEffect(() => {
    const savedFilters = localStorage.getItem('taskFilters');
    if (savedFilters) {
      const filters = JSON.parse(savedFilters);
      setSearchTerm(filters.searchTerm || "");
      setStatusFilter(filters.statusFilter || "");
      setPriorityFilter(filters.priorityFilter || "");
      setDateFilter(filters.dateFilter ? new Date(filters.dateFilter) : undefined);
      setAssigneeFilter(filters.assigneeFilter || "");
      setTagFilter(filters.tagFilter || "");
      setView(filters.view || "grid");
    }
  }, []);
  
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
      (task.dueDate && isSameDay(new Date(task.dueDate), dateFilter));
    
    // Assignee filter (simplified for now)
    const matchesAssignee = !assigneeFilter || task.assignedTo === assigneeFilter;
    
    // Tag filter
    const matchesTag = !tagFilter || 
      task.tags.some(tag => tag.toLowerCase() === tagFilter.toLowerCase());
    
    return matchesSearch && matchesStatus && matchesPriority && matchesDate && matchesAssignee && matchesTag;
  });
  
  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("");
    setPriorityFilter("");
    setDateFilter(undefined);
    setAssigneeFilter("");
    setTagFilter("");
  };
  
  // Extract all unique tags from tasks
  const allTags = [...new Set(tasks.flatMap(task => task.tags))];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Tasks</h2>
        <div className="flex space-x-2">
          <Button 
            variant={view === "grid" ? "default" : "outline"}
            size="sm"
            onClick={() => setView("grid")}
          >
            Grid
          </Button>
          <Button 
            variant={view === "list" ? "default" : "outline"}
            size="sm"
            onClick={() => setView("list")}
          >
            List
          </Button>
          <Button onClick={onCreateTask}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Task
          </Button>
        </div>
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
        
        {allTags.length > 0 && (
          <Select value={tagFilter} onValueChange={setTagFilter}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Tag" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Tags</SelectItem>
              {allTags.map(tag => (
                <SelectItem key={tag} value={tag}>{tag}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
      
      {(statusFilter || priorityFilter || dateFilter || searchTerm || tagFilter || assigneeFilter) && (
        <div className="flex items-center space-x-2 flex-wrap">
          <span className="text-sm text-gray-500 flex items-center">
            <ListFilter className="h-4 w-4 mr-1" /> Filters:
          </span>
          {statusFilter && (
            <Badge variant="secondary" className="flex items-center">
              Status: {statusFilter}
              <button
                type="button"
                onClick={() => setStatusFilter("")}
                className="ml-1 text-gray-500 hover:text-gray-700"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {priorityFilter && (
            <Badge variant="secondary" className="flex items-center">
              Priority: {priorityFilter}
              <button
                type="button"
                onClick={() => setPriorityFilter("")}
                className="ml-1 text-gray-500 hover:text-gray-700"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {dateFilter && (
            <Badge variant="secondary" className="flex items-center">
              Due: {format(dateFilter, 'PP')}
              <button
                type="button"
                onClick={() => setDateFilter(undefined)}
                className="ml-1 text-gray-500 hover:text-gray-700"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {searchTerm && (
            <Badge variant="secondary" className="flex items-center">
              Search: "{searchTerm}"
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="ml-1 text-gray-500 hover:text-gray-700"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {tagFilter && (
            <Badge variant="secondary" className="flex items-center">
              Tag: {tagFilter}
              <button
                type="button"
                onClick={() => setTagFilter("")}
                className="ml-1 text-gray-500 hover:text-gray-700"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {assigneeFilter && (
            <Badge variant="secondary" className="flex items-center">
              Assignee: {assigneeFilter}
              <button
                type="button"
                onClick={() => setAssigneeFilter("")}
                className="ml-1 text-gray-500 hover:text-gray-700"
              >
                <X className="h-3 w-3" />
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
      ) : view === "grid" ? (
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
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Title</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Priority</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Due Date</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Tags</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.map((task) => (
                <tr key={task.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium">
                    <div className="flex items-center">
                      <span className="truncate max-w-xs">{task.title}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        task.status === 'completed' ? 'bg-green-100 text-green-800' : 
                        task.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                        task.status === 'todo' ? 'bg-gray-100 text-gray-800' :
                        task.status === 'review' ? 'bg-purple-100 text-purple-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {task.status === 'todo' ? 'To Do' :
                         task.status === 'in-progress' ? 'In Progress' :
                         task.status === 'review' ? 'Review' :
                         task.status === 'completed' ? 'Completed' : 'Canceled'}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        task.priority === 'low' ? 'bg-blue-100 text-blue-800' : 
                        task.priority === 'medium' ? 'bg-green-100 text-green-800' :
                        task.priority === 'high' ? 'bg-amber-100 text-amber-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {task.dueDate ? format(new Date(task.dueDate), 'PP') : '-'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {task.tags.slice(0, 2).map((tag, index) => (
                        <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                          {tag}
                        </span>
                      ))}
                      {task.tags.length > 2 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                          +{task.tags.length - 2}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEditTask(task)}
                      >
                        Edit
                      </Button>
                      {task.status !== 'completed' && task.status !== 'canceled' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onChangeTaskStatus(task.id, 'completed')}
                        >
                          Complete
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
