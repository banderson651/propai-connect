import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox'; // Assuming this is used for contact selection
import { useToast } from '@/components/ui/use-toast';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { EmailAccount, EmailTemplate, Campaign, Contact, ContactList } from '@/types/email'; // Assuming these types exist

interface EmailCampaignsPageProps {}

const EmailCampaignsPage: React.FC<EmailCampaignsPageProps> = () => {
  const [contacts, setContacts] = useState<Contact[]>([]); // Assuming contacts are available
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [emailAccounts, setEmailAccounts] = useState<EmailAccount[]>([]);
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>([]);
  const [contactLists, setContactLists] = useState<ContactList[]>([]);
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [isCreateCampaignModalOpen, setIsCreateCampaignModalOpen] = useState(false);
  const [newCampaign, setNewCampaign] = useState({
    name: '',
    subject: '',
    body: '',
 templateId: undefined,
 templateName: '', // Add templateName state
 contactListId: '',
    emailAccountId: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSendConfirmModalOpen, setIsSendConfirmModalOpen] = useState(false);
  const [campaignToSendId, setCampaignToSendId] = useState<string | null>(null);
  const { toast } = useToast();

  // Placeholder API calls
  const fetchCampaigns = async () => {
    setIsLoading(true);
    // Replace with actual API call to fetch campaigns
    await new Promise(resolve => setTimeout(resolve, 1000));
 setCampaigns([
 { id: '1', name: 'Welcome Series', subject: 'Welcome!', body: '<p>Hello!</p>', senderEmailAccountId: 'acc1', contactListId: 'list1', status: 'Sent', sentAt: new Date().toISOString(), stats: { sent: 100, opened: 50, clicked: 10, bounced: 5 } },
 { id: '2', name: 'Product Update', subject: 'New Feature!', body: '<p>Check out our new feature!</p>', senderEmailAccountId: 'acc2', contactListId: 'list2', status: 'Draft', sentAt: null, stats: { sent: 0, opened: 0, clicked: 0, bounced: 0 } },
 { id: '3', name: 'Holiday Promotion', subject: 'Special Offer', body: '<p>Happy holidays!</p>', senderEmailAccountId: 'acc1', contactListId: 'list1', status: 'Failed', sentAt: new Date().toISOString(), stats: { sent: 0, opened: 0, clicked: 0, bounced: 0 } },
 ]);
    setIsLoading(false);

  };

  const fetchEmailAccounts = async () => {
    setIsLoading(true);
    // Replace with actual API call to fetch email accounts
    await new Promise(resolve => setTimeout(resolve, 1000));
 setEmailAccounts([{
 id: 'acc1', email: 'user1@example.com', smtpHost: 'smtp.example.com', smtpPort: 587, smtpUser: 'user1@example.com', smtpPass: 'password', domainVerified: true
 },
 {
 id: 'acc2', email: 'user2@anotherdomain.com', smtpHost: 'smtp.anotherdomain.com', smtpPort: 587, smtpUser: 'user2@anotherdomain.com', smtpPass: 'password', domainVerified: false
 }
    ]);
    setIsLoading(false);
  };

  const fetchEmailTemplates = async () => {
    setIsLoading(true);
    // Replace with actual API call to fetch email templates
    await new Promise(resolve => setTimeout(resolve, 1000));
 setEmailTemplates([{
 id: 'tpl1', name: 'Basic Welcome Template', subject: 'Welcome!', body: '<p>Hello, {{name}}!</p><p>Welcome aboard.</p>', isPrebuilt: true
 },
 {
 id: 'tpl2', name: 'Newsletter Template', subject: 'Latest News', body: '<p>Hi,</p><p>Here is the latest news.</p>', isPrebuilt: false
 }
    ]);
    setIsLoading(false);
  };

  const fetchContacts = async () => {
    setIsLoading(true);
    // Replace with actual API call to fetch individual contacts if needed
    await new Promise(resolve => setTimeout(resolve, 1000));
 setContacts([
 { id: 'c1', name: 'John Doe', email: 'john.doe@example.com' },
 { id: 'c2', name: 'Jane Smith', email: 'jane.smith@anotherdomain.com' },
 { id: 'c3', name: 'Peter Jones', email: 'peter.jones@example.com' },
 { id: 'c4', name: 'Alice Brown', email: 'alice.brown@example.com' },
 { id: 'c5', name: 'Bob Green', email: 'bob.green@anotherdomain.com' }
 ]);
    setIsLoading(false);
  };

  const fetchContacts = async () => {
    setIsLoading(true);
    // Replace with actual API call to fetch contacts
 await new Promise(resolve => setTimeout(resolve, 1000));
 setContactLists([
 { id: 'list1', name: 'All Contacts', contacts: [
 { id: 'c4', name: 'Alice Brown', email: 'alice.brown@example.com' },
 { id: 'c5', name: 'Bob Green', email: 'bob.green@anotherdomain.com' }
 ] },
    ]);
    setIsLoading(false);
  };

 const createCampaign = async (campaignData: Omit<Campaign, 'id' | 'status' | 'sentAt' | 'stats'>) => {
    setIsLoading(true);
    try {
      // Replace with actual API call to create a campaign
 await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      const newCampaignResponse: Campaign = { id: Date.now().toString(), ...campaignData, status: 'Draft', sentAt: null, stats: { sent: 0, opened: 0, clicked: 0, bounced: 0 } };
      setCampaigns([...campaigns, newCampaignResponse]);
 toast({ title: 'Success', description: 'Campaign created successfully.' });
      setIsCreateCampaignModalOpen(false);
 setNewCampaign({ name: '', subject: '', body: '', templateId: '', emailAccountId: '', contactListId: '' });
      setSelectedContacts([]);
    } catch (error) {
      toast({ title: 'Failed to create campaign.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const initiateSendCampaign = (campaignId: string) => {
    setCampaignToSendId(campaignId);
    setIsSendConfirmModalOpen(true);
  };

  const sendCampaign = async () => {
    if (!campaignToSendId) return;

    setIsSendConfirmModalOpen(false); // Close confirmation modal
    setIsLoading(true);

    // Find the campaign to get its associated contact list and contacts
    const campaignToSent = campaigns.find(camp => camp.id === campaignToSendId);
    const contactList = contactLists.find(list => list.id === campaignToSent?.contactListId);
    const contactIdsToSend = contactList?.contacts.map(contact => contact.id) || [];

    try {
      // Update status to Sending immediately
      setCampaigns(campaigns.map(camp => camp.id === campaignToSendId ? { ...camp, status: 'Sending' } : camp));

      // Replace with actual API call to send a campaign
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call

      // Simulate success: update status to Sent and add sentAt date
      setCampaigns(campaigns.map(camp => camp.id === campaignToSendId ? { ...camp, status: 'Sent', sentAt: new Date().toISOString() } : camp));
      toast({ title: 'Campaign sending initiated.' });
    } catch (error) {
      // Simulate failure: update status to Failed
      setCampaigns(campaigns.map(camp => camp.id === campaignToSendId ? { ...camp, status: 'Failed' } : camp));
      toast({ title: 'Failed to send campaign.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
    fetchEmailAccounts();
    fetchEmailTemplates();
    fetchContacts(); // Fetch individual contacts
 fetchContacts(); // Fetch contact lists
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewCampaign({ ...newCampaign, [name]: value });
  };

  const handleTemplateSelect = (templateId: string) => {
    const selectedTemplate = emailTemplates.find(tpl => tpl.id === templateId);
    if (selectedTemplate) { // Only update subject and body if a template is selected
      setNewCampaign({ ...newCampaign, templateId: templateId, templateName: selectedTemplate.name, subject: selectedTemplate.subject, body: selectedTemplate.body });
    } else { // Clear template selection
      setNewCampaign({ ...newCampaign, templateId: undefined, templateName: '', subject: '', body: '' });
    }
  };

 const handleContactListSelect = (contactListId: string) => {
 setNewCampaign({ ...newCampaign, contactListId });
 const selectedList = contactLists.find(list => list.id === contactListId);
 if (selectedList) {
 setSelectedContacts(selectedList.contacts.map(contact => contact.id));
 } else {
 setSelectedContacts([]);
 }
 };
  const handleContactSelect = (contactId: string) => {
    setSelectedContacts(prev =>
      prev.includes(contactId) ? prev.filter(id => id !== contactId) : [...prev, contactId]
    );
  };

  const handleCreateCampaign = () => {
    if (!newCampaign.name || !newCampaign.subject || !newCampaign.body || !newCampaign.emailAccountId || !newCampaign.contactListId || selectedContacts.length === 0) {
 toast({ title: 'Validation Error', description: 'Please fill in all required fields and select a contact list with contacts.', variant: 'destructive' });
      return;
    }
    // Include selectedContacts in the campaign creation data
    createCampaign({...newCampaign, contacts: selectedContacts });
  };


  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-semibold mb-4">Email Campaigns</h1>

      <div className="flex justify-end mb-4">
        <Dialog open={isCreateCampaignModalOpen} onOpenChange={setIsCreateCampaignModalOpen}>
          <DialogTrigger asChild>
            <Button>Create New Campaign</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create New Email Campaign</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Campaign Name
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={newCampaign.name}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="emailAccount" className="text-right">
                  Sending Account
                </Label>
                <Select onValueChange={(value) => setNewCampaign({ ...newCampaign, emailAccountId: value })} value={newCampaign.emailAccountId}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select an email account" />
                  </SelectTrigger>
                  <SelectContent>
                    {emailAccounts.map(account => (
 <SelectItem key={account.id} value={account.id}>{account.email} {account.domainVerified ? '(Verified)' : '(Unverified)'}
 </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="template" className="text-right">
 Template (Optional)
                </Label>
                <Select onValueChange={handleTemplateSelect} value={newCampaign.templateId}>
                  <SelectTrigger className="col-span-3" id="template">
                    <SelectValue placeholder="Select a template (Optional)" />
                  </SelectTrigger>
                  <SelectContent>
 {emailTemplates.map(template => (
                      <SelectItem key={template.id} value={template.id}>{template.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="subject" className="text-right">
                  Subject
                </Label>
                <Input
                  id="subject"
                  name="subject"
                  value={newCampaign.subject}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="body" className="text-right">
                  Body
                </Label>
                <Textarea
                  id="body"
                  name="body"
                  value={newCampaign.body}
                  onChange={handleInputChange}
                  className="col-span-3 h-40"
                />
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label className="text-right">
 Contact List
                </Label>
                <Select onValueChange={handleContactListSelect} value={newCampaign.contactListId}>
                  <SelectTrigger className="col-span-3" id="contactList">
                    <SelectValue placeholder="Select a contact list" />
                  </SelectTrigger>
                  <SelectContent>
                    {contactLists.map(list => (
                      <SelectItem key={list.id} value={list.id}>{list.name} ({list.contacts.length} contacts)</SelectItem>

 )})}
                </Select>
              </div>

              {/* Display selected contacts for confirmation (Optional) */}
              {newCampaign.contactListId && contactLists.find(list => list.id === newCampaign.contactListId)?.contacts.length > 0 && (
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label className="text-right">
 Selected Contacts
                  </Label>
                  <div className="col-span-3 max-h-32 overflow-y-auto border rounded-md p-2">
                    {contactLists.find(list => list.id === newCampaign.contactListId)?.contacts.map(contact => (
                      <div key={contact.id} className="flex items-center gap-2">
                        <Checkbox checked={selectedContacts.includes(contact.id)} onCheckedChange={() => handleContactSelect(contact.id)} />
                        <span>{contact.name} ({contact.email})</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleCreateCampaign} disabled={isLoading}>
                {isLoading ? <LoadingSpinner /> : 'Create Campaign'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex justify-center"><LoadingSpinner /></div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Campaign Name</TableHead>
 <TableHead>Subject</TableHead>
 <TableHead>Status</TableHead>
 <TableHead>Sent At</TableHead>
              <TableHead>Sender</TableHead>
 <TableHead>Contact List</TableHead>
 <TableHead>Stats</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Sent At</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {campaigns.length === 0 && <TableRow><TableCell colSpan={8} className="text-center">No campaigns found.</TableCell></TableRow>}
            {campaigns.map(campaign => (
              <TableRow key={campaign.id}>
                <TableCell className="font-medium">{campaign.name}</TableCell>
                <TableCell>{campaign.subject}</TableCell>
 <TableCell>
 <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      campaign.status === 'Sent' ? 'bg-green-100 text-green-800' :
                      campaign.status === 'Draft' ? 'bg-gray-100 text-gray-800' :
                      campaign.status === 'Sending' ? 'bg-blue-100 text-blue-800' :
                      campaign.status === 'Failed' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
 {campaign.status}
 </span>
 </TableCell>
                <TableCell>{campaign.sentAt ? new Date(campaign.sentAt).toLocaleString() : '-'}</TableCell>
                <TableCell>{emailAccounts.find(acc => acc.id === campaign.emailAccountId)?.email || 'N/A'}</TableCell>
 <TableCell>{contactLists.find(list => list.id === campaign.contactListId)?.name || 'N/A'}</TableCell>
 <TableCell>
 {campaign.stats ? (
 <div>
 <div>Sent: {campaign.stats.sent}</div>
 <div>Opened: {campaign.stats.opened}</div>
 <div>Clicked: {campaign.stats.clicked}</div>
 </div>
 ) : '-'}
 </TableCell>
                <TableCell>
 {campaign.status === 'Draft' || campaign.status === 'Failed' ? (
 <Button variant="outline" size="sm" onClick={() => initiateSendCampaign(campaign.id)} disabled={isLoading}>Send</Button>
 ) : (
 <Button variant="outline" size="sm" disabled>Send</Button>
 )}
                   {/* Add more actions like Edit, View, Delete */}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Send Confirmation Dialog */}
      <Dialog open={isSendConfirmModalOpen} onOpenChange={setIsSendConfirmModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Sending Campaign</DialogTitle>
          </DialogHeader>
          <div>
            Are you sure you want to send this campaign? This action cannot be undone.
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSendConfirmModalOpen(false)}>Cancel</Button>
            <Button onClick={sendCampaign} disabled={isLoading}>
              {isLoading ? <LoadingSpinner /> : 'Send Campaign'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EmailCampaignsPage;
 <TableHead>Stats</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {campaigns.length === 0 && <TableRow><TableCell colSpan={8} className="text-center">No campaigns found.</TableCell></TableRow>}
            {campaigns.map(campaign => (
              <TableRow key={campaign.id}>
                <TableCell className="font-medium">{campaign.name}</TableCell>
                <TableCell>{campaign.subject}</TableCell>
                <TableCell>{campaign.status}</TableCell>
                <TableCell>{campaign.sentAt ? new Date(campaign.sentAt).toLocaleString() : '-'}</TableCell>
                <TableCell>{emailAccounts.find(acc => acc.id === campaign.emailAccountId)?.email || 'N/A'}</TableCell>
 <TableCell>{contactLists.find(list => list.id === campaign.contactListId)?.name || 'N/A'}</TableCell>
 <TableCell>
 <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      campaign.status === 'Sent' ? 'bg-green-100 text-green-800' :
                      campaign.status === 'Draft' ? 'bg-gray-100 text-gray-800' :
                      campaign.status === 'Sending' ? 'bg-blue-100 text-blue-800' :
                      campaign.status === 'Failed' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
 {campaign.status}
 </span>
 </TableCell>
 <TableCell>{campaign.sentAt ? new Date(campaign.sentAt).toLocaleString() : '-'}</TableCell>
 <TableCell>
 {campaign.stats ? (
 <div>
 <div>Sent: {campaign.stats.sent}</div>
 <div>Opened: {campaign.stats.opened}</div>
 <div>Clicked: {campaign.stats.clicked}</div>
 </div>
 ) : '-'}
 </TableCell>
                <TableCell>
                   {/* Add more actions like Edit, View, Delete */}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default EmailCampaignsPage;