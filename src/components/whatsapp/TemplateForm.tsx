
import { useState, useEffect } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { FormField, FormItem, FormLabel, FormControl, FormMessage, Form } from '@/components/ui/form';
import { PlusCircle, XCircle } from 'lucide-react';

const formSchema = z.object({
  name: z.string().min(2, 'Template name must be at least 2 characters'),
  subject: z.string().min(2, 'Subject must be at least 2 characters'),
  content: z.string().min(10, 'Message must be at least 10 characters'),
  variables: z.array(z.string())
});

type FormValues = z.infer<typeof formSchema>;

interface TemplateFormProps {
  initialValues?: {
    name: string;
    subject: string;
    content: string;
    variables: string[];
  };
  onSubmit: (values: FormValues) => void;
}

const TemplateForm = ({ initialValues, onSubmit }: TemplateFormProps) => {
  const [variables, setVariables] = useState<string[]>(initialValues?.variables || []);
  const [newVariable, setNewVariable] = useState('');

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialValues?.name || '',
      subject: initialValues?.subject || '',
      content: initialValues?.content || '',
      variables: initialValues?.variables || []
    }
  });

  useEffect(() => {
    form.setValue('variables', variables);
  }, [variables, form]);

  const handleAddVariable = () => {
    if (newVariable && !variables.includes(newVariable)) {
      setVariables([...variables, newVariable]);
      setNewVariable('');
    }
  };

  const handleRemoveVariable = (variable: string) => {
    setVariables(variables.filter(v => v !== variable));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddVariable();
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Template Name</FormLabel>
              <FormControl>
                <Input placeholder="E.g., Welcome Message" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="subject"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Subject Line</FormLabel>
              <FormControl>
                <Input placeholder="E.g., Welcome to our service" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Message Content</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Use {{variableName}} for personalization"
                  className="min-h-32"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-3">
          <Label>Template Variables</Label>
          <div className="flex gap-2">
            <Input 
              value={newVariable}
              onChange={(e) => setNewVariable(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Add variable (e.g., firstName)"
            />
            <Button 
              type="button" 
              onClick={handleAddVariable}
              disabled={!newVariable || variables.includes(newVariable)}
            >
              <PlusCircle className="h-4 w-4 mr-1" /> Add
            </Button>
          </div>

          <div className="flex flex-wrap gap-2 mt-2">
            {variables.map((variable, index) => (
              <div 
                key={index}
                className="bg-gray-100 rounded-full px-3 py-1 flex items-center text-sm"
              >
                {variable}
                <button 
                  type="button" 
                  className="ml-1 text-gray-500 hover:text-red-500"
                  onClick={() => handleRemoveVariable(variable)}
                >
                  <XCircle className="h-4 w-4" />
                </button>
              </div>
            ))}
            {variables.length === 0 && (
              <p className="text-sm text-gray-500">No variables added yet</p>
            )}
          </div>
        </div>

        <Button type="submit" className="w-full mt-4">
          Save Template
        </Button>
      </form>
    </Form>
  );
};

export default TemplateForm;
