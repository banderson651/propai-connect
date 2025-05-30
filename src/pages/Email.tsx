
import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Mail } from 'lucide-react';
import emailService from '@/services/email/emailService';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function Email() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    to: '',
    subject: '',
    message: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await emailService.sendEmail({
        to: formData.to,
        subject: formData.subject,
        text: formData.message,
      });

      toast({
        title: 'Success',
        description: 'Email sent successfully',
      });

      // Reset form
      setFormData({
        to: '',
        subject: '',
        message: '',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to send email',
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
          <h1 className="text-3xl font-bold text-slate-900">Email Campaigns</h1>
          <p className="text-slate-600 mt-2">Send emails to your contacts and leads.</p>
        </div>

        <Alert className="mb-6 bg-blue-50 border-blue-200">
          <Mail className="h-5 w-5 text-blue-600" />
          <AlertTitle className="text-blue-800">Powered by Resend</AlertTitle>
          <AlertDescription className="text-blue-700">
            Emails are now sent using your verified custom domain vamkor.com for improved deliverability and brand consistency.
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Send Email Form */}
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-xl text-slate-900">Send Email</CardTitle>
              <CardDescription>Compose and send an email to any recipient</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="to" className="text-slate-700">To</Label>
                  <Input
                    id="to"
                    type="email"
                    placeholder="recipient@example.com"
                    value={formData.to}
                    onChange={(e) => setFormData({ ...formData, to: e.target.value })}
                    required
                    className="border-slate-200"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject" className="text-slate-700">Subject</Label>
                  <Input
                    id="subject"
                    type="text"
                    placeholder="Enter email subject"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    required
                    className="border-slate-200"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message" className="text-slate-700">Message</Label>
                  <Textarea
                    id="message"
                    placeholder="Enter your message"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                    className="border-slate-200 min-h-[200px]"
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
                      Sending...
                    </>
                  ) : (
                    'Send Email'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Email Settings */}
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-xl text-slate-900">Email Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 mb-4">
                Your verified custom domain vamkor.com is configured for sending emails through Resend.
              </p>
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full border-slate-200"
                  onClick={() => window.location.href = '/settings'}
                >
                  Configure Email Settings
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full border-slate-200"
                  onClick={() => window.location.href = '/email/accounts'}
                >
                  Manage Email Accounts
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
