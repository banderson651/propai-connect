
import { useEffect, useState } from "react";
import { Task, TaskPriority, TaskStatus, TaskReminder } from "@/types/task";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { 
  Popover, 
  PopoverTrigger, 
  PopoverContent 
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { format } from "date-fns";
import { CalendarIcon, PlusCircle, TrashIcon, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { getProperties } from "@/services/propertyService";
import { getContacts } from "@/services/contactService";
import { getCampaigns } from "@/services/email/campaignService";

interface TaskFormProps {
  task?: Task;
  onSubmit: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

export const TaskForm = ({ task, onSubmit, onCancel }: TaskFormProps) => {
  const { toast } = useToast();
  const [tags, setTags] = useState<string[]>(task?.tags || []);
  const [tagInput, setTagInput] = useState<string>("");
  const [reminders, setReminders] = useState<Omit<TaskReminder, 'id'>[]>(
    task?.reminders.map(r => ({ time: r.time, type: r.type })) || []
  );
  
  const { data: properties = [] } = useQuery({
    queryKey: ['properties-for-task-form'],
    queryFn: () => getProperties({}),
  });
  
  const { data: contacts = [] } = useQuery({
    queryKey: ['contacts-for-task-form'],
    queryFn: () => getContacts({}),
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
      relatedPropertyId: task?.relatedPropertyId || undefined,
      relatedContactId: task?.relatedContactId || undefined,
      relatedCampaignId: task?.relatedCampaignId || undefined,
      relatedAutomationId: task?.relatedAutomationId || undefined,
      completedAt: task?.completedAt || undefined
    },
  });
  
  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };
  
  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };
  
  const addReminder = () => {
    const newReminder = {
      time: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
      type: "notification" as const
    };
    setReminders([...reminders, newReminder]);
  };
  
  const updateReminder = (index: number, field: keyof Omit<TaskReminder, 'id'>, value: any) => {
    const updatedReminders = [...reminders];
    updatedReminders[index] = { ...updatedReminders[index], [field]: value };
    setReminders(updatedReminders);
  };
  
  const removeReminder = (index: number) => {
    setReminders(reminders.filter((_, i) => i !== index));
  };
  
  const handleSubmit = form.handleSubmit((data) => {
    const taskData = {
      ...data,
      tags,
      reminders,
    };
    onSubmit(taskData);
  });
  
  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Task Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter task title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter task description"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="todo">To Do</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="review">Review</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="canceled">Canceled</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="priority"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Priority</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="dueDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Due Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={`w-full pl-3 text-left font-normal ${
                        !field.value ? "text-muted-foreground" : ""
                      }`}
                    >
                      {field.value ? (
                        format(new Date(field.value), "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value ? new Date(field.value) : undefined}
                    onSelect={(date) => field.onChange(date?.toISOString())}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="space-y-2">
          <FormLabel>Tags</FormLabel>
          <div className="flex flex-wrap gap-2 mb-2">
            {tags.map((tag, index) => (
              <Badge key={index} variant="secondary" className="flex items-center gap-1">
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
          <div className="flex">
            <Input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              placeholder="Add a tag"
              className="mr-2"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addTag();
                }
              }}
            />
            <Button type="button" onClick={addTag} size="sm">
              Add
            </Button>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <FormLabel>Reminders</FormLabel>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addReminder}
              className="flex items-center"
            >
              <PlusCircle className="h-4 w-4 mr-1" />
              Add Reminder
            </Button>
          </div>
          
          {reminders.length === 0 ? (
            <div className="text-sm text-gray-500 italic py-2">
              No reminders set. Add one to get notified.
            </div>
          ) : (
            <div className="space-y-2">
              {reminders.map((reminder, index) => (
                <div key={index} className="flex items-center gap-2 rounded-md border p-3">
                  <Select
                    value={reminder.type}
                    onValueChange={(value) => updateReminder(index, 'type', value)}
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="notification">Notification</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="whatsapp">WhatsApp</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="flex-1">
                        {format(new Date(reminder.time), "PPP p")}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={new Date(reminder.time)}
                        onSelect={(date) => {
                          if (date) {
                            const currentTime = new Date(reminder.time);
                            date.setHours(currentTime.getHours());
                            date.setMinutes(currentTime.getMinutes());
                            updateReminder(index, 'time', date.toISOString());
                          }
                        }}
                        initialFocus
                      />
                      <div className="p-3 border-t">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Time:</span>
                          <Input
                            type="time"
                            className="w-auto"
                            value={format(new Date(reminder.time), "HH:mm")}
                            onChange={(e) => {
                              const [hours, minutes] = e.target.value.split(':');
                              const date = new Date(reminder.time);
                              date.setHours(parseInt(hours));
                              date.setMinutes(parseInt(minutes));
                              updateReminder(index, 'time', date.toISOString());
                            }}
                          />
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                  
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeReminder(index)}
                  >
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="space-y-4">
          <FormLabel>Connect to</FormLabel>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="relatedPropertyId"
              render={({ field }) => (
                <FormItem>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select property" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {properties.map((property) => (
                        <SelectItem key={property.id} value={property.id}>
                          {property.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="relatedContactId"
              render={({ field }) => (
                <FormItem>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select contact" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {contacts.map((contact) => (
                        <SelectItem key={contact.id} value={contact.id}>
                          {contact.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="relatedCampaignId"
              render={({ field }) => (
                <FormItem>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select campaign" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {campaigns.map((campaign) => (
                        <SelectItem key={campaign.id} value={campaign.id}>
                          {campaign.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        
        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            {task ? "Update Task" : "Create Task"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
