
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Mail, 
  Plus, 
  AlertTriangle, 
  CheckCircle, 
  Server, 
  Trash, 
  RefreshCw, 
  Edit, 
  Send,
  Loader2,
  Info
} from 'lucide-react';
import { EmailAccount, EmailAccountType } from '@/types/email';
import { 
  getEmailAccounts, 
  createEmailAccount, 
  deleteEmailAccount, 
  updateEmailAccount, 
  testEmailConnection,
  sendTestEmail
} from '@/services/emailService';
import { useToast } from '@/hooks/use-toast';

const EmailAccountsPage = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('accounts');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isTestDialogOpen, setIsTestDialogOpen] = useState(false);
  const [testingAccount, setTestingAccount] = useState<EmailAccount | null>(null);
  const [testEmailRecipient, setTestEmailRecipient] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [isTestingSend, setIsTestingSend] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [connectionError, setConnectionError] = useState('');
  
  const [newAccount, setNewAccount] = useState({
    name: '',
    email: '',
    type: 'IMAP' as EmailAccountType,
    host: '',
    port: 993,
    username: '',
    password: '',
  });

  const { 
    data: accounts = [], 
    isLoading, 
    refetch 
  } = useQuery({
    queryKey: ['emailAccounts'],
    queryFn: getEmailAccounts
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewAccount(prev => ({
      ...prev,
      [name]: name === 'port' ? Number(value) : value
    }));
    // Clear any previous connection error when user makes changes
    if (connectionError) setConnectionError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setConnectionError('');
    
    try {
      await createEmailAccount(newAccount);
      setIsAddDialogOpen(false);
      refetch();
      toast({
        title: "Email Account Added",
        description: "Your email account has been successfully connected.",
      });
      // Reset form
      setNewAccount({
        name: '',
        email: '',
        type: 'IMAP',
        host: '',
        port: 993,
        username: '',
        password: '',
      });
    } catch (error) {
      console.error("Email connection error:", error);
      setConnectionError(error.message || "Failed to connect to email server. Please check your settings.");
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to connect to email server. Please check your settings.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAccount = async (id: string) => {
    try {
      await deleteEmailAccount(id);
      refetch();
      toast({
        title: "Account Removed",
        description: "The email account has been successfully removed.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove email account. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRefreshAccount = async (id: string) => {
    const account = accounts.find(acc => acc.id === id);
    if (!account) return;
    
    try {
      setIsTesting(true);
      const result = await testEmailConnection(account);
      
      if (result.success) {
        await updateEmailAccount(id, {
          status: 'connected',
          lastChecked: new Date().toISOString()
        });
        toast({
          title: "Connection Refreshed",
          description: "The email account connection has been verified.",
        });
      } else {
        await updateEmailAccount(id, {
          status: 'error',
          lastChecked: new Date().toISOString()
        });
        toast({
          title: "Connection Failed",
          description: result.message,
          variant: "destructive",
        });
      }
      
      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to refresh connection. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleTestConnection = async () => {
    if (!testingAccount) return;
    
    setIsTesting(true);
    try {
      const result = await testEmailConnection(testingAccount);
      if (result.success) {
        toast({
          title: "Connection Successful",
          description: result.message,
        });
      } else {
        toast({
          title: "Connection Failed",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred while testing the connection.",
        variant: "destructive",
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSendTestEmail = async () => {
    if (!testingAccount || !testEmailRecipient) return;

    setIsTestingSend(true);
    try {
      const result = await sendTestEmail(testingAccount.id, testEmailRecipient);
      if (result.success) {
        toast({
          title: "Test Email Sent",
          description: result.message,
        });
      } else {
        toast({
          title: "Failed to Send Test Email",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred while sending the test email.",
        variant: "destructive",
      });
    } finally {
      setIsTestingSend(false);
    }
  };

  const openTestDialog = (account: EmailAccount) => {
    setTestingAccount(account);
    setIsTestDialogOpen(true);
  };

  // Helper function to suggest IMAP settings based on email domain
  const suggestEmailSettings = () => {
    if (!newAccount.email) return;
    
    const domain = newAccount.email.split('@')[1]?.toLowerCase();
    if (!domain) return;
    
    // Common email providers
    if (domain === 'gmail.com') {
      setNewAccount(prev => ({
        ...prev,
        host: 'imap.gmail.com',
        port: 993,
        username: prev.email,
      }));
      toast({
        title: "Gmail Detected",
        description: "For Gmail, you may need to enable 'Less secure app access' or create an app password if you have 2FA enabled.",
      });
    } else if (domain === 'outlook.com' || domain === 'hotmail.com' || domain === 'live.com') {
      setNewAccount(prev => ({
        ...prev,
        host: 'outlook.office365.com',
        port: 993,
        username: prev.email,
      }));
    } else if (domain === 'yahoo.com' || domain === 'ymail.com') {
      setNewAccount(prev => ({
        ...prev,
        host: 'imap.mail.yahoo.com',
        port: 993,
        username: prev.email,
      }));
    }
  };

  // Helper function to render status badge
  const renderStatusBadge = (status: EmailAccount['status']) => {
    switch (status) {
      case 'connected':
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1">
            <CheckCircle className="h-3 w-3" /> Connected
          </Badge>
        );
      case 'error':
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" /> Error
          </Badge>
        );
      case 'disconnected':
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" /> Disconnected
          </Badge>
        );
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Email Accounts</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your connected email accounts</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-1" /> Connect Email
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Connect Email Account</DialogTitle>
                <DialogDescription>
                  Connect your IMAP/POP3 email account to send campaigns.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="name" className="text-right text-sm font-medium">
                      Account Name
                    </label>
                    <Input
                      id="name"
                      name="name"
                      value={newAccount.name}
                      onChange={handleInputChange}
                      className="col-span-3"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="email" className="text-right text-sm font-medium">
                      Email Address
                    </label>
                    <div className="col-span-3 relative">
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={newAccount.email}
                        onChange={handleInputChange}
                        onBlur={suggestEmailSettings}
                        className="pr-8"
                        required
                      />
                      {newAccount.email && (
                        <button
                          type="button"
                          onClick={suggestEmailSettings}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                          title="Auto-detect settings"
                        >
                          <Info className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="type" className="text-right text-sm font-medium">
                      Server Type
                    </label>
                    <select
                      id="type"
                      name="type"
                      value={newAccount.type}
                      onChange={handleInputChange}
                      className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      required
                    >
                      <option value="IMAP">IMAP</option>
                      <option value="POP3">POP3</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="host" className="text-right text-sm font-medium">
                      Server Host
                    </label>
                    <Input
                      id="host"
                      name="host"
                      value={newAccount.host}
                      onChange={handleInputChange}
                      placeholder="e.g., imap.gmail.com"
                      className="col-span-3"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="port" className="text-right text-sm font-medium">
                      Server Port
                    </label>
                    <Input
                      id="port"
                      name="port"
                      type="number"
                      value={newAccount.port}
                      onChange={handleInputChange}
                      placeholder="993 for IMAP, 995 for POP3"
                      className="col-span-3"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="username" className="text-right text-sm font-medium">
                      Username
                    </label>
                    <Input
                      id="username"
                      name="username"
                      value={newAccount.username}
                      onChange={handleInputChange}
                      placeholder="Usually your full email address"
                      className="col-span-3"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="password" className="text-right text-sm font-medium">
                      Password
                    </label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      value={newAccount.password}
                      onChange={handleInputChange}
                      className="col-span-3"
                      required
                    />
                  </div>
                  
                  {connectionError && (
                    <div className="col-span-4 bg-red-50 border border-red-200 rounded-md p-3 text-red-700 text-sm">
                      <div className="flex items-start">
                        <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium">Connection Error:</p>
                          <p>{connectionError}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      "Connect Account"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Test Email Connection Dialog */}
      <Dialog open={isTestDialogOpen} onOpenChange={setIsTestDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Test Email Connection</DialogTitle>
            <DialogDescription>
              Verify your email account connection and send a test email
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-6">
            <div className="space-y-4">
              <div className="border rounded-md p-4 bg-gray-50">
                <h3 className="font-medium mb-2">Account Details</h3>
                {testingAccount && (
                  <div className="space-y-1">
                    <p className="text-sm">
                      <span className="font-medium">Name:</span> {testingAccount.name}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Email:</span> {testingAccount.email}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Server:</span> {testingAccount.host}:{testingAccount.port} ({testingAccount.type})
                    </p>
                  </div>
                )}
              </div>
              
              <div>
                <Button 
                  onClick={handleTestConnection} 
                  disabled={isTesting}
                  className="w-full"
                >
                  {isTesting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Testing Connection...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Test Connection
                    </>
                  )}
                </Button>
              </div>
              
              <div className="pt-4 border-t">
                <h3 className="font-medium mb-2">Send Test Email</h3>
                <div className="space-y-3">
                  <div>
                    <label htmlFor="testEmailRecipient" className="block text-sm font-medium mb-1">
                      Recipient Email
                    </label>
                    <Input
                      id="testEmailRecipient"
                      type="email"
                      value={testEmailRecipient}
                      onChange={(e) => setTestEmailRecipient(e.target.value)}
                      placeholder="recipient@example.com"
                    />
                  </div>
                  <Button 
                    onClick={handleSendTestEmail} 
                    disabled={isTestingSend || !testEmailRecipient}
                    className="w-full"
                  >
                    {isTestingSend ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Send Test Email
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTestDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Tabs 
        defaultValue="accounts" 
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
          <TabsTrigger value="accounts">Email Accounts</TabsTrigger>
          <TabsTrigger value="templates">
            <Link to="/email/templates" className="flex w-full h-full items-center justify-center">
              Templates
            </Link>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="accounts" className="space-y-4">
          {isLoading ? (
            <div className="text-center py-12">
              <p>Loading email accounts...</p>
            </div>
          ) : accounts.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent className="pt-6">
                <Server className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Email Accounts Connected</h3>
                <p className="text-gray-500 mb-4">
                  Connect your IMAP/POP3 email account to start sending campaigns.
                </p>
                <Button onClick={() => setIsAddDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-1" /> Connect Email
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {accounts.map(account => (
                <Card key={account.id}>
                  <CardHeader className="p-5 pb-0">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{account.name}</CardTitle>
                      <div>
                        {renderStatusBadge(account.status)}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-5">
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-medium">{account.email}</p>
                      </div>
                      <div className="flex items-center gap-x-6">
                        <div>
                          <p className="text-sm text-gray-500">Type</p>
                          <p className="font-medium">{account.type}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Server</p>
                          <p className="font-medium">{account.host}:{account.port}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Last Checked</p>
                        <p className="font-medium">
                          {new Date(account.lastChecked).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex space-x-2 pt-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleRefreshAccount(account.id)}
                        >
                          <RefreshCw className="h-4 w-4 mr-1" /> Refresh
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => openTestDialog(account)}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" /> Test
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                        >
                          <Edit className="h-4 w-4 mr-1" /> Edit
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="text-red-500 hover:text-red-700"
                          onClick={() => handleDeleteAccount(account.id)}
                        >
                          <Trash className="h-4 w-4 mr-1" /> Remove
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

export default EmailAccountsPage;
