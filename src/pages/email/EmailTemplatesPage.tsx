import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { supabase } from '@/lib/supabase';
import { Loader2, Plus, Pencil, Trash2, Eye, Code, FileText } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { getSampleTemplates } from '@/services/emailService';

interface EmailTemplate {
  id: string;
  name: string;
  description?: string;
  html_content: string;
  thumbnail_url?: string;
  created_at: string;
  updated_at: string;
  is_system: boolean;
}

const EmailTemplatesPage = () => {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Template dialog state
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [templateHtml, setTemplateHtml] = useState('');
  const [savingTemplate, setSavingTemplate] = useState(false);
  
  // Preview dialog state
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<EmailTemplate | null>(null);
  
  // Delete confirmation dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<EmailTemplate | null>(null);
  const [deleting, setDeleting] = useState(false);
  
  // Tab state for template editor
  const [editorTab, setEditorTab] = useState('visual');

  // Fetch templates from the database
  useEffect(() => {
    const fetchTemplates = async () => {
      setLoading(true);
      setError(null);
      try {
        // Check if the table exists
        const { error: tableError } = await supabase
          .from('email_templates')
          .select('count')
          .limit(1);
        
        if (tableError && tableError.message.includes('does not exist')) {
          // Create the table using our SQL script
          await createEmailTemplatesTable();
        }
        
        // Fetch templates
        const { data, error } = await supabase
          .from('email_templates')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        // Combine with sample templates
        const sampleTemplates = await getSampleTemplates();
        
        // Add database templates if they exist
        if (data && data.length > 0) {
          // Filter out any database templates that have the same ID as sample templates
          const filteredData = data.filter(
            dbTemplate => !sampleTemplates.some(sample => sample.id === dbTemplate.id)
          );
          setTemplates([...sampleTemplates, ...filteredData]);
        } else {
          setTemplates(sampleTemplates);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch templates');
        console.error('Error fetching templates:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTemplates();
  }, []);

  // Create email_templates table if it doesn't exist
  const createEmailTemplatesTable = async () => {
    try {
      console.log('Attempting to create email_templates table...');
      
      // Create the table with a simple insert first
      const { error: createError } = await supabase
        .from('email_templates')
        .insert({
          name: 'Template Initialization',
          content: '<div>Initializing email templates table</div>'
        });
      
      if (createError && !createError.message.includes('already exists')) {
        console.error('Error creating email_templates table:', createError);
        
        // Try a different approach - use the REST API to create the table
        const { data, error } = await supabase.rpc('create_email_templates_table', {});
        
        if (error) {
          console.error('Failed to create table via RPC:', error);
          throw new Error('Could not create email templates table. Please contact support.');
        }
      }
      
      console.log('Email templates table created or already exists');
      return true;
    } catch (err) {
      console.error('Error in createEmailTemplatesTable:', err);
      throw err;
    }
  };

  // Open template dialog for creating a new template
  const handleNewTemplate = () => {
    setEditingTemplate(null);
    setTemplateName('');
    setTemplateDescription('');
    setTemplateHtml('<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0;">\n  <h2 style="color: #2c3e50;">Your Template Title</h2>\n  <p style="color: #7f8c8d;">Subtitle or description</p>\n  \n  <p style="margin: 15px 0;">Hello {{contact.firstName}},</p>\n  \n  <p style="margin: 15px 0;">Your email content goes here...</p>\n  \n  <div style="text-align: center; margin-top: 20px;">\n    <a href="#" style="display: inline-block; background-color: #3498db; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Call to Action</a>\n  </div>\n</div>');
    setEditorTab('visual');
    setTemplateDialogOpen(true);
  };

  // Open template dialog for editing an existing template
  const handleEditTemplate = (template: EmailTemplate) => {
    setEditingTemplate(template);
    setTemplateName(template.name);
    setTemplateDescription(template.description || '');
    setTemplateHtml(template.html_content);
    setEditorTab('visual');
    setTemplateDialogOpen(true);
  };

  // Open preview dialog
  const handlePreviewTemplate = (template: EmailTemplate) => {
    setPreviewTemplate(template);
    setPreviewDialogOpen(true);
  };

  // Open delete confirmation dialog
  const handleDeleteClick = (template: EmailTemplate) => {
    setTemplateToDelete(template);
    setDeleteDialogOpen(true);
  };

  // Save template to database
  const handleSaveTemplate = async () => {
    if (!templateName || !templateHtml) {
      toast({
        title: "Error",
        description: "Template name and HTML content are required",
        variant: "destructive"
      });
      return;
    }
    
    setSavingTemplate(true);
    try {
      // First, let's check the table structure to see what columns actually exist
      const { error: metadataError } = await supabase
        .from('email_templates')
        .select('*')
        .limit(1);
      
      if (metadataError && metadataError.message.includes('does not exist')) {
        // Table doesn't exist, we need to create it
        await createEmailTemplatesTable();
        toast({
          title: "Table Created",
          description: "The email templates table has been created. Please try saving again."
        });
        setSavingTemplate(false);
        return;
      }
      
      // Try to determine the correct column name for HTML content
      let htmlContentColumn = 'html_content';
      let descriptionColumn = 'description';
      
      // Prepare template data with potential column name variations
      const templateData: any = {
        name: templateName,
        updated_at: new Date().toISOString(),
        is_system: false
      };
      
      // Add HTML content with potential column names
      templateData[htmlContentColumn] = templateHtml;
      
      // Only add description if it's not empty
      if (templateDescription) {
        templateData[descriptionColumn] = templateDescription;
      }
      
      if (editingTemplate && !editingTemplate.is_system) {
        // Update existing template
        let updateResult = await supabase
          .from('email_templates')
          .update(templateData)
          .eq('id', editingTemplate.id);
          
        if (updateResult.error) {
          console.error('First update attempt error:', updateResult.error);
          
          // Try alternative column names if needed
          if (updateResult.error.message.includes('column "html_content" does not exist')) {
            // Try 'content' as an alternative column name
            delete templateData.html_content;
            templateData.content = templateHtml;
            
            updateResult = await supabase
              .from('email_templates')
              .update(templateData)
              .eq('id', editingTemplate.id);
          }
          
          // Handle description column error
          if (updateResult.error && updateResult.error.message.includes('column "description" does not exist')) {
            delete templateData.description;
            
            updateResult = await supabase
              .from('email_templates')
              .update(templateData)
              .eq('id', editingTemplate.id);
          }
          
          if (updateResult.error) {
            throw updateResult.error;
          }
        }
        
        // Update local state
        setTemplates(templates.map(t => 
          t.id === editingTemplate.id 
            ? { 
                ...t, 
                name: templateName, 
                description: templateDescription, 
                html_content: templateHtml,
                updated_at: new Date().toISOString()
              } 
            : t
        ));
        
        toast({
          title: "Success",
          description: "Template updated successfully"
        });
      } else {
        // Create new template
        let insertResult = await supabase
          .from('email_templates')
          .insert(templateData)
          .select()
          .single();
          
        if (insertResult.error) {
          console.error('First insert attempt error:', insertResult.error);
          
          // Try alternative column names if needed
          if (insertResult.error.message.includes('column "html_content" does not exist')) {
            // Try 'content' as an alternative column name
            delete templateData.html_content;
            templateData.content = templateHtml;
            
            insertResult = await supabase
              .from('email_templates')
              .insert(templateData)
              .select()
              .single();
          }
          
          // Handle description column error
          if (insertResult.error && insertResult.error.message.includes('column "description" does not exist')) {
            delete templateData.description;
            
            insertResult = await supabase
              .from('email_templates')
              .insert(templateData)
              .select()
              .single();
          }
          
          if (insertResult.error) {
            throw insertResult.error;
          }
        }
        
        if (insertResult.data) {
          // Add to local state with our expected structure
          const newTemplate = {
            ...insertResult.data,
            description: templateDescription,
            html_content: templateHtml
          };
          setTemplates([newTemplate, ...templates]);
        }
        
        toast({
          title: "Success",
          description: "Template created successfully"
        });
      }
      
      // Close dialog
      setTemplateDialogOpen(false);
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to save template",
        variant: "destructive"
      });
      console.error('Error saving template:', err);
    } finally {
      setSavingTemplate(false);
    }
  };

  // Delete template from database
  const handleDeleteTemplate = async () => {
    if (!templateToDelete || templateToDelete.is_system) return;
    
    setDeleting(true);
    try {
      const { error } = await supabase
        .from('email_templates')
        .delete()
        .eq('id', templateToDelete.id);
        
      if (error) throw error;
      
      // Update local state
      setTemplates(templates.filter(t => t.id !== templateToDelete.id));
      
      toast({
        title: "Success",
        description: "Template deleted successfully"
      });
      
      // Close dialog
      setDeleteDialogOpen(false);
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to delete template",
        variant: "destructive"
      });
      console.error('Error deleting template:', err);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="py-8 px-4 md:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Email Templates</h1>
          <Button onClick={handleNewTemplate} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create Template
          </Button>
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}
        
        <Card>
          <CardHeader>
            <CardTitle>Templates</CardTitle>
            <CardDescription>
              Manage your email templates for campaigns
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : templates.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 mx-auto text-gray-400" />
                <p className="mt-2 text-gray-500">No templates found</p>
                <Button onClick={handleNewTemplate} variant="outline" className="mt-4">
                  Create Your First Template
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {templates.map(template => (
                  <div key={template.id} className="border rounded-lg overflow-hidden">
                    <div className="h-48 bg-gradient-to-r from-gray-50 to-gray-100 flex items-center justify-center">
                      {template.thumbnail_url ? (
                        <img 
                          src={template.thumbnail_url} 
                          alt={template.name} 
                          className="max-h-full max-w-full object-contain"
                        />
                      ) : (
                        <div className="text-center p-4">
                          <FileText className="h-12 w-12 mx-auto text-gray-400" />
                          <p className="mt-2 text-sm text-gray-500">No preview</p>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium flex items-center gap-2">
                        {template.name}
                        {template.is_system && (
                          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded">
                            System
                          </span>
                        )}
                      </h3>
                      {template.description && (
                        <p className="text-sm text-gray-500 mt-1">{template.description}</p>
                      )}
                      <div className="flex mt-4 gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handlePreviewTemplate(template)}
                          className="flex items-center gap-1"
                        >
                          <Eye className="h-3 w-3" />
                          Preview
                        </Button>
                        {!template.is_system && (
                          <>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleEditTemplate(template)}
                              className="flex items-center gap-1"
                            >
                              <Pencil className="h-3 w-3" />
                              Edit
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleDeleteClick(template)}
                              className="flex items-center gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-3 w-3" />
                              Delete
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Template Editor Dialog */}
      <Dialog open={templateDialogOpen} onOpenChange={setTemplateDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingTemplate ? 'Edit Template' : 'Create New Template'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium">
                Template Name <span className="text-red-500">*</span>
              </label>
              <Input 
                value={templateName} 
                onChange={e => setTemplateName(e.target.value)}
                placeholder="e.g., Monthly Newsletter, Property Update"
              />
            </div>
            
            <div className="grid gap-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea 
                value={templateDescription} 
                onChange={e => setTemplateDescription(e.target.value)}
                placeholder="Optional description of this template"
                rows={2}
              />
            </div>
            
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">
                  Template Content <span className="text-red-500">*</span>
                </label>
                <div className="w-auto">
                  <Tabs value={editorTab} onValueChange={setEditorTab}>
                    <TabsList className="grid w-[200px] grid-cols-2">
                      <TabsTrigger value="visual" className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        Visual
                      </TabsTrigger>
                      <TabsTrigger value="code" className="flex items-center gap-1">
                        <Code className="h-3 w-3" />
                        HTML
                      </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="visual" className="mt-2">
                      <div className="border rounded-md p-4 bg-white">
                        <div className="mb-4 text-sm text-gray-500">
                          Preview of your template. Switch to HTML mode to edit the code.
                        </div>
                        <div className="border rounded-md p-4 bg-gray-50">
                          <div dangerouslySetInnerHTML={{ __html: templateHtml }} />
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="code" className="mt-2">
                      <Textarea 
                        value={templateHtml} 
                        onChange={e => setTemplateHtml(e.target.value)}
                        placeholder="Enter HTML content for your template"
                        className="font-mono text-sm"
                        rows={15}
                      />
                      <div className="mt-2 text-sm text-gray-500">
                        <p>Available merge tags:</p>
                        <ul className="list-disc pl-5 mt-1">
                          <li><code>{'{{contact.firstName}}'}</code> - Contact's first name</li>
                          <li><code>{'{{contact.lastName}}'}</code> - Contact's last name</li>
                          <li><code>{'{{contact.email}}'}</code> - Contact's email</li>
                          <li><code>{'{{campaign.name}}'}</code> - Campaign name</li>
                        </ul>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setTemplateDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSaveTemplate}
              disabled={savingTemplate || !templateName || !templateHtml}
            >
              {savingTemplate ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Template'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Template Preview Dialog */}
      <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {previewTemplate?.name} Preview
            </DialogTitle>
          </DialogHeader>
          
          <div className="border rounded-md p-4 bg-gray-50">
            {previewTemplate && (
              <div dangerouslySetInnerHTML={{ __html: previewTemplate.html_content }} />
            )}
          </div>
          
          <DialogFooter>
            <Button onClick={() => setPreviewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Template</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <p>Are you sure you want to delete the template "{templateToDelete?.name}"?</p>
            <p className="text-sm text-red-600 mt-2">This action cannot be undone.</p>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={handleDeleteTemplate}
              disabled={deleting}
            >
              {deleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Template'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default EmailTemplatesPage;
