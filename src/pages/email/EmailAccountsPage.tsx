import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Mail, 
  Trash, 
  MoreVertical, 
  Plus, 
  Loader2, 
  Check, 
  AlertTriangle,
  RefreshCw,
  Send,
  Mailbox,
  Server
} from 'lucide-react';
import { EmailAccount, EmailAccountType } from '@/types/email';
import { 
  getEmailAccounts, 
  createEmailAccount, 
  deleteEmailAccount, 
  testEmailConnection,
  sendTestEmail
} from '@/services/email';
import { Link } from 'react-router-dom';

const EmailAccountsPage = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('accounts');
  
  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false);
  const [isSendTestEmailOpen, setIsSendTestEmailOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<EmailAccount | null>(null);
  const [testEmailRecipient, setTestEmailRecipient] = useState('');
  const [isSendingTestEmail, setIsSendingTestEmail] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  
  const [accountName, setAccountName] = useState('');
  const [email, setEmail] = useState('');
  const [accountType, setAccountType] = useState<EmailAccountType>('IMAP');
  const [host, setHost] = useState('');
  const [port, setPort] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [secure, setSecure] = useState(true);
  const [smtpHost, setSmtpHost] = useState('');
  const [smtpPort, setSmtpPort] = useState('');
  const [smtpUsername, setSmtpUsername] = useState('');
  const [smtpPassword, setSmtpPassword] = useState('');
  const [smtpSecure, setSmtpSecure] = useState(true);
  
  const { data: accounts = [], isLoading } = useQuery({
    queryKey: ['emailAccounts'],
    queryFn: getEmailAccounts
  });
  
  const createMutation = useMutation({
    mutationFn: createEmailAccount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emailAccounts'] });
      resetForm();
      setIsAddAccountOpen(false);
      toast({
        title: "Account Added",
        description: "Email account has been added successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add the email account.",
        variant: "destructive",
      });
    }
  });
  
  const deleteMutation = useMutation({
    mutationFn: deleteEmailAccount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emailAccounts'] });
      toast({
        title: "Account Removed",
        description: "Email account has been removed.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to remove the email account.",
        variant: "destructive",
      });
    }
  });
  
  const resetForm = () => {
    setAccountName('');
    setEmail('');
    setAccountType('IMAP');
    setHost('');
    setPort('');
    setUsername('');
    setPassword('');
    setSecure(true);
    setTestResult(null);
    setSmtpHost('');
    setSmtpPort('');
    setSmtpUsername('');
    setSmtpPassword('');
    setSmtpSecure(true);
  };
  
  const handleAddAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!testResult?.success) {
      toast({
        title: "Test Connection First",
        description: "Please test the connection before adding the account.",
        variant: "destructive",
      });
      return;
    }
    
    const numPort = parseInt(port, 10);
    const numSmtpPort = parseInt(smtpPort, 10);
    
    if (isNaN(numPort) || isNaN(numSmtpPort)) {
      toast({
        title: "Invalid Port",
        description: "Please enter valid port numbers.",
        variant: "destructive",
      });
      return;
    }
    
    createMutation.mutate({
      name: accountName,
      email,
      type: accountType,
      host,
      port: numPort,
      username,
      password,
      secure,
      smtp_host: smtpHost,
      smtp_port: numSmtpPort,
      smtp_username: smtpUsername,
      smtp_password: smtpPassword,
      smtp_secure: smtpSecure
    });
  };
  
  const testConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    
    const numPort = parseInt(port, 10);
    if (isNaN(numPort)) {
      setTestResult({ success: false, message: "Please enter a valid port number." });
      setIsTesting(false);
      return;
    }
    
    try {
      const result = await testEmailConnection({
        id: 'temp-id',
        type: accountType,
        host,
        port: numPort,
        username,
        password,
        email,
        secure
      });
      
      setTestResult(result);
    } catch (error) {
      setTestResult({
        success: false,
        message: error instanceof Error ? error.message : "Unknown error occurred"
      });
    } finally {
      setIsTesting(false);
    }
  };
  
  const handleSendTestEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedAccount) {
      toast({
        title: "Error",
        description: "No account selected for sending test email.",
        variant: "destructive",
      });
      return;
    }
    
    if (!testEmailRecipient) {
      toast({
        title: "Missing Recipient",
        description: "Please enter a recipient email address.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSendingTestEmail(true);
    
    try {
      const result = await sendTestEmail(selectedAccount, testEmailRecipient);
      
      if (result.success) {
        toast({
          title: "Test Email Sent",
          description: result.message,
        });
        setIsSendTestEmailOpen(false);
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
        description: error instanceof Error ? error.message : "Unknown error sending test email",
        variant: "destructive",
      });
    } finally {
      setIsSendingTestEmail(false);
    }
  };
  
  const handleDeleteAccount = (id: string) => {
    if (window.confirm("Are you sure you want to delete this email account?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleAccountClick = (account: EmailAccount) => {
    setSelectedAccount(account);
    setIsSendTestEmailOpen(true);
  };

  const handleTestExistingConnection = async (account: EmailAccount) => {
    setIsTesting(true);
    setTestResult(null);
    
    try {
      const result = await testEmailConnection({
        id: account.id,
        type: account.type,
        host: account.host,
        port: account.port,
        username: account.username,
        password: account.password,
        email: account.email,
        secure: account.secure
      });
      
      setTestResult(result);
      
      if (result.success) {
        toast({
          title: "Connection Test Successful",
          description: result.message,
        });
      } else {
        toast({
          title: "Connection Test Failed",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsTesting(false);
    }
  };

  const openSendTestEmailDialog = (account: EmailAccount) => {
    setSelectedAccount(account);
    setTestEmailRecipient('');
    setIsSendTestEmailOpen(true);
  };
  
  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Email Accounts</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your email integrations</p>
        </div>
        <Button onClick={() => setIsAddAccountOpen(true)}>
          <Plus className="h-4 w-4 mr-2" /> Add Email Account
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Gmail Integration Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mailbox className="h-5 w-5 text-red-500" /> Gmail Integration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 mb-4">
              Connect your Gmail account for seamless email integration.
            </p>
            <Button className="w-full" variant="outline">
              Connect Gmail
            </Button>
          </CardContent>
        </Card>

        {/* IMAP/POP3 Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5 text-blue-500" /> IMAP/POP3
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 mb-4">
              Add any email account using IMAP or POP3 protocol.
            </p>
            <Button className="w-full" variant="outline" onClick={() => setIsAddAccountOpen(true)}>
              Add Account
            </Button>
          </CardContent>
        </Card>

        {/* Third-party Integrations Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-green-500" /> Third-party Services
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 mb-4">
              Connect with popular email service providers.
            </p>
            <Button className="w-full" variant="outline">
              View Integrations
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Connected Accounts List */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Connected Accounts</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : accounts.length === 0 ? (
            <div className="text-center py-8">
              <Mail className="h-12 w-12 mx-auto text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No email accounts</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by adding your first email account.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {accounts.map((account) => (
                <div
                  key={account.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`h-3 w-3 rounded-full ${
                      account.status === 'connected' ? 'bg-green-500' :
                      account.status === 'disconnected' ? 'bg-red-500' :
                      'bg-yellow-500'
                    }`} />
                    <div>
                      <h3 className="font-medium">{account.name}</h3>
                      <p className="text-sm text-gray-500">{account.email}</p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openSendTestEmailDialog(account)}>
                        <Send className="h-4 w-4 mr-2" /> Send Test Email
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDeleteAccount(account.id)}>
                        <Trash className="h-4 w-4 mr-2" /> Delete Account
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Account Dialog */}
      <Dialog open={isAddAccountOpen} onOpenChange={setIsAddAccountOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Email Account</DialogTitle>
            <DialogDescription>
              Add a new email account to send campaigns.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddAccount} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="accountName">Account Name</Label>
                <Input
                  id="accountName"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  placeholder="My Work Email"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@domain.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="accountType">Account Type</Label>
                <select
                  id="accountType"
                  value={accountType}
                  onChange={(e) => setAccountType(e.target.value as EmailAccountType)}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="IMAP">IMAP</option>
                  <option value="POP3">POP3</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="host">Server Host</Label>
                <Input
                  id="host"
                  value={host}
                  onChange={(e) => setHost(e.target.value)}
                  placeholder="imap.domain.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="port">Port</Label>
                <Input
                  id="port"
                  type="number"
                  value={port}
                  onChange={(e) => setPort(e.target.value)}
                  placeholder="993"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="username"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="secure"
                  checked={secure}
                  onCheckedChange={setSecure}
                />
                <Label htmlFor="secure">Use SSL/TLS</Label>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t">
              <h3 className="text-lg font-medium">SMTP Settings (Outgoing Mail)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="smtpHost">SMTP Server</Label>
                  <Input
                    id="smtpHost"
                    value={smtpHost}
                    onChange={(e) => setSmtpHost(e.target.value)}
                    placeholder="smtp.example.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtpPort">SMTP Port</Label>
                  <Input
                    id="smtpPort"
                    type="number"
                    value={smtpPort}
                    onChange={(e) => setSmtpPort(e.target.value)}
                    placeholder="587"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtpUsername">SMTP Username</Label>
                  <Input
                    id="smtpUsername"
                    value={smtpUsername}
                    onChange={(e) => setSmtpUsername(e.target.value)}
                    placeholder="username@example.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtpPassword">SMTP Password</Label>
                  <Input
                    id="smtpPassword"
                    type="password"
                    value={smtpPassword}
                    onChange={(e) => setSmtpPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="smtpSecure"
                    checked={smtpSecure}
                    onCheckedChange={setSmtpSecure}
                  />
                  <Label htmlFor="smtpSecure">Use SSL/TLS</Label>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={testConnection}
                disabled={isTesting}
              >
                {isTesting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Check className="h-4 w-4 mr-2" />
                )}
                Test Connection
              </Button>
              {testResult && (
                <div className={`text-sm ${
                  testResult.success ? 'text-green-500' : 'text-red-500'
                }`}>
                  {testResult.message}
                </div>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddAccountOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={!testResult?.success}>
                Add Account
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Send Test Email Dialog */}
      <Dialog open={isSendTestEmailOpen} onOpenChange={setIsSendTestEmailOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Send Test Email</DialogTitle>
            <DialogDescription>
              Send a test email to verify the account configuration.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSendTestEmail} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="testEmailRecipient">Recipient Email</Label>
              <Input
                id="testEmailRecipient"
                type="email"
                value={testEmailRecipient}
                onChange={(e) => setTestEmailRecipient(e.target.value)}
                placeholder="recipient@example.com"
                required
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsSendTestEmailOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSendingTestEmail}>
                {isSendingTestEmail ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                Send Test Email
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default EmailAccountsPage;
