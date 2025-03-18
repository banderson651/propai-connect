
import { useState } from "react";
import { Task, TaskReminder } from "@/types/task";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { useQuery } from "@tanstack/react-query";
import { getProperties } from "@/services/propertyService";
import { getContacts } from "@/services/contactService";
import { getCampaigns } from "@/services/email/campaignService";

// Import component files
import { TaskFormBasicInfo } from "./form/TaskFormBasicInfo";
import { TaskFormDueDate } from "./form/TaskFormDueDate";
import { TaskFormTags } from "./form/TaskFormTags";
import { TaskFormReminders } from "./form/TaskFormReminders";
import { TaskFormRelations } from "./form/TaskFormRelations";
import { TaskFormActions } from "./form/TaskFormActions";

interface TaskFormProps {
  task?: Task;
  onSubmit: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

export const TaskForm = ({ task, onSubmit, onCancel }: TaskFormProps) => {
  const [tags, setTags] = useState<string[]>(task?.tags || []);
  const [reminders, setReminders] = useState<TaskReminder[]>(
    task?.reminders || []
  );
  
  const { data: properties = [] } = useQuery({
    queryKey: ['properties-for-task-form'],
    queryFn: () => getProperties(),
  });
  
  const { data: contacts = [] } = useQuery({
    queryKey: ['contacts-for-task-form'],
    queryFn: () => getContacts(),
  });
  
  const { data: campaigns = [] } = useQuery({
    queryKey: ['campaigns-for-task-form'],
    queryFn: () => getCampaigns(),
  });
  
  const form = useForm<Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'reminders' | 'tags'>>({
    defaultValues: {
      title: task?.title || "",
      description: task?.description || "",
      status: task?.status || "todo",
      priority: task?.priority || "medium",
      dueDate: task?.dueDate || undefined,
      assignedTo: task?.assignedTo || "current-user",
      createdBy: "current-user",
      relatedPropertyId: task?.relatedPropertyId || "_none",
      relatedContactId: task?.relatedContactId || "_none",
      relatedCampaignId: task?.relatedCampaignId || "_none",
      relatedAutomationId: task?.relatedAutomationId || undefined,
      completedAt: task?.completedAt || undefined
    },
  });
  
  const handleSubmit = form.handleSubmit((data) => {
    // Process form data before submission
    const taskData = {
      ...data,
      // Convert "_none" values to undefined
      relatedPropertyId: data.relatedPropertyId === "_none" ? undefined : data.relatedPropertyId,
      relatedContactId: data.relatedContactId === "_none" ? undefined : data.relatedContactId,
      relatedCampaignId: data.relatedCampaignId === "_none" ? undefined : data.relatedCampaignId,
      tags,
      reminders,
    };
    onSubmit(taskData);
  });
  
  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <TaskFormBasicInfo form={form} />
        <TaskFormDueDate form={form} />
        <TaskFormTags tags={tags} setTags={setTags} />
        <TaskFormReminders reminders={reminders} setReminders={setReminders} />
        <TaskFormRelations 
          form={form} 
          properties={properties} 
          contacts={contacts} 
          campaigns={campaigns} 
        />
        <TaskFormActions isEditing={!!task} onCancel={onCancel} />
      </form>
    </Form>
  );
};
