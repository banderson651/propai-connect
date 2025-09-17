import * as React from 'react';
import { useState } from 'react';
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
  Server,
  Stethoscope
} from 'lucide-react';
import { EmailAccount } from '@/types/email';
import { 
  getEmailAccounts, 
  createEmailAccount, 
  deleteEmailAccount, 
  testEmailConnection,
  sendTestEmail
} from '@/services/email/index';
import { Link } from 'react-router-dom';
import { EmailDiagnostics } from '@/components/email/EmailDiagnostics';
import { useAuth } from '@/contexts/AuthContext';

const EmailAccountsPage = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('accounts');
  
  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false);
  const [isSendTestEmailOpen, setIsSendTestEmailOpen] = useState(false);
  const [isDiagnosticsOpen, setIsDiagnosticsOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<EmailAccount | null>(null);
  const [testEmailRecipient, setTestEmailRecipient] = useState('');
  const [isSendingTestEmail, setIsSendingTestEmail] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  
  const [email, setEmail] = useState('');
  const [smtpHost, setSmtpHost] = useState('');
  const [smtpPort, setSmtpPort] = useState('');
  const [smtpUser, setSmtpUser] = useState('');
  const [smtpPass, setSmtpPass] = useState('');
  const [domainVerified, setDomainVerified] = useState(false);
  
  const { data: accounts, isLoading, error } = useQuery<EmailAccount[]>({
    queryKey: ['emailAccounts'],
    queryFn: getEmailAccounts,
  });
  
  const createMutation = useMutation({
    mutationFn: createEmailAccount,
    onSuccess: (newAccount) => {
      console.log('New account created successfully:', newAccount);
      queryClient.invalidateQueries({ queryKey: ['emailAccounts'] });
      resetForm();
      setIsAddAccountOpen(false);
      toast({
        title: "Account Added",
        description: "Email account has been added successfully.",
      });
    },
    onError: (error: Error) => {
      console.error('Error creating account:', error);
      toast({
        title: "Error",
        description: `Failed to add the email account: ${error.message}`,
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
    setEmail('');
    setSmtpHost('');
    setSmtpPort('');
    setSmtpUser('');
    setSmtpPass('');
    setDomainVerified(false);
    setTestResult(null);
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
    
    const numSmtpPort = parseInt(smtpPort, 10);
    
    if (isNaN(numSmtpPort)) {
      toast({
        title: "Invalid Port",
        description: "Please enter a valid port number.",
        variant: "destructive",
      });
      return;
    }
    
    // Prepare account data matching the backend expectation
    const accountDataToSend = {
      email,
      name: email,
      type: 'smtp' as const,
      host: smtpHost,
      port: numSmtpPort,
      username: smtpUser,
      secure: true,
      smtp_secure: true,
      is_active: true,
      is_default: false,
      status: 'active' as const,
      domain_verified: domainVerified,
      smtpPass,
    };
    
    // Ensure user_id is available before mutating
    if (!user?.id) {
      toast({
        title: "Authentication Error",
        description: "User not authenticated. Cannot add account.",
        variant: "destructive",
      });
      return;
    }

    createMutation.mutate(accountDataToSend);
  };
  
  const testConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    
    const numSmtpPort = parseInt(smtpPort, 10);
    if (isNaN(numSmtpPort)) {
      setTestResult({ success: false, message: "Please enter a valid SMTP port number." });
      setIsTesting(false);
      return;
    }
    
    try {
      // Send full account data to backend for testing new account
      const testAccount = {
        email,
        host: smtpHost,
        port: numSmtpPort,
        username: smtpUser,
        smtpPass,
        secure: true, // Assuming secure is true for common SMTP ports
      };
      
      const result = await testEmailConnection(testAccount);
      
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
      // Send only account ID and recipient to backend
      const result = await sendTestEmail({ id: selectedAccount.id }, testEmailRecipient);
      
      if (result.success) {
        toast({
          title: "Test Email Sent",
          description: result.message,
        });
        setIsSendTestEmailOpen(false);
        setTestEmailRecipient('');
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
      deleteMutation.mutate(id as any);
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
      // Send only account ID to backend for testing existing account
      const result = await testEmailConnection({ id: account.id });
      
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
  
  const openDiagnosticsDialog = (account: EmailAccount) => {
    setSelectedAccount(account);
    setIsDiagnosticsOpen(true);
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

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Connected Accounts</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="text-red-500 text-center py-4">
              Failed to load email accounts: {error.message}
              <pre style={{whiteSpace: 'pre-wrap', wordBreak: 'break-all', fontSize: 12, color: 'red'}}>
                {JSON.stringify(error, null, 2)}
              </pre>
            </div>
          )}
          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : !Array.isArray(accounts) || accounts.length === 0 ? (
            <div className="text-center py-8">
              <Mail className="h-12 w-12 mx-auto text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No email accounts</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by adding your first email account.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {Array.isArray(accounts) && accounts.map((account) => (
                <div
                  key={account.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`h-3 w-3 rounded-full ${
                      account.domain_verified ? 'bg-green-500' : 'bg-yellow-500'
                    }`} />
                    <div>
                      <h3 className="font-medium">{account.email}</h3>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openDiagnosticsDialog(account)}>
                        <Stethoscope className="h-4 w-4 mr-2" /> Run Diagnostics
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
                <Label htmlFor="smtpUser">SMTP Username</Label>
                <Input
                  id="smtpUser"
                  value={smtpUser}
                  onChange={(e) => setSmtpUser(e.target.value)}
                  placeholder="username@example.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="smtpPass">SMTP Password</Label>
                <Input
                  id="smtpPass"
                  type="password"
                  value={smtpPass}
                  onChange={(e) => setSmtpPass(e.target.value)}
                  required
                />
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
      
      <Dialog open={isDiagnosticsOpen} onOpenChange={setIsDiagnosticsOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Email Diagnostics</DialogTitle>
            <DialogDescription>
              Run comprehensive diagnostics on your email configuration
            </DialogDescription>
          </DialogHeader>
          
          {selectedAccount && (
            <EmailDiagnostics 
              account={selectedAccount}
              onSuccess={() => {
                queryClient.invalidateQueries({ queryKey: ['emailAccounts'] });
              }}
              onError={(error) => {
                toast({
                  title: "Diagnostics Failed",
                  description: error,
                  variant: "destructive"
                });
              }}
            />
          )}
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsDiagnosticsOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default EmailAccountsPage;
