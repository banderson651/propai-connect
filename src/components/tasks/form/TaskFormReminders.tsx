
import { useState } from "react";
import { FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, TrashIcon, CalendarIcon } from "lucide-react";
import { TaskReminder } from "@/types/task";
import { format } from "date-fns";
import { v4 as uuidv4 } from 'uuid';

interface TaskFormRemindersProps {
  reminders: TaskReminder[];
  setReminders: (reminders: TaskReminder[]) => void;
}

export const TaskFormReminders = ({ reminders, setReminders }: TaskFormRemindersProps) => {
  const addReminder = () => {
    const newReminder: TaskReminder = {
      id: uuidv4(), // Generate UUID for each new reminder
      time: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
      type: "notification"
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
  
  return (
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
            <div key={reminder.id} className="flex items-center gap-2 rounded-md border p-3">
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
  );
};
