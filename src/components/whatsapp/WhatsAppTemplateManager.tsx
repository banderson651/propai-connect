import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { PlusCircle, MessageSquare } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useWhatsApp, WhatsAppTemplate } from '@/contexts/WhatsAppContext';
import { NotConnectedState } from './NotConnectedState';
import { TemplateList } from './TemplateList';
import TemplateForm from './TemplateForm';

export const WhatsAppTemplateManager = () => {
  const { getTemplates, createTemplate, isConnected } = useWhatsApp();
  const { toast } = useToast();
  const [templates, setTemplates] = useState<WhatsAppTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    content: '',
    language: 'en_US',
    category: 'UTILITY',
    variables: [''] 
  });

  useEffect(() => {
    fetchTemplates();
  }, [isConnected]);

  const fetchTemplates = async () => {
    if (!isConnected) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const templateData = await getTemplates();
      setTemplates(templateData);
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast({
        title: 'Error',
        description: 'Failed to load message templates',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddVariable = () => {
    setNewTemplate(prev => ({
      ...prev,
      variables: [...prev.variables, '']
    }));
  };

  const handleVariableChange = (index: number, value: string) => {
    const updatedVariables = [...newTemplate.variables];
    updatedVariables[index] = value;
    
    setNewTemplate(prev => ({
      ...prev,
      variables: updatedVariables
    }));
  };

  const handleRemoveVariable = (index: number) => {
    const updatedVariables = newTemplate.variables.filter((_, i) => i !== index);
    
    setNewTemplate(prev => ({
      ...prev,
      variables: updatedVariables
    }));
  };

  const handleCreateTemplate = async () => {
    try {
      // Filter out empty variables
      const cleanedVariables = newTemplate.variables.filter(v => v.trim() !== '');
      
      const template = await createTemplate({
        ...newTemplate,
        variables: cleanedVariables
      });
      
      setTemplates(prev => [...prev, template]);
      setOpenDialog(false);
      
      // Reset form
      setNewTemplate({
        name: '',
        content: '',
        language: 'en_US',
        category: 'UTILITY',
        variables: ['']
      });
    } catch (error) {
      console.error('Error creating template:', error);
    }
  };

  if (!isConnected) {
    return <NotConnectedState />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Message Templates</h2>
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="w-4 h-4 mr-2" />
              Create Template
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create Message Template</DialogTitle>
              <DialogDescription>
                Templates need approval from Meta before they can be used. 
                Follow WhatsApp guidelines to increase chances of approval.
              </DialogDescription>
            </DialogHeader>
            
            <TemplateForm
              newTemplate={newTemplate}
              setNewTemplate={setNewTemplate}
              handleCreateTemplate={handleCreateTemplate}
              handleAddVariable={handleAddVariable}
              handleVariableChange={handleVariableChange}
              handleRemoveVariable={handleRemoveVariable}
              onClose={() => setOpenDialog(false)}
            />
          </DialogContent>
        </Dialog>
      </div>
      
      <TemplateList templates={templates} loading={loading} />
    </div>
  );
};
