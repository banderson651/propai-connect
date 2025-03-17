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
  RefreshCw
} from 'lucide-react';
import { EmailAccount, EmailAccountType } from '@/types/email';
import { 
  getEmailAccounts, 
  createEmailAccount, 
  deleteEmailAccount, 
  testEmailConnection 
} from '@/services/emailService';
import { Link } from 'react-router-dom';

const EmailAccountsPage = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('accounts');
  
  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false);
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
    if (isNaN(numPort)) {
      toast({
        title: "Invalid Port",
        description: "Please enter a valid port number.",
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
      secure
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
  
  const handleDeleteAccount = (id: string) => {
    if (window.confirm("Are you sure you want to delete this email account?")) {
      deleteMutation.mutate(id);
    }
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'text-green-500';
      case 'disconnected': return 'text-gray-500';
      case 'error': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };
  
  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Email Management</h1>
          <p className="text-sm text-gray-500 mt-1">Connect and manage your email accounts for campaigns</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setIsAddAccountOpen(true)}>
            <Plus className="h-4 w-4 mr-1" /> Add Email Account
          </Button>
        </div>
      </div>
      
      <Tabs 
        defaultValue="accounts" 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="grid grid-cols-3 gap-2 w-full max-w-md">
          <TabsTrigger value="accounts">Email Accounts</TabsTrigger>
          <TabsTrigger value="templates">
            <Link to="/email/templates" className="flex w-full h-full items-center justify-center">
              Templates
            </Link>
          </TabsTrigger>
          <TabsTrigger value="campaigns">
            <Link to="/email" className="flex w-full h-full items-center justify-center">
              Campaigns
            </Link>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="accounts" className="space-y-4">
          {isLoading ? (
            <div className="text-center py-12">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-400" />
              <p className="mt-2 text-gray-500">Loading email accounts...</p>
            </div>
          ) : accounts.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent className="pt-6">
                <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Email Accounts</h3>
                <p className="text-gray-500 mb-4">
                  Connect your email accounts to start creating campaigns.
                </p>
                <Button onClick={() => setIsAddAccountOpen(true)}>
                  <Plus className="h-4 w-4 mr-1" /> Add Email Account
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {accounts.map((account: EmailAccount) => (
                <Card key={account.id} className="overflow-hidden">
                  <CardHeader className="p-5 pb-0">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg truncate">{account.name}</CardTitle>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleDeleteAccount(account.id)}>
                            <Trash className="h-4 w-4 mr-2 text-red-500" />
                            <span className="text-red-500">Delete Account</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent className="p-5">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Email:</span>
                        <span className="text-sm font-medium truncate max-w-[180px]">{account.email}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Type:</span>
                        <span className="text-sm font-medium">{account.type}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Status:</span>
                        <span className={`text-sm font-medium ${getStatusColor(account.status)}`}>
                          {account.status.charAt(0).toUpperCase() + account.status.slice(1)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Last Checked:</span>
                        <span className="text-sm">
                          {new Date(account.lastChecked).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      <Dialog open={isAddAccountOpen} onOpenChange={setIsAddAccountOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Add Email Account</DialogTitle>
            <DialogDescription>
              Connect your email account to send campaigns.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleAddAccount}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="account-name">Account Name</Label>
                  <Input
                    id="account-name"
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    placeholder="My Email Account"
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
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Account Type</Label>
                <div className="flex gap-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="imap"
                      value="IMAP"
                      checked={accountType === 'IMAP'}
                      onChange={() => setAccountType('IMAP')}
                    />
                    <Label htmlFor="imap">IMAP</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="pop3"
                      value="POP3"
                      checked={accountType === 'POP3'}
                      onChange={() => setAccountType('POP3')}
                    />
                    <Label htmlFor="pop3">POP3</Label>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="host">Host Server</Label>
                  <Input
                    id="host"
                    value={host}
                    onChange={(e) => setHost(e.target.value)}
                    placeholder="mail.example.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="port">Port</Label>
                  <Input
                    id="port"
                    value={port}
                    onChange={(e) => setPort(e.target.value)}
                    placeholder={accountType === 'IMAP' ? "993" : "110"}
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="username or email"
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
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-2 pt-2">
                <Switch 
                  id="secure" 
                  checked={secure}
                  onCheckedChange={setSecure}
                />
                <Label htmlFor="secure">Use secure connection (SSL/TLS)</Label>
              </div>
              
              {testResult && (
                <div className={`p-3 rounded-md ${testResult.success ? 'bg-green-50' : 'bg-red-50'}`}>
                  <div className="flex items-center">
                    {testResult.success ? (
                      <Check className="h-5 w-5 text-green-500 mr-2" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                    )}
                    <p className={`text-sm ${testResult.success ? 'text-green-700' : 'text-red-700'}`}>
                      {testResult.message}
                    </p>
                  </div>
                </div>
              )}
            </div>
            
            <DialogFooter className="flex space-x-2 justify-end">
              <Button 
                type="button" 
                variant="outline" 
                onClick={testConnection}
                disabled={isTesting || !host || !port || !username || !password}
              >
                {isTesting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Test Connection
                  </>
                )}
              </Button>
              <Button 
                type="submit" 
                disabled={createMutation.isPending || !testResult?.success || !accountName || !email}
              >
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    Adding...
                  </>
                ) : (
                  'Add Account'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default EmailAccountsPage;
