
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { PlusCircle, Edit, Trash2, MessageSquare, MoreHorizontal, Copy, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useWhatsApp, WhatsAppTemplate } from '@/contexts/WhatsAppContext';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <Badge variant="outline" className="text-green-600 bg-green-50 hover:bg-green-100 border-green-200">
            <CheckCircle2 className="w-3 h-3 mr-1" /> Approved
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="outline" className="text-yellow-600 bg-yellow-50 hover:bg-yellow-100 border-yellow-200">
            <Clock className="w-3 h-3 mr-1" /> Pending Review
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="outline" className="text-red-600 bg-red-50 hover:bg-red-100 border-red-200">
            <AlertCircle className="w-3 h-3 mr-1" /> Rejected
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Message Templates</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-10">
          <p className="text-muted-foreground mb-4">
            Connect your WhatsApp Business account first to manage message templates
          </p>
          <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto opacity-50" />
        </CardContent>
      </Card>
    );
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
            
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="template-name">Template Name</Label>
                  <Input
                    id="template-name"
                    value={newTemplate.name}
                    onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g. welcome_message"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="template-category">Category</Label>
                  <Select 
                    value={newTemplate.category}
                    onValueChange={(value) => setNewTemplate(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTILITY">Utility</SelectItem>
                      <SelectItem value="MARKETING">Marketing</SelectItem>
                      <SelectItem value="AUTHENTICATION">Authentication</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="template-language">Language</Label>
                <Select 
                  value={newTemplate.language}
                  onValueChange={(value) => setNewTemplate(prev => ({ ...prev, language: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en_US">English (US)</SelectItem>
                    <SelectItem value="es_ES">Spanish (Spain)</SelectItem>
                    <SelectItem value="pt_BR">Portuguese (Brazil)</SelectItem>
                    <SelectItem value="fr_FR">French</SelectItem>
                    <SelectItem value="de_DE">German</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="template-content">Template Content</Label>
                <Textarea
                  id="template-content"
                  value={newTemplate.content}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Hello {{1}}, welcome to our service!"
                  rows={4}
                />
                <p className="text-xs text-muted-foreground">
                  Use {{1}}, {{2}}, etc. as placeholders for variables
                </p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Variables</Label>
                  <Button type="button" variant="outline" size="sm" onClick={handleAddVariable}>
                    Add Variable
                  </Button>
                </div>
                
                <div className="space-y-2">
                  {newTemplate.variables.map((variable, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={variable}
                        onChange={(e) => handleVariableChange(index, e.target.value)}
                        placeholder={`Variable ${index + 1} (e.g. name)`}
                      />
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="icon"
                        onClick={() => handleRemoveVariable(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpenDialog(false)}>Cancel</Button>
              <Button onClick={handleCreateTemplate} disabled={!newTemplate.name || !newTemplate.content}>
                Create Template
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      {loading ? (
        <div className="text-center py-10">
          <p>Loading templates...</p>
        </div>
      ) : templates.length === 0 ? (
        <Card>
          <CardContent className="text-center py-10">
            <p className="text-muted-foreground mb-4">
              No message templates found. Create your first template to get started.
            </p>
            <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto opacity-50" />
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {templates.map((template) => (
            <Card key={template.id}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-base font-medium">{template.name}</CardTitle>
                  <div className="flex items-center">
                    {getStatusBadge(template.status)}
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-40 p-0" align="end">
                        <div className="flex flex-col">
                          <Button variant="ghost" className="justify-start h-9 px-2 py-1">
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                          <Button variant="ghost" className="justify-start h-9 px-2 py-1">
                            <Copy className="h-4 w-4 mr-2" />
                            Duplicate
                          </Button>
                          <Button variant="ghost" className="justify-start h-9 px-2 py-1 text-red-600 hover:text-red-600 hover:bg-red-50">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </Button>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700 whitespace-pre-wrap mb-3">{template.content}</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  <Badge variant="secondary" className="text-xs">
                    {template.language.split('_')[0].toUpperCase()}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    {template.category}
                  </Badge>
                  {template.variables.map((variable, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {variable}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
