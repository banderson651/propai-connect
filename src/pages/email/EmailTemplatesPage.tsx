import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { deleteEmailTemplate, getEmailTemplates } from '@/services/email';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, FileText, Edit, Trash } from 'lucide-react';
import { EmailTemplate } from '@/types/email';
import { useToast } from '@/hooks/use-toast';

export const EmailTemplatesContent = () => {
  const { toast } = useToast();
  const { data: templates = [], isLoading, refetch } = useQuery({
    queryKey: ['emailTemplates'],
    queryFn: getEmailTemplates
  });

  const handleDeleteTemplate = async (id: string) => {
    try {
      await deleteEmailTemplate(id);
      toast({
        title: "Template Deleted",
        description: "The email template has been deleted successfully.",
      });
      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete the template. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Email Templates</h1>
          <p className="text-sm text-gray-500 mt-1">Create and manage your email templates</p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link to="/email/templates/new">
              <Plus className="h-4 w-4 mr-1" /> New Template
            </Link>
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <p>Loading templates...</p>
        </div>
      ) : templates.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent className="pt-6">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Templates Yet</h3>
            <p className="text-gray-500 mb-4">
              Get started by creating your first email template.
            </p>
            <Button asChild>
              <Link to="/email/templates/new">
                <Plus className="h-4 w-4 mr-1" /> Create Template
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((template: EmailTemplate) => (
            <Card key={template.id} className="overflow-hidden">
              <CardHeader className="p-5 pb-0">
                <CardTitle className="flex items-center justify-between">
                  <span className="truncate">{template.name}</span>
                </CardTitle>
                <p className="text-sm text-gray-500 mt-1 truncate">
                  {template.subject}
                </p>
              </CardHeader>
              <CardContent className="p-5">
                <div className="h-24 overflow-hidden text-sm text-gray-600 mb-4">
                  <div
                    dangerouslySetInnerHTML={{
                      __html: (template.htmlBody || template.body || '').substring(0, 150) + '...',
                    }}
                  />
                </div>
                <div className="flex items-center justify-between mt-4">
                  <Button asChild variant="outline" size="sm">
                    <Link to={`/email/templates/${template.id}`}>
                      View
                    </Link>
                  </Button>
                  <div className="flex space-x-2">
                    <Button asChild variant="outline" size="sm">
                      <Link to={`/email/templates/${template.id}/edit`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDeleteTemplate(template.id)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  );
};

const EmailTemplatesPage = () => (
  <DashboardLayout pageTitle="Email Templates">
    <EmailTemplatesContent />
  </DashboardLayout>
);

export default EmailTemplatesPage;
