import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function Settings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.user_metadata?.name || '',
    email: user?.email || '',
    phone: user?.user_metadata?.phone || '',
    company: user?.user_metadata?.company || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Update user profile in Supabase
      const { error } = await supabase
        .from('profiles')
        .update({
          name: formData.name,
          phone: formData.phone,
          company: formData.company,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user?.id);

      if (error) throw error;

      toast({
        title: 'Profile updated',
        description: 'Your profile has been successfully updated.',
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to update profile. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
          <p className="text-slate-600 mt-2">Manage your account and application settings.</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="bg-white border border-slate-200">
            <TabsTrigger value="profile" className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-600">
              Profile
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="text-xl text-slate-900">Profile Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-slate-700">Name</Label>
                    <Input
                      id="name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Your name"
                      className="border-slate-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-slate-700">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      disabled
                      className="border-slate-200 bg-slate-50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-slate-700">Phone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="Your phone number"
                      className="border-slate-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company" className="text-slate-700">Company</Label>
                    <Input
                      id="company"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      placeholder="Your company name"
                      className="border-slate-200"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-indigo-600 hover:bg-indigo-700"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="email">
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="text-xl text-slate-900">Email Server Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleEmailSettingsSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="smtp_host" className="text-slate-700">SMTP Host</Label>
                    <Input
                      id="smtp_host"
                      type="text"
                      placeholder="smtp.example.com"
                      value={emailSettings.smtp_host}
                      onChange={(e) => setEmailSettings({ ...emailSettings, smtp_host: e.target.value })}
                      required
                      className="border-slate-200"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="smtp_port" className="text-slate-700">SMTP Port</Label>
                    <Input
                      id="smtp_port"
                      type="number"
                      placeholder="587"
                      value={emailSettings.smtp_port}
                      onChange={(e) => setEmailSettings({ ...emailSettings, smtp_port: parseInt(e.target.value) })}
                      required
                      className="border-slate-200"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="smtp_user" className="text-slate-700">SMTP Username</Label>
                    <Input
                      id="smtp_user"
                      type="text"
                      placeholder="your-email@example.com"
                      value={emailSettings.smtp_user}
                      onChange={(e) => setEmailSettings({ ...emailSettings, smtp_user: e.target.value })}
                      required
                      className="border-slate-200"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="smtp_password" className="text-slate-700">SMTP Password</Label>
                    <Input
                      id="smtp_password"
                      type="password"
                      placeholder="••••••••"
                      value={emailSettings.smtp_password}
                      onChange={(e) => setEmailSettings({ ...emailSettings, smtp_password: e.target.value })}
                      required
                      className="border-slate-200"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-indigo-600 hover:bg-indigo-700"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save Email Settings'
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
} 