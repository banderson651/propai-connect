import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ImportContactsModal } from '@/components/email/ImportContactsModal';
import { getEmailTemplates, getComponentTemplates } from '@/services/emailService';
import { supabase } from '@/lib/supabase';
import { Loader2, Users, Mail, Calendar, Send } from 'lucide-react';
import type { EmailTemplate } from '@/types/email';

interface ImportedContact {
  name: string;
  email: string;
  [key: string]: any;
}

const NewCampaignPage = () => {
  // State variables
  const [activeTab, setActiveTab] = useState('details');
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importedContacts, setImportedContacts] = useState<ImportedContact[]>([]);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [componentTemplates, setComponentTemplates] = useState<any>({});
  const [loadingTemplates, setLoadingTemplates] = useState(true);
  const [templatesError, setTemplatesError] = useState<string | null>(null);
  const [campaignName, setCampaignName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [senderAccountId, setSenderAccountId] = useState('');
  const [schedule, setSchedule] = useState('immediate');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [emailAccounts, setEmailAccounts] = useState<any[]>([]);
  const [loadingAccounts, setLoadingAccounts] = useState(true);

  // Fetch templates and email accounts on component mount
  useEffect(() => {
    const fetchTemplates = async () => {
      setLoadingTemplates(true);
      setTemplatesError(null);
      try {
        const data = await getEmailTemplates();
        setTemplates(data);
      } catch (e) {
        setTemplatesError('Failed to fetch templates');
      } finally {
        setLoadingTemplates(false);
      }
    };

    const fetchComponentTemplates = async () => {
      try {
        const data = await getComponentTemplates();
        setComponentTemplates(data);
      } catch (e) {
        console.error('Failed to fetch component templates:', e);
      }
    };

    const fetchEmailAccounts = async () => {
      setLoadingAccounts(true);
      try {
        const { data, error } = await supabase
          .from('email_accounts')
          .select('id, name, email');
        
        if (error) throw error;
        setEmailAccounts(data || []);
      } catch (e) {
        console.error('Failed to fetch email accounts:', e);
      } finally {
        setLoadingAccounts(false);
      }
    };

    fetchTemplates();
    fetchComponentTemplates();
    fetchEmailAccounts();
  }, []);

  // Handle imported contacts
  const handleImported = (contacts: ImportedContact[]) => {
    setImportedContacts(contacts);
    // Auto-advance to next tab if this is the first import
    if (contacts.length > 0 && importedContacts.length === 0) {
      setActiveTab('template');
    }
  };

  // Save campaign to database
  const handleSaveCampaign = async () => {
    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);
    
    try {
      // Validate required fields
      if (!campaignName) throw new Error('Campaign name is required');
      if (!selectedTemplate) throw new Error('Please select an email template');
      if (importedContacts.length === 0) throw new Error('Please import at least one contact');
      if (!senderAccountId) throw new Error('Please select a sender account');
      
      // Prepare schedule data
      let scheduleData = null;
      if (schedule === 'scheduled') {
        if (!scheduledDate) throw new Error('Please select a date for scheduled sending');
        scheduleData = {
          type: 'scheduled',
          date: scheduledDate,
          time: scheduledTime || '09:00'
        };
      }
      
      // Insert campaign
      const { data: campaign, error: campaignError } = await supabase
        .from('email_campaigns')
        .insert({
          name: campaignName,
          description,
          template_id: selectedTemplate,
          sender_account_id: senderAccountId,
          schedule: scheduleData,
          status: schedule === 'immediate' ? 'queued' : 'scheduled'
        })
        .select()
        .single();
        
      if (campaignError) throw campaignError;
      
      // Insert recipients
      if (importedContacts.length > 0) {
        const recipients = importedContacts.map(c => ({
          campaign_id: campaign.id,
          email: c.email,
          first_name: c.name?.split(' ')[0] || '',
          last_name: c.name?.split(' ').slice(1).join(' ') || '',
        }));
        
        const { error: recError } = await supabase
          .from('email_campaign_recipients')
          .insert(recipients);
          
        if (recError) throw recError;
      }
      
      setSaveSuccess(true);
      
      // Reset form after successful save
      setTimeout(() => {
        setCampaignName('');
        setDescription('');
        setSelectedTemplate('');
        setSenderAccountId('');
        setSchedule('immediate');
        setScheduledDate('');
        setScheduledTime('');
        setImportedContacts([]);
        setActiveTab('details');
        setSaveSuccess(false);
      }, 3000);
      
    } catch (e: any) {
      setSaveError(e.message || 'Failed to save campaign');
    } finally {
      setSaving(false);
    }
  };

  // Determine if we can proceed to the next tab
  const canProceedToTemplate = campaignName.trim() !== '' && senderAccountId !== '';
  const canProceedToContacts = selectedTemplate !== '';
  const canProceedToSchedule = importedContacts.length > 0;
  const canSaveCampaign = campaignName && selectedTemplate && importedContacts.length > 0 && senderAccountId;

  return (
    <DashboardLayout>
      <div className="py-8 px-4 md:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Create New Email Campaign</h1>
          <Button 
            onClick={handleSaveCampaign} 
            disabled={saving || !canSaveCampaign}
            className="flex items-center gap-2"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            {saving ? 'Saving...' : 'Save Campaign'}
          </Button>
        </div>

        {saveError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {saveError}
          </div>
        )}
        
        {saveSuccess && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-6">
            Campaign created successfully!
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 mb-8">
            <TabsTrigger value="details" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Campaign Details
            </TabsTrigger>
            <TabsTrigger value="template" disabled={!canProceedToTemplate} className="flex items-center gap-2">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 7.8C4 6.11984 4 5.27976 4.32698 4.63803C4.6146 4.07354 5.07354 3.6146 5.63803 3.32698C6.27976 3 7.11984 3 8.8 3H15.2C16.8802 3 17.7202 3 18.362 3.32698C18.9265 3.6146 19.3854 4.07354 19.673 4.63803C20 5.27976 20 6.11984 20 7.8V16.2C20 17.8802 20 18.7202 19.673 19.362C19.3854 19.9265 18.9265 20.3854 18.362 20.673C17.7202 21 16.8802 21 15.2 21H8.8C7.11984 21 6.27976 21 5.63803 20.673C5.07354 20.3854 4.6146 19.9265 4.32698 19.362C4 18.7202 4 17.8802 4 16.2V7.8Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M8 12H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M8 8H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M8 16H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Template
            </TabsTrigger>
            <TabsTrigger value="contacts" disabled={!canProceedToContacts} className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Recipients
            </TabsTrigger>
            <TabsTrigger value="schedule" disabled={!canProceedToSchedule} className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Schedule
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details">
            <Card>
              <CardHeader>
                <CardTitle>Campaign Details</CardTitle>
                <CardDescription>
                  Name your campaign and select the sender account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6">
                  <div className="grid gap-3">
                    <label className="text-sm font-medium">
                      Campaign Name <span className="text-red-500">*</span>
                    </label>
                    <Input 
                      placeholder="e.g., April Newsletter, Property Announcement"
                      value={campaignName} 
                      onChange={e => setCampaignName(e.target.value)}
                    />
                  </div>
                  
                  <div className="grid gap-3">
                    <label className="text-sm font-medium">Description</label>
                    <Textarea 
                      placeholder="Optional description of this campaign"
                      value={description} 
                      onChange={e => setDescription(e.target.value)}
                      rows={3}
                    />
                  </div>
                  
                  <div className="grid gap-3">
                    <label className="text-sm font-medium">
                      Sender Account <span className="text-red-500">*</span>
                    </label>
                    {loadingAccounts ? (
                      <div className="text-sm text-gray-500 flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading email accounts...
                      </div>
                    ) : emailAccounts.length === 0 ? (
                      <div className="text-sm text-amber-600">
                        No email accounts found. Please set up an email account first.
                      </div>
                    ) : (
                      <Select value={senderAccountId} onValueChange={setSenderAccountId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select sender account" />
                        </SelectTrigger>
                        <SelectContent>
                          {emailAccounts.map(account => (
                            <SelectItem key={account.id} value={account.id}>
                              {account.name} ({account.email})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                  
                  <div className="flex justify-end">
                    <Button 
                      onClick={() => setActiveTab('template')}
                      disabled={!canProceedToTemplate}
                    >
                      Continue to Template
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="template">
            <Card>
              <CardHeader>
                <CardTitle>Email Template</CardTitle>
                <CardDescription>
                  Select a template for your campaign
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6">
                  {loadingTemplates ? (
                    <div className="text-sm text-gray-500 flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading templates...
                    </div>
                  ) : templatesError ? (
                    <div className="text-sm text-red-500">{templatesError}</div>
                  ) : templates.length === 0 ? (
                    <div className="text-sm text-amber-600">
                      No templates found. Please create a template first.
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* Built-in component templates */}
                        <div 
                          className={`border rounded-lg overflow-hidden cursor-pointer transition-all hover:shadow-md ${selectedTemplate === 'property-listing' ? 'ring-2 ring-blue-500' : ''}`}
                          onClick={() => setSelectedTemplate('property-listing')}
                        >
                          <div className="h-48 bg-gradient-to-r from-blue-50 to-blue-100 p-4 overflow-hidden">
                            <div className="bg-white rounded-lg shadow-sm p-3 text-xs">
                              <div className="font-medium mb-1">Property Listing</div>
                              <div className="h-2 bg-gray-200 rounded mb-1"></div>
                              <div className="h-2 bg-gray-200 rounded w-2/3 mb-2"></div>
                              <div className="bg-gray-100 h-16 rounded mb-2"></div>
                              <div className="grid grid-cols-2 gap-1">
                                <div className="h-8 bg-gray-100 rounded"></div>
                                <div className="h-8 bg-gray-100 rounded"></div>
                              </div>
                            </div>
                          </div>
                          <div className="p-3">
                            <h3 className="font-medium">Property Listing</h3>
                            <p className="text-xs text-gray-500">Showcase property details with images and features</p>
                          </div>
                        </div>

                        <div 
                          className={`border rounded-lg overflow-hidden cursor-pointer transition-all hover:shadow-md ${selectedTemplate === 'open-house' ? 'ring-2 ring-blue-500' : ''}`}
                          onClick={() => setSelectedTemplate('open-house')}
                        >
                          <div className="h-48 bg-gradient-to-r from-green-50 to-green-100 p-4 overflow-hidden">
                            <div className="bg-white rounded-lg shadow-sm p-3 text-xs">
                              <div className="font-medium mb-1 text-center">Open House</div>
                              <div className="h-2 bg-gray-200 rounded mb-1 mx-auto w-3/4"></div>
                              <div className="h-16 bg-gray-100 rounded mb-2"></div>
                              <div className="bg-green-100 p-2 rounded mb-2">
                                <div className="h-2 bg-gray-200 rounded mb-1"></div>
                                <div className="h-2 bg-gray-200 rounded w-2/3"></div>
                              </div>
                              <div className="flex justify-center">
                                <div className="h-6 w-24 bg-green-200 rounded"></div>
                              </div>
                            </div>
                          </div>
                          <div className="p-3">
                            <h3 className="font-medium">Open House Invitation</h3>
                            <p className="text-xs text-gray-500">Invite clients to property viewings with RSVP</p>
                          </div>
                        </div>

                        <div 
                          className={`border rounded-lg overflow-hidden cursor-pointer transition-all hover:shadow-md ${selectedTemplate === 'client-followup' ? 'ring-2 ring-blue-500' : ''}`}
                          onClick={() => setSelectedTemplate('client-followup')}
                        >
                          <div className="h-48 bg-gradient-to-r from-purple-50 to-purple-100 p-4 overflow-hidden">
                            <div className="bg-white rounded-lg shadow-sm p-3 text-xs">
                              <div className="font-medium mb-1">Follow-Up</div>
                              <div className="h-2 bg-gray-200 rounded mb-1"></div>
                              <div className="h-2 bg-gray-200 rounded w-1/2 mb-3"></div>
                              <div className="h-2 bg-gray-200 rounded mb-1"></div>
                              <div className="h-2 bg-gray-200 rounded mb-1"></div>
                              <div className="h-2 bg-gray-200 rounded w-3/4 mb-3"></div>
                              <div className="bg-blue-50 p-2 rounded mb-2">
                                <div className="h-2 bg-gray-200 rounded mb-1"></div>
                                <div className="h-5 w-20 bg-blue-200 rounded mx-auto"></div>
                              </div>
                            </div>
                          </div>
                          <div className="p-3">
                            <h3 className="font-medium">Client Follow-Up</h3>
                            <p className="text-xs text-gray-500">Personalized follow-up with call-to-action</p>
                          </div>
                        </div>

                        <div 
                          className={`border rounded-lg overflow-hidden cursor-pointer transition-all hover:shadow-md ${selectedTemplate === 'market-update' ? 'ring-2 ring-blue-500' : ''}`}
                          onClick={() => setSelectedTemplate('market-update')}
                        >
                          <div className="h-48 bg-gradient-to-r from-amber-50 to-amber-100 p-4 overflow-hidden">
                            <div className="bg-white rounded-lg shadow-sm p-3 text-xs">
                              <div className="font-medium mb-1 text-center">Market Update</div>
                              <div className="h-2 bg-gray-200 rounded mb-1 mx-auto w-2/3"></div>
                              <div className="grid grid-cols-2 gap-1 mb-2">
                                <div className="h-10 bg-gray-100 rounded"></div>
                                <div className="h-10 bg-gray-100 rounded"></div>
                                <div className="h-10 bg-gray-100 rounded"></div>
                                <div className="h-10 bg-gray-100 rounded"></div>
                              </div>
                              <div className="h-2 bg-gray-200 rounded mb-1"></div>
                              <div className="h-2 bg-gray-200 rounded w-3/4"></div>
                            </div>
                          </div>
                          <div className="p-3">
                            <h3 className="font-medium">Market Update</h3>
                            <p className="text-xs text-gray-500">Share market trends and statistics with clients</p>
                          </div>
                        </div>

                        <div 
                          className={`border rounded-lg overflow-hidden cursor-pointer transition-all hover:shadow-md ${selectedTemplate === 'transaction-complete' ? 'ring-2 ring-blue-500' : ''}`}
                          onClick={() => setSelectedTemplate('transaction-complete')}
                        >
                          <div className="h-48 bg-gradient-to-r from-green-50 to-blue-50 p-4 overflow-hidden">
                            <div className="bg-white rounded-lg shadow-sm p-3 text-xs">
                              <div className="font-medium mb-1 text-center">Transaction Complete</div>
                              <div className="h-2 bg-gray-200 rounded mb-1 mx-auto w-3/4"></div>
                              <div className="bg-green-100 p-2 rounded-full w-32 mx-auto mb-2">
                                <div className="h-2 bg-gray-200 rounded mx-auto w-3/4"></div>
                              </div>
                              <div className="h-12 bg-gray-100 rounded mb-2"></div>
                              <div className="bg-blue-50 p-2 rounded mb-2">
                                <div className="h-2 bg-gray-200 rounded mb-1"></div>
                                <div className="h-2 bg-gray-200 rounded w-3/4"></div>
                              </div>
                            </div>
                          </div>
                          <div className="p-3">
                            <h3 className="font-medium">Transaction Complete</h3>
                            <p className="text-xs text-gray-500">Celebrate closed deals with next steps</p>
                          </div>
                        </div>

                        {/* Database templates */}
                        {templates.map(t => (
                          <div 
                            key={t.id}
                            className={`border rounded-lg overflow-hidden cursor-pointer transition-all hover:shadow-md ${selectedTemplate === t.id ? 'ring-2 ring-blue-500' : ''}`}
                            onClick={() => setSelectedTemplate(t.id)}
                          >
                            <div className="h-48 bg-gradient-to-r from-gray-50 to-gray-100 p-4 overflow-hidden">
                              <div className="bg-white rounded-lg shadow-sm p-3 text-xs">
                                <div className="font-medium mb-1">{t.name}</div>
                                <div className="h-2 bg-gray-200 rounded mb-1"></div>
                                <div className="h-2 bg-gray-200 rounded w-2/3 mb-2"></div>
                                <div className="h-16 bg-gray-100 rounded mb-2"></div>
                                <div className="h-2 bg-gray-200 rounded mb-1"></div>
                                <div className="h-2 bg-gray-200 rounded w-1/2"></div>
                              </div>
                            </div>
                            <div className="p-3">
                              <h3 className="font-medium">{t.name}</h3>
                              <p className="text-xs text-gray-500">{t.description || 'Custom template'}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {selectedTemplate && (
                        <div className="border rounded-md p-4 mt-4">
                          <h3 className="text-sm font-medium mb-2">Template Preview</h3>
                          <div className="bg-gray-50 p-4 rounded-md h-64 overflow-auto">
                            {selectedTemplate === 'property-listing' && (
                              <div className="bg-white p-4 rounded shadow-sm">
                                <div className="border-b pb-2 mb-3">
                                  <h2 className="text-lg font-semibold">New Property Alert: Luxury Waterfront Villa</h2>
                                  <p className="text-sm text-gray-600">Exclusively listed by John Smith</p>
                                </div>
                                <div className="h-32 bg-gray-200 rounded mb-3"></div>
                                <div className="grid grid-cols-2 gap-2 mb-3">
                                  <div className="bg-gray-50 p-2 rounded">
                                    <p className="text-xs text-gray-500">Price</p>
                                    <p className="text-sm font-medium">$1,250,000</p>
                                  </div>
                                  <div className="bg-gray-50 p-2 rounded">
                                    <p className="text-xs text-gray-500">Bed/Bath</p>
                                    <p className="text-sm font-medium">4 / 3</p>
                                  </div>
                                </div>
                                <div className="bg-blue-50 p-2 rounded mb-3">
                                  <p className="text-xs text-blue-700">Don't miss this rare opportunity!</p>
                                </div>
                                <div className="border-t pt-3">
                                  <button className="bg-blue-600 text-white text-xs px-3 py-1 rounded">View Listing</button>
                                </div>
                              </div>
                            )}

                            {selectedTemplate === 'open-house' && (
                              <div className="bg-white p-4 rounded shadow-sm">
                                <div className="border-b pb-2 mb-3 text-center">
                                  <h2 className="text-lg font-semibold">Open House Invitation</h2>
                                  <p className="text-sm text-gray-600">You're invited to tour this beautiful property</p>
                                </div>
                                <div className="h-32 bg-gray-200 rounded mb-3"></div>
                                <div className="bg-blue-50 p-2 rounded mb-3">
                                  <h3 className="text-sm font-medium text-blue-700">Event Details</h3>
                                  <p className="text-xs">Date: Saturday, May 15th</p>
                                  <p className="text-xs">Time: 1:00 PM - 4:00 PM</p>
                                </div>
                                <div className="text-center">
                                  <button className="bg-green-600 text-white text-xs px-3 py-1 rounded">RSVP Now</button>
                                </div>
                              </div>
                            )}

                            {selectedTemplate === 'client-followup' && (
                              <div className="bg-white p-4 rounded shadow-sm">
                                <div className="border-b pb-2 mb-3">
                                  <h2 className="text-lg font-semibold">Thoughts on the property?</h2>
                                  <p className="text-sm text-gray-600">A message from Jane Realtor</p>
                                </div>
                                <p className="text-sm mb-3">Hi John,</p>
                                <p className="text-sm mb-3">I wanted to follow up regarding our recent property viewing. Please let me know if you have any questions!</p>
                                <div className="bg-blue-50 p-2 rounded mb-3">
                                  <h3 className="text-sm font-medium text-blue-700">Next Steps</h3>
                                  <p className="text-xs mb-2">Would you like to schedule another viewing?</p>
                                  <button className="bg-blue-600 text-white text-xs px-3 py-1 rounded">Schedule Now</button>
                                </div>
                              </div>
                            )}

                            {selectedTemplate === 'market-update' && (
                              <div className="bg-white p-4 rounded shadow-sm">
                                <div className="border-b pb-2 mb-3 text-center">
                                  <h2 className="text-lg font-semibold">Market Update: Downtown Area</h2>
                                  <p className="text-sm text-gray-600">Current trends for April 2025</p>
                                </div>
                                <div className="grid grid-cols-2 gap-2 mb-3">
                                  <div className="bg-gray-50 p-2 rounded">
                                    <p className="text-xs text-gray-500">Median Price</p>
                                    <p className="text-sm font-medium">$750,000</p>
                                    <p className="text-xs text-green-600">↑ 3.2%</p>
                                  </div>
                                  <div className="bg-gray-50 p-2 rounded">
                                    <p className="text-xs text-gray-500">Inventory</p>
                                    <p className="text-sm font-medium">142 homes</p>
                                    <p className="text-xs text-red-600">↓ 5.1%</p>
                                  </div>
                                </div>
                                <h3 className="text-sm font-medium mb-1">Market Summary</h3>
                                <p className="text-xs text-gray-700 mb-3">The market continues to favor sellers with limited inventory and strong demand...</p>
                              </div>
                            )}

                            {selectedTemplate === 'transaction-complete' && (
                              <div className="bg-white p-4 rounded shadow-sm">
                                <div className="border-b pb-2 mb-3 text-center">
                                  <h2 className="text-lg font-semibold">Congratulations on Your Purchase!</h2>
                                  <p className="text-sm text-gray-600">Your new property is officially yours!</p>
                                </div>
                                <div className="bg-green-100 text-green-800 rounded-full px-3 py-1 text-xs inline-block mb-3">
                                  Closed on April 15, 2025
                                </div>
                                <div className="h-24 bg-gray-200 rounded mb-3"></div>
                                <div className="bg-blue-50 p-2 rounded mb-3">
                                  <h3 className="text-sm font-medium text-blue-700">What's Next?</h3>
                                  <ul className="text-xs list-disc pl-4">
                                    <li>Transfer utilities</li>
                                    <li>Update your address</li>
                                    <li>Schedule your move</li>
                                  </ul>
                                </div>
                              </div>
                            )}

                            {!['property-listing', 'open-house', 'client-followup', 'market-update', 'transaction-complete'].includes(selectedTemplate) && (
                              <div className="text-sm text-gray-500 italic">
                                Preview for custom template
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                  
                  <div className="flex justify-between">
                    <Button variant="outline" onClick={() => setActiveTab('details')}>
                      Back
                    </Button>
                    <Button 
                      onClick={() => setActiveTab('contacts')}
                      disabled={!canProceedToContacts}
                    >
                      Continue to Recipients
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contacts">
            <Card>
              <CardHeader>
                <CardTitle>Campaign Recipients</CardTitle>
                <CardDescription>
                  Import contacts who will receive this campaign
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6">
                  <Button 
                    variant="outline" 
                    onClick={() => setImportModalOpen(true)}
                    className="flex items-center gap-2"
                  >
                    <Users className="h-4 w-4" />
                    Import Contacts from CSV
                  </Button>
                  
                  {importedContacts.length > 0 ? (
                    <div className="border rounded-md overflow-hidden">
                      <div className="bg-gray-50 px-4 py-2 border-b flex justify-between items-center">
                        <h3 className="font-medium">Imported Contacts ({importedContacts.length})</h3>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setImportModalOpen(true)}
                        >
                          Edit
                        </Button>
                      </div>
                      <div className="max-h-64 overflow-y-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y">
                            {importedContacts.slice(0, 10).map((contact, i) => (
                              <tr key={i} className="hover:bg-gray-50">
                                <td className="px-4 py-2 text-sm">{contact.name || '(No Name)'}</td>
                                <td className="px-4 py-2 text-sm">{contact.email}</td>
                              </tr>
                            ))}
                            {importedContacts.length > 10 && (
                              <tr>
                                <td colSpan={2} className="px-4 py-2 text-sm text-gray-500 text-center">
                                  ...and {importedContacts.length - 10} more contacts
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 border rounded-md bg-gray-50">
                      <Users className="h-12 w-12 mx-auto text-gray-400" />
                      <p className="mt-2 text-sm text-gray-500">No contacts imported yet</p>
                      <p className="text-xs text-gray-400">Import contacts to continue</p>
                    </div>
                  )}
                  
                  <div className="flex justify-between">
                    <Button variant="outline" onClick={() => setActiveTab('template')}>
                      Back
                    </Button>
                    <Button 
                      onClick={() => setActiveTab('schedule')}
                      disabled={!canProceedToSchedule}
                    >
                      Continue to Schedule
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="schedule">
            <Card>
              <CardHeader>
                <CardTitle>Campaign Schedule</CardTitle>
                <CardDescription>
                  Choose when to send your campaign
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6">
                  <div className="grid gap-3">
                    <label className="text-sm font-medium">Delivery Options</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div 
                        className={`border rounded-md p-4 cursor-pointer ${schedule === 'immediate' ? 'border-blue-500 bg-blue-50' : ''}`}
                        onClick={() => setSchedule('immediate')}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-4 h-4 rounded-full mt-1 ${schedule === 'immediate' ? 'bg-blue-500' : 'border border-gray-300'}`}></div>
                          <div>
                            <h3 className="font-medium">Send Immediately</h3>
                            <p className="text-sm text-gray-500">
                              The campaign will be queued for sending as soon as you save it
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div 
                        className={`border rounded-md p-4 cursor-pointer ${schedule === 'scheduled' ? 'border-blue-500 bg-blue-50' : ''}`}
                        onClick={() => setSchedule('scheduled')}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-4 h-4 rounded-full mt-1 ${schedule === 'scheduled' ? 'bg-blue-500' : 'border border-gray-300'}`}></div>
                          <div>
                            <h3 className="font-medium">Schedule for Later</h3>
                            <p className="text-sm text-gray-500">
                              Choose a specific date and time to send this campaign
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {schedule === 'scheduled' && (
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="grid gap-2">
                        <label className="text-sm font-medium">
                          Date <span className="text-red-500">*</span>
                        </label>
                        <Input 
                          type="date" 
                          value={scheduledDate}
                          onChange={e => setScheduledDate(e.target.value)}
                          min={new Date().toISOString().split('T')[0]}
                        />
                      </div>
                      <div className="grid gap-2">
                        <label className="text-sm font-medium">
                          Time <span className="text-red-500">*</span>
                        </label>
                        <Input 
                          type="time" 
                          value={scheduledTime}
                          onChange={e => setScheduledTime(e.target.value)}
                          defaultValue="09:00"
                        />
                      </div>
                    </div>
                  )}
                  
                  <div className="flex justify-between">
                    <Button variant="outline" onClick={() => setActiveTab('contacts')}>
                      Back
                    </Button>
                    <Button 
                      onClick={handleSaveCampaign}
                      disabled={saving || !canSaveCampaign || (schedule === 'scheduled' && !scheduledDate)}
                    >
                      {saving ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Save Campaign
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <ImportContactsModal
          open={importModalOpen}
          onOpenChange={setImportModalOpen}
          onComplete={handleImported}
        />
      </div>
    </DashboardLayout>
  );
};

export default NewCampaignPage;
