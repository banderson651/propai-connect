import React, { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import {
  getEmailAccounts,
  getEmailTemplates,
  getEmailCampaigns,
  createEmailCampaign,
  dispatchEmailCampaign,
  pauseEmailCampaign,
  resumeEmailCampaign,
  scheduleEmailCampaign,
  getEmailCampaignAnalytics,
  type CreateCampaignPayload,
} from '@/services/email';
import { getContacts } from '@/services/contactService';
import { Contact } from '@/types/contact';
import { Campaign, CampaignAnalytics, CampaignSendSettings, EmailTemplate } from '@/types/email';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { format } from 'date-fns';
import { Calendar, LineChart, Pause, Play, Plus, Send } from 'lucide-react';

const DEFAULT_SEND_SETTINGS: CampaignSendSettings = {
  batchSize: 50,
  intervalSeconds: 60,
  hourlyCap: null,
  dailyCap: null,
};

interface NewCampaignFormState {
  name: string;
  subject: string;
  emailAccountId: string;
  templateId: string | null;
  fromName: string;
  replyTo: string;
  htmlBody: string;
  textBody: string;
  scheduledAt: string;
  sendSettings: CampaignSendSettings;
  selectedContactIds: string[];
}

const EMPTY_FORM: NewCampaignFormState = {
  name: '',
  subject: '',
  emailAccountId: '',
  templateId: null,
  fromName: '',
  replyTo: '',
  htmlBody: '',
  textBody: '',
  scheduledAt: '',
  sendSettings: DEFAULT_SEND_SETTINGS,
  selectedContactIds: [],
};

const formatRate = (value: number) => `${(value * 100).toFixed(1)}%`;

export const EmailCampaignsContent: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [campaignForScheduling, setCampaignForScheduling] = useState<Campaign | null>(null);
  const [campaignForAnalytics, setCampaignForAnalytics] = useState<Campaign | null>(null);
  const [analytics, setAnalytics] = useState<CampaignAnalytics | null>(null);
  const [formState, setFormState] = useState<NewCampaignFormState>(EMPTY_FORM);

  const { data: emailAccounts = [], isLoading: isLoadingAccounts } = useQuery({
    queryKey: ['emailAccounts'],
    queryFn: getEmailAccounts,
  });

  const { data: templates = [], isLoading: isLoadingTemplates } = useQuery({
    queryKey: ['emailTemplates'],
    queryFn: getEmailTemplates,
  });

  const { data: contacts = [], isLoading: isLoadingContacts } = useQuery({
    queryKey: ['contacts'],
    queryFn: getContacts,
  });

  const {
    data: campaigns = [],
    isLoading: isLoadingCampaigns,
    isFetching: isRefetchingCampaigns,
  } = useQuery({
    queryKey: ['emailCampaigns'],
    queryFn: getEmailCampaigns,
  });

  const createCampaignMutation = useMutation({
    mutationFn: (payload: CreateCampaignPayload) => createEmailCampaign(payload),
    onSuccess: (campaign) => {
      queryClient.invalidateQueries({ queryKey: ['emailCampaigns'] });
      toast({
        title: 'Campaign Created',
        description: `"${campaign.name}" was created${campaign.status === 'scheduled' ? ' and scheduled.' : '.'}`,
      });
      setFormState(EMPTY_FORM);
      setIsCreateOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to Create Campaign',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const dispatchCampaignMutation = useMutation({
    mutationFn: (campaignId: string) => dispatchEmailCampaign(campaignId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emailCampaigns'] });
      toast({ title: 'Dispatch Started', description: 'Campaign is being dispatched.' });
    },
    onError: (error: Error) => {
      toast({ title: 'Dispatch Failed', description: error.message, variant: 'destructive' });
    },
  });

  const pauseCampaignMutation = useMutation({
    mutationFn: (campaignId: string) => pauseEmailCampaign(campaignId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emailCampaigns'] });
      toast({ title: 'Campaign Paused', description: 'Campaign sending was paused.' });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to Pause Campaign', description: error.message, variant: 'destructive' });
    },
  });

  const resumeCampaignMutation = useMutation({
    mutationFn: (campaignId: string) => resumeEmailCampaign(campaignId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emailCampaigns'] });
      toast({ title: 'Campaign Resumed', description: 'Campaign sending resumed.' });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to Resume Campaign', description: error.message, variant: 'destructive' });
    },
  });

  const scheduleCampaignMutation = useMutation({
    mutationFn: ({ id, scheduledAt }: { id: string; scheduledAt: string }) => scheduleEmailCampaign(id, scheduledAt),
    onSuccess: (campaign) => {
      queryClient.invalidateQueries({ queryKey: ['emailCampaigns'] });
      setIsScheduleOpen(false);
      toast({
        title: 'Campaign Scheduled',
        description: `Scheduled for ${campaign.scheduledAt ? format(new Date(campaign.scheduledAt), 'PPpp') : 'later'}.`,
      });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to Schedule Campaign', description: error.message, variant: 'destructive' });
    },
  });

  const selectedContacts = useMemo(() => {
    if (!formState.selectedContactIds.length) return [] as Contact[];
    const idSet = new Set(formState.selectedContactIds);
    return contacts.filter((contact) => idSet.has(contact.id));
  }, [contacts, formState.selectedContactIds]);

  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find((tpl) => tpl.id === templateId);
    setFormState((prev) => ({
      ...prev,
      templateId,
      subject: template ? template.subject : prev.subject,
      htmlBody: template ? (template.htmlBody || template.body) : prev.htmlBody,
      textBody: template?.textBody || prev.textBody,
    }));
  };

  const handleContactToggle = (contactId: string) => {
    setFormState((prev) => {
      const set = new Set(prev.selectedContactIds);
      if (set.has(contactId)) {
        set.delete(contactId);
      } else {
        set.add(contactId);
      }
      return { ...prev, selectedContactIds: Array.from(set) };
    });
  };

  const resetForm = () => setFormState(EMPTY_FORM);

  const handleCreateCampaign = () => {
    if (!formState.emailAccountId) {
      toast({ title: 'Sender Required', description: 'Select an email account to send from.', variant: 'destructive' });
      return;
    }
    if (!formState.name.trim()) {
      toast({ title: 'Name Required', description: 'Give your campaign a name.', variant: 'destructive' });
      return;
    }
    if (!formState.subject.trim()) {
      toast({ title: 'Subject Required', description: 'Provide a subject line.', variant: 'destructive' });
      return;
    }
    if (!formState.htmlBody.trim()) {
      toast({ title: 'Body Required', description: 'Add email content before creating.', variant: 'destructive' });
      return;
    }
    if (!selectedContacts.length) {
      toast({ title: 'Recipients Required', description: 'Choose at least one contact.', variant: 'destructive' });
      return;
    }

    const recipients = selectedContacts.map((contact) => ({
      contactId: contact.id,
      email: contact.email,
      name: contact.name,
      substitutionData: {
        name: contact.name,
        email: contact.email,
      },
    }));

    const payload: CreateCampaignPayload = {
      name: formState.name,
      subject: formState.subject,
      emailAccountId: formState.emailAccountId,
      templateId: formState.templateId,
      fromName: formState.fromName || undefined,
      replyTo: formState.replyTo || undefined,
      htmlBody: formState.htmlBody,
      textBody: formState.textBody || undefined,
      scheduledAt: formState.scheduledAt ? new Date(formState.scheduledAt).toISOString() : undefined,
      sendSettings: formState.sendSettings,
      recipients,
    };

    createCampaignMutation.mutate(payload);
  };

  const openScheduleDialog = (campaign: Campaign) => {
    setCampaignForScheduling(campaign);
    setFormState((prev) => ({ ...prev, scheduledAt: campaign.scheduledAt || '' }));
    setIsScheduleOpen(true);
  };

  const openAnalyticsDialog = async (campaign: Campaign) => {
    setCampaignForAnalytics(campaign);
    setIsAnalyticsOpen(true);
    try {
      const analyticsData = await getEmailCampaignAnalytics(campaign.id);
      setAnalytics(analyticsData);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load analytics';
      toast({ title: 'Analytics Error', description: message, variant: 'destructive' });
    }
  };

  const renderMetric = (label: string, value: number | string) => (
    <div className="flex flex-col">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Email Campaigns</h1>
          <p className="text-sm text-gray-500 mt-1">Create, schedule, and monitor promotional campaigns</p>
        </div>
        <Button onClick={() => { resetForm(); setIsCreateOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" /> New Campaign
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-medium">Campaign Overview</CardTitle>
          {isRefetchingCampaigns && <span className="text-xs text-muted-foreground">Refreshing…</span>}
        </CardHeader>
        <CardContent>
          {isLoadingCampaigns ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner />
            </div>
          ) : campaigns.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-sm text-muted-foreground">No campaigns yet. Create one to get started.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Sender</TableHead>
                  <TableHead>Recipients</TableHead>
                  <TableHead>Performance</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campaigns.map((campaign) => {
                  const accountEmail = emailAccounts.find((acc) => acc.id === campaign.emailAccountId)?.email || 'Unknown';
                  const totals = campaign.metrics;
                  return (
                    <TableRow key={campaign.id}>
                      <TableCell className="font-medium">{campaign.name}</TableCell>
                      <TableCell className="capitalize">{campaign.status}</TableCell>
                      <TableCell>{accountEmail}</TableCell>
                      <TableCell>{campaign.totalRecipients}</TableCell>
                      <TableCell>
                        <div className="flex gap-4">
                          {renderMetric('Sent', totals.sent)}
                          {renderMetric('Opened', totals.opened)}
                          {renderMetric('Clicked', totals.clicked)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => openAnalyticsDialog(campaign)}>
                            <LineChart className="h-4 w-4 mr-1" /> Analytics
                          </Button>
                          {campaign.status === 'paused' ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => resumeCampaignMutation.mutate(campaign.id)}
                              disabled={resumeCampaignMutation.isPending}
                            >
                              <Play className="h-4 w-4 mr-1" /> Resume
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => pauseCampaignMutation.mutate(campaign.id)}
                              disabled={pauseCampaignMutation.isPending}
                            >
                              <Pause className="h-4 w-4 mr-1" /> Pause
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openScheduleDialog(campaign)}
                          >
                            <Calendar className="h-4 w-4 mr-1" /> Schedule
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => dispatchCampaignMutation.mutate(campaign.id)}
                            disabled={dispatchCampaignMutation.isPending}
                          >
                            <Send className="h-4 w-4 mr-1" /> Send Now
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Create Campaign</DialogTitle>
            <DialogDescription>Configure sender, content, and recipients for this campaign.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-h-[70vh] overflow-y-auto pr-2">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  value={formState.name}
                  onChange={(event) => setFormState((prev) => ({ ...prev, name: event.target.value }))}
                  placeholder="Spring Promo"
                />
              </div>
              <div className="space-y-2">
                <Label>Sender Account</Label>
                <Select
                  value={formState.emailAccountId}
                  onValueChange={(value) => setFormState((prev) => ({ ...prev, emailAccountId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={isLoadingAccounts ? 'Loading...' : 'Select account'} />
                  </SelectTrigger>
                  <SelectContent>
                    {emailAccounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>From Name (optional)</Label>
                  <Input
                    value={formState.fromName}
                    onChange={(event) => setFormState((prev) => ({ ...prev, fromName: event.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Reply To (optional)</Label>
                  <Input
                    value={formState.replyTo}
                    onChange={(event) => setFormState((prev) => ({ ...prev, replyTo: event.target.value }))}
                    placeholder="reply@example.com"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Template (optional)</Label>
                <Select
                  value={formState.templateId ?? ''}
                  onValueChange={(value) => handleTemplateSelect(value || '')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={isLoadingTemplates ? 'Loading...' : 'Select template'} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No template</SelectItem>
                    {templates.map((template: EmailTemplate) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Subject</Label>
                <Input
                  value={formState.subject}
                  onChange={(event) => setFormState((prev) => ({ ...prev, subject: event.target.value }))}
                  placeholder="Big updates inside"
                />
              </div>
              <div className="space-y-2">
                <Label>HTML Content</Label>
                <Textarea
                  className="min-h-[160px]"
                  value={formState.htmlBody}
                  onChange={(event) => setFormState((prev) => ({ ...prev, htmlBody: event.target.value }))}
                  placeholder="<p>Hello {{name}},</p>"
                />
              </div>
              <div className="space-y-2">
                <Label>Plain Text (optional)</Label>
                <Textarea
                  className="min-h-[120px]"
                  value={formState.textBody}
                  onChange={(event) => setFormState((prev) => ({ ...prev, textBody: event.target.value }))}
                  placeholder="Hello {{name}},"
                />
              </div>
              <div className="space-y-2">
                <Label>Schedule (optional)</Label>
                <Input
                  type="datetime-local"
                  value={formState.scheduledAt}
                  onChange={(event) => setFormState((prev) => ({ ...prev, scheduledAt: event.target.value }))}
                />
                <p className="text-xs text-muted-foreground">
                  Leave empty to keep as draft and send manually.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Batch Size</Label>
                  <Input
                    type="number"
                    min={1}
                    max={500}
                    value={formState.sendSettings.batchSize}
                    onChange={(event) =>
                      setFormState((prev) => ({
                        ...prev,
                        sendSettings: { ...prev.sendSettings, batchSize: Number(event.target.value) },
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Interval (seconds)</Label>
                  <Input
                    type="number"
                    min={10}
                    max={3600}
                    value={formState.sendSettings.intervalSeconds}
                    onChange={(event) =>
                      setFormState((prev) => ({
                        ...prev,
                        sendSettings: { ...prev.sendSettings, intervalSeconds: Number(event.target.value) },
                      }))
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Hourly Cap</Label>
                  <Input
                    type="number"
                    min={1}
                    value={formState.sendSettings.hourlyCap ?? ''}
                    onChange={(event) =>
                      setFormState((prev) => ({
                        ...prev,
                        sendSettings: {
                          ...prev.sendSettings,
                          hourlyCap: event.target.value ? Number(event.target.value) : null,
                        },
                      }))
                    }
                    placeholder="Unlimited"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Daily Cap</Label>
                  <Input
                    type="number"
                    min={1}
                    value={formState.sendSettings.dailyCap ?? ''}
                    onChange={(event) =>
                      setFormState((prev) => ({
                        ...prev,
                        sendSettings: {
                          ...prev.sendSettings,
                          dailyCap: event.target.value ? Number(event.target.value) : null,
                        },
                      }))
                    }
                    placeholder="Unlimited"
                  />
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Recipients</h3>
                <div className="border rounded-md max-h-[360px] overflow-y-auto p-2 space-y-2">
                  {isLoadingContacts ? (
                    <div className="flex items-center justify-center py-4">
                      <LoadingSpinner />
                    </div>
                  ) : contacts.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No contacts available.</p>
                  ) : (
                    contacts.map((contact: Contact) => (
                      <label key={contact.id} className="flex items-center gap-3 text-sm">
                        <Checkbox
                          checked={formState.selectedContactIds.includes(contact.id)}
                          onCheckedChange={() => handleContactToggle(contact.id)}
                        />
                        <span>
                          <span className="font-medium">{contact.name || contact.email}</span>
                          <span className="block text-xs text-muted-foreground">{contact.email}</span>
                        </span>
                      </label>
                    ))
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Placeholders available: <code>{'{{name}}'}</code>, <code>{'{{email}}'}</code>
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateCampaign} disabled={createCampaignMutation.isPending}>
              {createCampaignMutation.isPending ? 'Creating…' : 'Create Campaign'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isScheduleOpen} onOpenChange={setIsScheduleOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule Campaign</DialogTitle>
            <DialogDescription>
              Choose when the campaign should begin sending.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Scheduled for</Label>
              <Input
                type="datetime-local"
                value={formState.scheduledAt}
                onChange={(event) => setFormState((prev) => ({ ...prev, scheduledAt: event.target.value }))}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Campaign: <span className="font-medium">{campaignForScheduling?.name}</span>
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsScheduleOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!campaignForScheduling || !formState.scheduledAt) {
                  toast({
                    title: 'Schedule Required',
                    description: 'Pick a date and time to schedule.',
                    variant: 'destructive',
                  });
                  return;
                }
                scheduleCampaignMutation.mutate({
                  id: campaignForScheduling.id,
                  scheduledAt: new Date(formState.scheduledAt).toISOString(),
                });
              }}
              disabled={scheduleCampaignMutation.isPending}
            >
              {scheduleCampaignMutation.isPending ? 'Scheduling…' : 'Schedule'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isAnalyticsOpen} onOpenChange={setIsAnalyticsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Campaign Analytics</DialogTitle>
            <DialogDescription>
              {campaignForAnalytics ? `Performance for ${campaignForAnalytics.name}` : 'Campaign metrics'}
            </DialogDescription>
          </DialogHeader>
          {analytics ? (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Totals</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {renderMetric('Recipients', analytics.totals.recipients)}
                  {renderMetric('Sent', analytics.totals.sent)}
                  {renderMetric('Opened', analytics.totals.opened)}
                  {renderMetric('Clicked', analytics.totals.clicked)}
                  {renderMetric('Bounced', analytics.totals.bounced)}
                  {renderMetric('Failed', analytics.totals.failed)}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Rates</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {renderMetric('Delivery Rate', formatRate(analytics.rates.deliveryRate))}
                  {renderMetric('Open Rate', formatRate(analytics.rates.openRate))}
                  {renderMetric('Click Rate', formatRate(analytics.rates.clickRate))}
                  {renderMetric('Bounce Rate', formatRate(analytics.rates.bounceRate))}
                  {renderMetric('Failure Rate', formatRate(analytics.rates.failureRate))}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  {analytics.timeline.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No events logged yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {analytics.timeline.map((entry) => (
                        <div key={entry.date} className="flex flex-col border rounded-md p-3">
                          <span className="text-sm font-medium">{entry.date}</span>
                          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mt-2">
                            {Object.entries(entry.counts).map(([eventType, value]) => (
                              <span key={eventType}>{eventType}: {value}</span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner />
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAnalyticsOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

const EmailCampaignsPage: React.FC = () => (
  <DashboardLayout pageTitle="Email Campaigns">
    <EmailCampaignsContent />
  </DashboardLayout>
);

export default EmailCampaignsPage;
