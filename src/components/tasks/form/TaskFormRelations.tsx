
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { Task } from "@/types/task";
import { Contact } from "@/types/contact";

type TaskFormData = Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'reminders' | 'tags'>;

interface TaskFormRelationsProps {
  form: UseFormReturn<TaskFormData>;
  properties: { id: string; title: string }[];
  contacts: Contact[];
  campaigns: { id: string; name: string }[];
}

export const TaskFormRelations = ({ form, properties, contacts, campaigns }: TaskFormRelationsProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Related Items</h3>
      
      <FormField
        control={form.control}
        name="relatedContactId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Related Contact</FormLabel>
            <Select 
              onValueChange={field.onChange} 
              value={field.value}
              defaultValue="_none"
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select a contact" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="_none">None</SelectItem>
                {contacts.map(contact => (
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
        name="relatedPropertyId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Related Property</FormLabel>
            <Select 
              onValueChange={field.onChange} 
              value={field.value}
              defaultValue="_none"
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select a property" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="_none">None</SelectItem>
                {properties.map(property => (
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
        name="relatedCampaignId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Related Campaign</FormLabel>
            <Select 
              onValueChange={field.onChange} 
              value={field.value}
              defaultValue="_none"
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select a campaign" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="_none">None</SelectItem>
                {campaigns.map(campaign => (
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
  );
};
