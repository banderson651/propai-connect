
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
  Edit 
} from 'lucide-react';
import { EmailAccount, EmailAccountType } from '@/types/email';
import { getEmailAccounts, createEmailAccount, deleteEmailAccount, updateEmailAccount } from '@/services/emailService';
import { useToast } from '@/hooks/use-toast';

const EmailAccountsPage = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('accounts');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
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
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
      toast({
        title: "Error",
        description: "Failed to add email account. Please try again.",
        variant: "destructive",
      });
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
    try {
      await updateEmailAccount(id, {
        status: 'connected',
        lastChecked: new Date().toISOString()
      });
      refetch();
      toast({
        title: "Connection Refreshed",
        description: "The email account connection has been refreshed.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to refresh connection. Please try again.",
        variant: "destructive",
      });
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
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={newAccount.email}
                      onChange={handleInputChange}
                      className="col-span-3"
                      required
                    />
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
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Connect Account</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

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
