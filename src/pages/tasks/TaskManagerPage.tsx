import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { TaskList } from "@/components/tasks/TaskList";
import { TaskForm } from "@/components/tasks/TaskForm";
import { Task, TaskStatus } from "@/types/task";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getTasks, createTask, updateTask, deleteTask } from "@/services/taskService";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useLocation, useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
const TaskManagerPage = () => {
  const {
    toast
  } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | undefined>(undefined);
  const [activeTab, setActiveTab] = useState<string>("all");

  // Extract task ID from the URL if present
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const taskId = searchParams.get('id');
    if (taskId) {
      const fetchTask = async () => {
        const task = await getTasks().then(tasks => tasks.find(t => t.id === taskId));
        if (task) {
          setSelectedTask(task);
          setIsFormOpen(true);
        }
      };
      fetchTask();
    }
  }, [location]);
  const {
    data: tasks = [],
    isLoading
  } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => getTasks()
  });
  const createTaskMutation = useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['tasks']
      });
      toast({
        title: "Task created",
        description: "The task has been created successfully."
      });
      setIsFormOpen(false);
    },
    onError: error => {
      toast({
        title: "Error",
        description: `Failed to create task: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    }
  });
  const updateTaskMutation = useMutation({
    mutationFn: ({
      id,
      ...updates
    }: {
      id: string;
    } & Partial<Task>) => updateTask(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['tasks']
      });
      toast({
        title: "Task updated",
        description: "The task has been updated successfully."
      });
      setIsFormOpen(false);
      setSelectedTask(undefined);

      // Clear task ID from URL
      const searchParams = new URLSearchParams(location.search);
      searchParams.delete('id');
      navigate({
        search: searchParams.toString()
      });
    },
    onError: error => {
      toast({
        title: "Error",
        description: `Failed to update task: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    }
  });
  const deleteTaskMutation = useMutation({
    mutationFn: deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['tasks']
      });
      queryClient.invalidateQueries({
        queryKey: ['tasks-dashboard']
      });
      toast({
        title: "Task deleted",
        description: "The task has been deleted successfully."
      });
      setIsDeleteDialogOpen(false);
      setSelectedTask(undefined);

      // Clear task ID from URL
      const searchParams = new URLSearchParams(location.search);
      searchParams.delete('id');
      navigate({
        search: searchParams.toString()
      });
    },
    onError: error => {
      toast({
        title: "Error",
        description: `Failed to delete task: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    }
  });
  const handleCreateTask = () => {
    setSelectedTask(undefined);
    setIsFormOpen(true);
  };
  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setIsFormOpen(true);

    // Update URL with task ID
    const searchParams = new URLSearchParams(location.search);
    searchParams.set('id', task.id);
    navigate({
      search: searchParams.toString()
    });
  };
  const handleDeleteTask = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      setSelectedTask(task);
      setIsDeleteDialogOpen(true);
    }
  };
  const handleConfirmDelete = () => {
    if (selectedTask) {
      deleteTaskMutation.mutate(selectedTask.id);
    }
  };
  const handleChangeTaskStatus = (taskId: string, status: TaskStatus) => {
    updateTaskMutation.mutate({
      id: taskId,
      status
    });
  };
  const handleFormSubmit = (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (selectedTask) {
      updateTaskMutation.mutate({
        id: selectedTask.id,
        ...taskData
      });
    } else {
      createTaskMutation.mutate(taskData);
    }
  };
  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedTask(undefined);

    // Clear task ID from URL
    const searchParams = new URLSearchParams(location.search);
    searchParams.delete('id');
    navigate({
      search: searchParams.toString()
    });
  };

  // Filter tasks based on active tab
  const getFilteredTasks = () => {
    switch (activeTab) {
      case 'todo':
        return tasks.filter(task => task.status === 'todo');
      case 'in-progress':
        return tasks.filter(task => task.status === 'in-progress');
      case 'completed':
        return tasks.filter(task => task.status === 'completed');
      case 'high-priority':
        return tasks.filter(task => task.priority === 'high' || task.priority === 'urgent');
      case 'overdue':
        return tasks.filter(task => {
          if (!task.dueDate) return false;
          return new Date(task.dueDate) < new Date() && task.status !== 'completed' && task.status !== 'canceled';
        });
      case 'today':
        return tasks.filter(task => {
          if (!task.dueDate) return false;
          const taskDate = new Date(task.dueDate);
          const today = new Date();
          return taskDate.getDate() === today.getDate() && taskDate.getMonth() === today.getMonth() && taskDate.getFullYear() === today.getFullYear();
        });
      default:
        return tasks;
    }
  };
  return <DashboardLayout>
      <div className="container py-6 max-w-7xl">
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4 bg-slate-50">
            <TabsTrigger value="all" className="bg-sky-600 hover:bg-sky-500 text-slate-50">All Tasks</TabsTrigger>
            <TabsTrigger value="todo">To Do</TabsTrigger>
            <TabsTrigger value="in-progress">In Progress</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="high-priority">High Priority</TabsTrigger>
            <TabsTrigger value="overdue">Overdue</TabsTrigger>
            <TabsTrigger value="today">Due Today</TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab} className="mt-0">
            {isLoading ? <div className="flex justify-center items-center h-64">
                <p>Loading tasks...</p>
              </div> : <TaskList tasks={getFilteredTasks()} onEditTask={handleEditTask} onDeleteTask={handleDeleteTask} onChangeTaskStatus={handleChangeTaskStatus} onCreateTask={handleCreateTask} />}
          </TabsContent>
        </Tabs>
        
        <Dialog open={isFormOpen} onOpenChange={handleCloseForm}>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedTask ? "Edit Task" : "Create Task"}</DialogTitle>
            </DialogHeader>
            <TaskForm task={selectedTask} onSubmit={handleFormSubmit} onCancel={handleCloseForm} />
          </DialogContent>
        </Dialog>
        
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete the task "{selectedTask?.title}".
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmDelete}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>;
};
export default TaskManagerPage;