
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export type TaskStatus = 'todo' | 'in-progress' | 'review' | 'completed' | 'canceled';

export interface TaskReminder {
  id: string;
  time: string;
  type: 'email' | 'notification' | 'whatsapp';
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  assignedTo?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  relatedPropertyId?: string;
  relatedContactId?: string;
  relatedCampaignId?: string;
  relatedAutomationId?: string;
  reminders: TaskReminder[];
  tags: string[];
  completedAt?: string;
}
