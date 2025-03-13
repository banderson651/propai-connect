
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAutomation, AutomationAction } from '@/contexts/AutomationContext';

const formSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  description: z.string().optional(),
  triggerType: z.enum(['email', 'lead', 'property', 'deadline']),
  triggerCondition: z.string().min(5, 'Please provide a detailed trigger condition'),
  isActive: z.boolean().default(true),
});

const NewRulePage = () => {
  const navigate = useNavigate();
  const { createRule } = useAutomation();
  const [actions, setActions] = useState<AutomationAction[]>([]);
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      triggerType: 'email',
      triggerCondition: '',
      isActive: true,
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (actions.length === 0) {
      form.setError('root', {
        message: 'Please add at least one action',
      });
      return;
    }

    setLoading(true);
    try {
      await createRule({
        name: values.name,
        description: values.description || '',
        triggerType: values.triggerType,
        triggerCondition: values.triggerCondition,
        actions,
        isActive: values.isActive,
      });
      navigate('/automation');
    } catch (error) {
      console.error('Error creating rule:', error);
    } finally {
      setLoading(false);
    }
  };

  // For this simple demo, we'll just use a placeholder for adding actions
  const addAction = () => {
    const newAction: AutomationAction = {
      id: `temp-${Date.now()}`,
      type: 'notification',
      details: {
        message: 'Send a notification to the agent',
      },
    };
    
    setActions([...actions, newAction]);
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Create Automation Rule</h1>
          <p className="text-muted-foreground">
            Set up a new rule to automate your workflow
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Rule Details</CardTitle>
                <CardDescription>Define the basic information for your rule</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rule Name</FormLabel>
                      <FormControl>
                        <Input placeholder="E.g., Follow-up reminder" {...field} />
                      </FormControl>
                      <FormDescription>
                        A clear name to identify this rule
                      </FormDescription>
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
                        <Textarea placeholder="Description of what this rule does" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Rule Status</FormLabel>
                        <FormDescription>
                          Activate or deactivate this rule
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Trigger</CardTitle>
                <CardDescription>Define when this rule should be activated</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="triggerType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Trigger Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a trigger type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="email">Email Interaction</SelectItem>
                          <SelectItem value="lead">Lead Activity</SelectItem>
                          <SelectItem value="property">Property Update</SelectItem>
                          <SelectItem value="deadline">Deadline</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        The type of event that will trigger this rule
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="triggerCondition"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Trigger Condition</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="E.g., If lead opens 3 emails but doesn't reply" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Describe the specific condition that will trigger this rule
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
                <CardDescription>Define what happens when the rule is triggered</CardDescription>
              </CardHeader>
              <CardContent>
                {actions.length === 0 ? (
                  <div className="text-center py-8 border rounded-lg">
                    <p className="text-muted-foreground mb-4">No actions added yet</p>
                    <Button type="button" onClick={addAction}>Add Action</Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {actions.map((action, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <h4 className="font-medium mb-2">Action {index + 1}: Send Notification</h4>
                        <p className="text-sm text-muted-foreground">{action.details.message}</p>
                      </div>
                    ))}
                    <Button type="button" variant="outline" onClick={addAction} className="w-full">
                      Add Another Action
                    </Button>
                  </div>
                )}
                {form.formState.errors.root && (
                  <p className="text-sm font-medium text-destructive mt-2">
                    {form.formState.errors.root.message}
                  </p>
                )}
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate('/automation')}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Creating...' : 'Create Rule'}
                </Button>
              </CardFooter>
            </Card>
          </form>
        </Form>
      </div>
    </DashboardLayout>
  );
};

export default NewRulePage;
