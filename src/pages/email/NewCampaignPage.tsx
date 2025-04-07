
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  Save, 
  Mail, 
  Server, 
  FileText, 
  Users, 
  Clock, 
  Plus,
  Upload
} from 'lucide-react';
import { getEmailAccounts, getEmailTemplates, createCampaign } from '@/services/email';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

const NewCampaignPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: '',
    emailAccountId: '',
    templateId: '',
    contactIds: [] as string[],
    customRecipients: [] as {email: string, name?: string}[],
    sendingRate: 20,
    scheduled: null as string | null,
    status: 'draft' as const,
    startedAt: null as string | null,
    completedAt: null as string | null
  });

  const [customEmailInput, setCustomEmailInput] = useState('');
  const [customNameInput, setCustomNameInput] = useState('');
  const [recipientSource, setRecipientSource] = useState<'contacts' | 'custom'>('contacts');

  const { data: emailAccounts = [], isLoading: isLoadingAccounts } = useQuery({
    queryKey: ['emailAccounts'],
    queryFn: getEmailAccounts
  });

  const { data: emailTemplates = [], isLoading: isLoadingTemplates } = useQuery({
    queryKey: ['emailTemplates'],
    queryFn: getEmailTemplates
  });
  
  const [contacts, setContacts] = useState<Array<{id: string, name: string, email: string}>>([]);
  const [isLoadingContacts, setIsLoadingContacts] = useState(true);

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const { data, error } = await supabase
          .from('contacts')
          .select('id, name, email')
          .order('name', { ascending: true });
          
        if (error) throw error;
        
        setContacts(data || []);
      } catch (error) {
        console.error('Error fetching contacts:', error);
        toast({
          title: "Error",
          description: "Failed to load contacts. Using demo data instead.",
          variant: "destructive",
        });
        
        // Fallback to demo data
        setContacts([
          { id: 'id1', name: 'John Smith', email: 'john@example.com' },
          { id: 'id2', name: 'Sarah Johnson', email: 'sarah@example.com' },
          { id: 'id3', name: 'Michael Brown', email: 'michael@example.com' },
          { id: 'id4', name: 'Emma Wilson', email: 'emma@example.com' },
          { id: 'id5', name: 'David Clark', email: 'david@example.com' },
          { id: 'id6', name: 'Lisa Anderson', email: 'lisa@example.com' },
          { id: 'id7', name: 'Robert Taylor', email: 'robert@example.com' },
          { id: 'id8', name: 'Jennifer White', email: 'jennifer@example.com' },
        ]);
      } finally {
        setIsLoadingContacts(false);
      }
    };
    
    fetchContacts();
  }, [toast]);

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

  const addCustomRecipient = () => {
    if (!customEmailInput.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter an email address.",
        variant: "destructive",
      });
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customEmailInput)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      customRecipients: [...prev.customRecipients, {
        email: customEmailInput,
        name: customNameInput.trim() || undefined
      }]
    }));
    
    setCustomEmailInput('');
    setCustomNameInput('');
  };

  const removeCustomRecipient = (index: number) => {
    setFormData(prev => ({
      ...prev,
      customRecipients: prev.customRecipients.filter((_, i) => i !== index)
    }));
  };

  const importCustomRecipients = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const csv = event.target?.result as string;
        const lines = csv.split('\n');
        const newRecipients: {email: string, name?: string}[] = [];
        
        lines.forEach((line, index) => {
          if (index === 0 || !line.trim()) return; // Skip header row and empty lines
          
          const columns = line.split(',');
          const email = columns[0]?.trim();
          const name = columns[1]?.trim();
          
          if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            newRecipients.push({
              email,
              name: name || undefined
            });
          }
        });
        
        if (newRecipients.length > 0) {
          setFormData(prev => ({
            ...prev,
            customRecipients: [...prev.customRecipients, ...newRecipients]
          }));
          
          toast({
            title: "Success",
            description: `Imported ${newRecipients.length} recipients.`,
          });
        } else {
          toast({
            title: "No Valid Emails",
            description: "No valid email addresses were found in the file.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Error parsing CSV:', error);
        toast({
          title: "Import Error",
          description: "Failed to import recipients. Please check your file format.",
          variant: "destructive",
        });
      }
    };
    
    reader.readAsText(file);
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

    if (recipientSource === 'contacts' && formData.contactIds.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please select at least one contact.",
        variant: "destructive",
      });
      return;
    }

    if (recipientSource === 'custom' && formData.customRecipients.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please add at least one custom recipient.",
        variant: "destructive",
      });
      return;
    }

    try {
      const campaignData = {
        ...formData,
        recipients: recipientSource === 'custom' ? formData.customRecipients : undefined
      };
      
      const newCampaign = await createCampaign(campaignData);
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
                <Tabs value={recipientSource} onValueChange={(value) => setRecipientSource(value as 'contacts' | 'custom')}>
                  <TabsList className="w-full mb-4">
                    <TabsTrigger value="contacts" className="flex-1">From Contacts</TabsTrigger>
                    <TabsTrigger value="custom" className="flex-1">Custom List</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="contacts">
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
                    
                    {isLoadingContacts ? (
                      <div className="text-center py-4">
                        <p>Loading contacts...</p>
                      </div>
                    ) : contacts.length === 0 ? (
                      <div className="text-center py-4">
                        <p className="mb-2">No contacts found</p>
                        <Button asChild size="sm">
                          <Link to="/contacts/new">
                            <Plus className="h-4 w-4 mr-1" /> Add Contact
                          </Link>
                        </Button>
                      </div>
                    ) : (
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
                    )}
                  </TabsContent>
                  
                  <TabsContent value="custom">
                    <div className="space-y-4">
                      <div className="flex flex-col space-y-2">
                        <div className="flex space-x-2">
                          <div className="flex-1">
                            <Input
                              placeholder="Email address"
                              value={customEmailInput}
                              onChange={(e) => setCustomEmailInput(e.target.value)}
                            />
                          </div>
                          <Button type="button" size="sm" onClick={addCustomRecipient}>
                            Add
                          </Button>
                        </div>
                        <Input
                          placeholder="Name (optional)"
                          value={customNameInput}
                          onChange={(e) => setCustomNameInput(e.target.value)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-sm">
                          Custom recipients: <span className="font-medium">{formData.customRecipients.length}</span>
                        </p>
                        
                        <div className="relative">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-1"
                            onClick={() => document.getElementById('csv-upload')?.click()}
                          >
                            <Upload className="h-4 w-4" />
                            Import CSV
                          </Button>
                          <input
                            id="csv-upload"
                            type="file"
                            accept=".csv"
                            className="hidden"
                            onChange={importCustomRecipients}
                          />
                        </div>
                      </div>
                      
                      {formData.customRecipients.length > 0 ? (
                        <div className="border rounded-md overflow-hidden mt-2">
                          <div className="max-h-60 overflow-y-auto">
                            {formData.customRecipients.map((recipient, index) => (
                              <div 
                                key={index} 
                                className="flex items-center justify-between border-b last:border-b-0 p-2"
                              >
                                <div>
                                  <p className="font-medium text-sm">{recipient.name || 'Unnamed Recipient'}</p>
                                  <p className="text-xs text-gray-500">{recipient.email}</p>
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                  onClick={() => removeCustomRecipient(index)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-4 border rounded-md text-gray-500">
                          <p>No custom recipients added yet</p>
                          <p className="text-xs mt-1">Add emails individually or import from CSV</p>
                        </div>
                      )}
                      
                      <div className="text-xs text-gray-500 mt-2">
                        <p>CSV format: email,name</p>
                        <p>Example: john@example.com,John Smith</p>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
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
