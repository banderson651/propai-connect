
import { supabase } from '@/lib/supabase';
import { Task, TaskStatus, TaskPriority, TaskReminder } from '@/types/task';

// Get all tasks for the current user
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
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!user) throw new Error('User not authenticated');

    let query = supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (filters) {
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.priority) {
        query = query.eq('priority', filters.priority);
      }
      if (filters.dueDate) {
        const filterDate = new Date(filters.dueDate).toISOString().split('T')[0];
        query = query.gte('due_date', filterDate).lt('due_date', filterDate + 'T23:59:59.999Z');
      }
      if (filters.assignedTo) {
        query = query.eq('assigned_to', filters.assignedTo);
      }
      if (filters.relatedPropertyId) {
        query = query.eq('related_property_id', filters.relatedPropertyId);
      }
      if (filters.relatedContactId) {
        query = query.eq('related_contact_id', filters.relatedContactId);
      }
      if (filters.relatedCampaignId) {
        query = query.eq('related_campaign_id', filters.relatedCampaignId);
      }
      if (filters.relatedAutomationId) {
        query = query.eq('related_automation_id', filters.relatedAutomationId);
      }
    }

    const { data, error } = await query;

    if (error) throw error;

    const tasksData = data ?? [];

    return tasksData.map(task => ({
      ...task,
      dueDate: task.due_date,
      assignedTo: task.assigned_to,
      createdBy: task.created_by,
      createdAt: task.created_at,
      updatedAt: task.updated_at,
      relatedPropertyId: task.related_property_id,
      relatedContactId: task.related_contact_id,
      relatedCampaignId: task.related_campaign_id,
      relatedAutomationId: task.related_automation_id,
      completedAt: task.completed_at,
      reminders: task.reminders || []
    })) as Task[];
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return [];
  }
};

// Get task by ID
export const getTaskById = async (id: string): Promise<Task | undefined> => {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) throw error;
    if (!data) return undefined;

    return {
      ...data,
      dueDate: data.due_date,
      assignedTo: data.assigned_to,
      createdBy: data.created_by,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      relatedPropertyId: data.related_property_id,
      relatedContactId: data.related_contact_id,
      relatedCampaignId: data.related_campaign_id,
      relatedAutomationId: data.related_automation_id,
      completedAt: data.completed_at,
      reminders: data.reminders || []
    } as Task;
  } catch (error) {
    console.error('Error fetching task:', error);
    return undefined;
  }
};

// Create a new task
export const createTask = async (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> => {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('tasks')
      .insert({
        user_id: user.id,
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        due_date: task.dueDate,
        assigned_to: task.assignedTo,
        created_by: task.createdBy,
        related_property_id: task.relatedPropertyId,
        related_contact_id: task.relatedContactId,
        related_campaign_id: task.relatedCampaignId,
        related_automation_id: task.relatedAutomationId,
        reminders: task.reminders,
        tags: task.tags,
        completed_at: task.completedAt
      })
      .select()
      .single();

    if (error) throw error;

    return {
      ...data,
      dueDate: data.due_date,
      assignedTo: data.assigned_to,
      createdBy: data.created_by,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      relatedPropertyId: data.related_property_id,
      relatedContactId: data.related_contact_id,
      relatedCampaignId: data.related_campaign_id,
      relatedAutomationId: data.related_automation_id,
      completedAt: data.completed_at,
      reminders: data.reminders || []
    } as Task;
  } catch (error) {
    console.error('Error creating task:', error);
    throw error;
  }
};

// Update an existing task
export const updateTask = async (id: string, updates: Partial<Omit<Task, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Task | undefined> => {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!user) throw new Error('User not authenticated');

    const updateData: any = {};

    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.priority !== undefined) updateData.priority = updates.priority;
    if (updates.dueDate !== undefined) updateData.due_date = updates.dueDate;
    if (updates.assignedTo !== undefined) updateData.assigned_to = updates.assignedTo;
    if (updates.createdBy !== undefined) updateData.created_by = updates.createdBy;
    if (updates.relatedPropertyId !== undefined) updateData.related_property_id = updates.relatedPropertyId;
    if (updates.relatedContactId !== undefined) updateData.related_contact_id = updates.relatedContactId;
    if (updates.relatedCampaignId !== undefined) updateData.related_campaign_id = updates.relatedCampaignId;
    if (updates.relatedAutomationId !== undefined) updateData.related_automation_id = updates.relatedAutomationId;
    if (updates.reminders !== undefined) updateData.reminders = updates.reminders;
    if (updates.tags !== undefined) updateData.tags = updates.tags;
    if (updates.completedAt !== undefined) updateData.completed_at = updates.completedAt;

    // If the task is being marked as completed, add completedAt timestamp
    if (updates.status === 'completed') {
      updateData.completed_at = new Date().toISOString();
    }

    // If the task is being marked as not completed, remove completedAt
    if (updates.status && updates.status !== 'completed') {
      updateData.completed_at = null;
    }

    const { data, error } = await supabase
      .from('tasks')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;

    return {
      ...data,
      dueDate: data.due_date,
      assignedTo: data.assigned_to,
      createdBy: data.created_by,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      relatedPropertyId: data.related_property_id,
      relatedContactId: data.related_contact_id,
      relatedCampaignId: data.related_campaign_id,
      relatedAutomationId: data.related_automation_id,
      completedAt: data.completed_at,
      reminders: data.reminders || []
    } as Task;
  } catch (error) {
    console.error('Error updating task:', error);
    return undefined;
  }
};

// Delete a task
export const deleteTask = async (id: string): Promise<boolean> => {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting task:', error);
    return false;
  }
};

// Add a reminder to a task
export const addTaskReminder = async (taskId: string, reminder: Omit<TaskReminder, 'id'>): Promise<TaskReminder | undefined> => {
  try {
    // First get the current task
    const task = await getTaskById(taskId);
    if (!task) return undefined;

    const newReminder: TaskReminder = {
      ...reminder,
      id: crypto.randomUUID()
    };

    const updatedReminders = [...task.reminders, newReminder];

    const updatedTask = await updateTask(taskId, { reminders: updatedReminders });
    if (!updatedTask) return undefined;

    return newReminder;
  } catch (error) {
    console.error('Error adding task reminder:', error);
    return undefined;
  }
};

// Remove a reminder from a task
export const removeTaskReminder = async (taskId: string, reminderId: string): Promise<boolean> => {
  try {
    const task = await getTaskById(taskId);
    if (!task) return false;

    const updatedReminders = task.reminders.filter(r => r.id !== reminderId);
    const updatedTask = await updateTask(taskId, { reminders: updatedReminders });

    return !!updatedTask;
  } catch (error) {
    console.error('Error removing task reminder:', error);
    return false;
  }
};
