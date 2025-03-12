
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Mail, 
  Plus, 
  FileText, 
  Edit, 
  Trash, 
  Copy, 
  ChevronRight 
} from 'lucide-react';
import { getEmailTemplates, createEmailTemplate, deleteEmailTemplate } from '@/services/emailService';
import { useToast } from '@/hooks/use-toast';

const EmailTemplatesPage = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('templates');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    subject: '',
    body: '',
  });

  const { 
    data: templates = [], 
    isLoading, 
    refetch 
  } = useQuery({
    queryKey: ['emailTemplates'],
    queryFn: getEmailTemplates
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setNewTemplate(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createEmailTemplate(newTemplate);
      setIsAddDialogOpen(false);
      refetch();
      toast({
        title: "Template Created",
        description: "Your email template has been successfully created.",
      });
      // Reset form
      setNewTemplate({
        name: '',
        subject: '',
        body: '',
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create template. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    try {
      await deleteEmailTemplate(id);
      refetch();
      toast({
        title: "Template Deleted",
        description: "The email template has been successfully deleted.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete template. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDuplicateTemplate = async (templateToDuplicate: any) => {
    try {
      await createEmailTemplate({
        name: `${templateToDuplicate.name} (Copy)`,
        subject: templateToDuplicate.subject,
        body: templateToDuplicate.body,
      });
      refetch();
      toast({
        title: "Template Duplicated",
        description: "The email template has been successfully duplicated.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to duplicate template. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Email Templates</h1>
          <p className="text-sm text-gray-500 mt-1">Create and manage email templates for your campaigns</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-1" /> Create Template
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-3xl">
              <DialogHeader>
                <DialogTitle>Create Email Template</DialogTitle>
                <DialogDescription>
                  Create a new email template for your campaigns. Use {{variable}} format for dynamic content.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <label htmlFor="name" className="text-sm font-medium">
                      Template Name
                    </label>
                    <Input
                      id="name"
                      name="name"
                      value={newTemplate.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <label htmlFor="subject" className="text-sm font-medium">
                      Email Subject
                    </label>
                    <Input
                      id="subject"
                      name="subject"
                      value={newTemplate.subject}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <label htmlFor="body" className="text-sm font-medium">
                      Email Body
                    </label>
                    <Textarea
                      id="body"
                      name="body"
                      rows={12}
                      value={newTemplate.body}
                      onChange={handleInputChange}
                      placeholder="Write your email content here. Use {{firstName}}, {{agentName}}, etc. for personalization."
                      required
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Save Template</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs 
        defaultValue="templates" 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="grid grid-cols-3 gap-2 w-full max-w-md">
          <TabsTrigger value="campaigns">
            <Link to="/email" className="flex w-full h-full items-center justify-center">
              Campaigns
            </Link>
          </TabsTrigger>
          <TabsTrigger value="accounts">
            <Link to="/email/accounts" className="flex w-full h-full items-center justify-center">
              Email Accounts
            </Link>
          </TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-4">
          {isLoading ? (
            <div className="text-center py-12">
              <p>Loading templates...</p>
            </div>
          ) : templates.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent className="pt-6">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Email Templates</h3>
                <p className="text-gray-500 mb-4">
                  Create email templates to use in your campaigns.
                </p>
                <Button onClick={() => setIsAddDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-1" /> Create Template
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {templates.map(template => (
                <Card key={template.id}>
                  <CardHeader className="p-5 pb-0">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <div className="flex space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDuplicateTemplate(template)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-red-500 hover:text-red-700"
                          onClick={() => handleDeleteTemplate(template.id)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-5">
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-500">Subject</p>
                        <p className="font-medium">{template.subject}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Preview</p>
                        <p className="text-sm line-clamp-3 mt-1">
                          {template.body.replace(/<[^>]*>/g, '')}
                        </p>
                      </div>
                      <div className="pt-2">
                        <Button variant="outline" size="sm">
                          Preview <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default EmailTemplatesPage;
