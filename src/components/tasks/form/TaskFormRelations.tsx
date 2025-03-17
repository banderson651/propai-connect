
import { useState, useEffect } from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getContacts } from "@/services/contactService";
import { getProperties } from "@/services/propertyService";
import { getCampaigns } from "@/services/email/campaignService";
import { UseFormReturn } from "react-hook-form";
import { Task } from "@/types/task";

type TaskFormData = Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'reminders' | 'tags'>;

interface TaskFormRelationsProps {
  form: UseFormReturn<TaskFormData>;
}

export const TaskFormRelations = ({ form }: TaskFormRelationsProps) => {
  const [contacts, setContacts] = useState<{ id: string; name: string }[]>([]);
  const [properties, setProperties] = useState<{ id: string; title: string }[]>([]);
  const [campaigns, setCampaigns] = useState<{ id: string; name: string }[]>([]);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const contactsData = await getContacts();
        setContacts(contactsData.map(c => ({ 
          id: c.id, 
          name: `${c.firstName} ${c.lastName}` 
        })));
        
        const propertiesData = await getProperties();
        setProperties(propertiesData.map(p => ({ 
          id: p.id, 
          title: p.title 
        })));
        
        const campaignsData = await getCampaigns();
        setCampaigns(campaignsData.map(c => ({ 
          id: c.id, 
          name: c.name 
        })));
      } catch (error) {
        console.error("Error fetching relation data:", error);
      }
    };
    
    fetchData();
  }, []);
  
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
              value={field.value || ""}
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
              value={field.value || ""}
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
              value={field.value || ""}
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
