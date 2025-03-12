import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  ArrowLeft, 
  Save, 
  Mail, 
  Server, 
  FileText, 
  Users, 
  Clock, 
  Plus
} from 'lucide-react';
import { getEmailAccounts, getEmailTemplates, createCampaign } from '@/services/emailService';
import { useToast } from '@/hooks/use-toast';

const NewCampaignPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: '',
    emailAccountId: '',
    templateId: '',
    contactIds: [] as string[],
    sendingRate: 20,
    scheduled: null as string | null,
    status: 'draft' as const,
    startedAt: null as string | null,
    completedAt: null as string | null
  });

  const { data: emailAccounts = [], isLoading: isLoadingAccounts } = useQuery({
    queryKey: ['emailAccounts'],
    queryFn: getEmailAccounts
  });

  const { data: emailTemplates = [], isLoading: isLoadingTemplates } = useQuery({
    queryKey: ['emailTemplates'],
    queryFn: getEmailTemplates
  });
  
  const contacts = [
    { id: 'id1', name: 'John Smith', email: 'john@example.com' },
    { id: 'id2', name: 'Sarah Johnson', email: 'sarah@example.com' },
    { id: 'id3', name: 'Michael Brown', email: 'michael@example.com' },
    { id: 'id4', name: 'Emma Wilson', email: 'emma@example.com' },
    { id: 'id5', name: 'David Clark', email: 'david@example.com' },
    { id: 'id6', name: 'Lisa Anderson', email: 'lisa@example.com' },
    { id: 'id7', name: 'Robert Taylor', email: 'robert@example.com' },
    { id: 'id8', name: 'Jennifer White', email: 'jennifer@example.com' },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'sendingRate' ? Number(value) : value
    }));
  };

  const handleContactToggle = (contactId: string) => {
    setFormData(prev => {
      const contactIds = [...prev.contactIds];
      
      if (contactIds.includes(contactId)) {
        return {
          ...prev,
          contactIds: contactIds.filter(id => id !== contactId)
        };
      } else {
        return {
          ...prev,
          contactIds: [...contactIds, contactId]
        };
      }
    });
  };

  const handleSelectAllContacts = () => {
    setFormData(prev => ({
      ...prev,
      contactIds: contacts.map(contact => contact.id)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.emailAccountId) {
      toast({
        title: "Missing Information",
        description: "Please select an email account.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.templateId) {
      toast({
        title: "Missing Information",
        description: "Please select an email template.",
        variant: "destructive",
      });
      return;
    }

    if (formData.contactIds.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please select at least one contact.",
        variant: "destructive",
      });
      return;
    }

    try {
      const newCampaign = await createCampaign(formData);
      toast({
        title: "Campaign Created",
        description: "Your email campaign has been created successfully.",
      });
      navigate(`/email/campaigns/${newCampaign.id}`);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create campaign. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="flex items-center gap-2 mb-6">
        <Button variant="outline" size="sm" asChild>
          <Link to="/email">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Link>
        </Button>
        <h1 className="text-2xl font-semibold text-gray-900">Create New Campaign</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader className="p-5 pb-0">
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" /> Campaign Details
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5">
                <div className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium mb-1">
                      Campaign Name
                    </label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="p-5 pb-0">
                <CardTitle className="flex items-center gap-2">
                  <Server className="h-5 w-5" /> Email Account
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5">
                {isLoadingAccounts ? (
                  <p>Loading email accounts...</p>
                ) : emailAccounts.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="mb-2">No email accounts connected</p>
                    <Button asChild size="sm">
                      <Link to="/email/accounts">
                        <Plus className="h-4 w-4 mr-1" /> Connect Email
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div>
                    <label htmlFor="emailAccountId" className="block text-sm font-medium mb-1">
                      Select Email Account
                    </label>
                    <select
                      id="emailAccountId"
                      name="emailAccountId"
                      value={formData.emailAccountId}
                      onChange={handleInputChange}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      required
                    >
                      <option value="">Select an email account</option>
                      {emailAccounts.map(account => (
                        <option key={account.id} value={account.id}>
                          {account.name} ({account.email})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="p-5 pb-0">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" /> Email Template
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5">
                {isLoadingTemplates ? (
                  <p>Loading email templates...</p>
                ) : emailTemplates.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="mb-2">No email templates created</p>
                    <Button asChild size="sm">
                      <Link to="/email/templates">
                        <Plus className="h-4 w-4 mr-1" /> Create Template
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div>
                    <label htmlFor="templateId" className="block text-sm font-medium mb-1">
                      Select Email Template
                    </label>
                    <select
                      id="templateId"
                      name="templateId"
                      value={formData.templateId}
                      onChange={handleInputChange}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      required
                    >
                      <option value="">Select a template</option>
                      {emailTemplates.map(template => (
                        <option key={template.id} value={template.id}>
                          {template.name}
                        </option>
                      ))}
                    </select>
                    {formData.templateId && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-4"
                        type="button"
                      >
                        Preview Template
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader className="p-5 pb-0">
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" /> Select Recipients
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm">
                    Selected: <span className="font-medium">{formData.contactIds.length}</span> contacts
                  </p>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={handleSelectAllContacts}
                  >
                    Select All
                  </Button>
                </div>
                
                <div className="border rounded-md overflow-hidden">
                  <div className="max-h-60 overflow-y-auto">
                    {contacts.map(contact => (
                      <div 
                        key={contact.id} 
                        className="flex items-center border-b last:border-b-0 p-2"
                      >
                        <input
                          type="checkbox"
                          id={`contact-${contact.id}`}
                          checked={formData.contactIds.includes(contact.id)}
                          onChange={() => handleContactToggle(contact.id)}
                          className="mr-2 h-4 w-4"
                        />
                        <label 
                          htmlFor={`contact-${contact.id}`}
                          className="flex-1 cursor-pointer"
                        >
                          <p className="font-medium text-sm">{contact.name}</p>
                          <p className="text-xs text-gray-500">{contact.email}</p>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="p-5 pb-0">
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" /> Sending Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5">
                <div className="space-y-4">
                  <div>
                    <label htmlFor="sendingRate" className="block text-sm font-medium mb-1">
                      Sending Rate (emails per hour)
                    </label>
                    <Input
                      id="sendingRate"
                      name="sendingRate"
                      type="number"
                      min="1"
                      max="100"
                      value={formData.sendingRate}
                      onChange={handleInputChange}
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      We recommend 20-30 emails per hour to avoid spam filters
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex space-x-2 mt-6">
              <Button type="button" variant="outline" onClick={() => navigate('/email')}>
                Cancel
              </Button>
              <Button type="submit">
                <Save className="h-4 w-4 mr-1" /> Save Campaign
              </Button>
            </div>
          </div>
        </div>
      </form>
    </DashboardLayout>
  );
};

export default NewCampaignPage;
