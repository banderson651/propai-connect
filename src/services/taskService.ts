
import { v4 as uuidv4 } from 'uuid';
import { Task, TaskStatus, TaskPriority, TaskReminder } from '@/types/task';

// Mock data for tasks
const mockTasks: Task[] = [
  {
    id: "task-1",
    title: "Follow up with John Smith about property listing",
    description: "Need to discuss pricing and availability for the downtown condo",
    status: "todo",
    priority: "high",
    dueDate: new Date(Date.now() + 86400000 * 2).toISOString(), // 2 days from now
    assignedTo: "current-user",
    createdBy: "current-user",
    createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
    relatedContactId: "contact-1",
    relatedPropertyId: "property-2",
    reminders: [
      {
        id: "reminder-1",
        time: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
        type: "notification"
      }
    ],
    tags: ["follow-up", "high-value"]
  },
  {
    id: "task-2",
    title: "Prepare email campaign for new listings",
    description: "Create email template and select target audience for the new properties in the east side",
    status: "in-progress",
    priority: "medium",
    dueDate: new Date(Date.now() + 86400000 * 1).toISOString(), // 1 day from now
    assignedTo: "current-user",
    createdBy: "current-user",
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(), // 3 days ago
    updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    relatedCampaignId: "campaign-1",
    reminders: [],
    tags: ["marketing", "email"]
  },
  {
    id: "task-3",
    title: "Schedule property viewing with interested buyers",
    description: "Coordinate with the owner for showing the beachfront property to 3 potential buyers",
    status: "completed",
    priority: "high",
    dueDate: new Date(Date.now() - 86400000 * 1).toISOString(), // 1 day ago
    assignedTo: "current-user",
    createdBy: "current-user",
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(), // 5 days ago
    updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    completedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    relatedPropertyId: "property-5",
    relatedContactId: "contact-3",
    reminders: [],
    tags: ["viewing", "closed"]
  }
];

// Get all tasks
export const getTasks = async (filters?: {
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string;
  assignedTo?: string;
  relatedPropertyId?: string;
  relatedContactId?: string;
  relatedCampaignId?: string;
  relatedAutomationId?: string;
}): Promise<Task[]> => {
  let filteredTasks = [...mockTasks];
  
  if (filters) {
    if (filters.status) {
      filteredTasks = filteredTasks.filter(task => task.status === filters.status);
    }
    if (filters.priority) {
      filteredTasks = filteredTasks.filter(task => task.priority === filters.priority);
    }
    if (filters.dueDate) {
      filteredTasks = filteredTasks.filter(task => {
        if (!task.dueDate) return false;
        const taskDate = new Date(task.dueDate).toDateString();
        const filterDate = new Date(filters.dueDate!).toDateString();
        return taskDate === filterDate;
      });
    }
    if (filters.assignedTo) {
      filteredTasks = filteredTasks.filter(task => task.assignedTo === filters.assignedTo);
    }
    if (filters.relatedPropertyId) {
      filteredTasks = filteredTasks.filter(task => task.relatedPropertyId === filters.relatedPropertyId);
    }
    if (filters.relatedContactId) {
      filteredTasks = filteredTasks.filter(task => task.relatedContactId === filters.relatedContactId);
    }
    if (filters.relatedCampaignId) {
      filteredTasks = filteredTasks.filter(task => task.relatedCampaignId === filters.relatedCampaignId);
    }
    if (filters.relatedAutomationId) {
      filteredTasks = filteredTasks.filter(task => task.relatedAutomationId === filters.relatedAutomationId);
    }
  }
  
  return Promise.resolve(filteredTasks);
};

// Get task by ID
export const getTaskById = async (id: string): Promise<Task | undefined> => {
  const task = mockTasks.find(t => t.id === id);
  return Promise.resolve(task);
};

// Create a new task
export const createTask = async (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> => {
  const newTask: Task = {
    ...task,
    id: uuidv4(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  mockTasks.push(newTask);
  return Promise.resolve(newTask);
};

// Update an existing task
export const updateTask = async (id: string, updates: Partial<Omit<Task, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Task | undefined> => {
  const index = mockTasks.findIndex(t => t.id === id);
  if (index === -1) return Promise.resolve(undefined);
  
  // If the task is being marked as completed, add completedAt timestamp
  if (updates.status === 'completed' && mockTasks[index].status !== 'completed') {
    updates.completedAt = new Date().toISOString();
  }
  
  // If the task is being marked as not completed, remove completedAt
  if (updates.status && updates.status !== 'completed') {
    updates.completedAt = undefined;
  }
  
  mockTasks[index] = {
    ...mockTasks[index],
    ...updates,
    updatedAt: new Date().toISOString()
  };
  
  return Promise.resolve(mockTasks[index]);
};

// Delete a task
export const deleteTask = async (id: string): Promise<boolean> => {
  const index = mockTasks.findIndex(t => t.id === id);
  if (index === -1) return Promise.resolve(false);
  
  mockTasks.splice(index, 1);
  return Promise.resolve(true);
};

// Add a reminder to a task
export const addTaskReminder = async (taskId: string, reminder: Omit<TaskReminder, 'id'>): Promise<TaskReminder | undefined> => {
  const task = mockTasks.find(t => t.id === taskId);
  if (!task) return Promise.resolve(undefined);
  
  const newReminder: TaskReminder = {
    ...reminder,
    id: uuidv4()
  };
  
  task.reminders.push(newReminder);
  task.updatedAt = new Date().toISOString();
  
  return Promise.resolve(newReminder);
};

// Remove a reminder from a task
export const removeTaskReminder = async (taskId: string, reminderId: string): Promise<boolean> => {
  const task = mockTasks.find(t => t.id === taskId);
  if (!task) return Promise.resolve(false);
  
  const initialLength = task.reminders.length;
  task.reminders = task.reminders.filter(r => r.id !== reminderId);
  task.updatedAt = new Date().toISOString();
  
  return Promise.resolve(task.reminders.length < initialLength);
};
