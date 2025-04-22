import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { EmailAccount } from '@/types/email';

export function SendTestEmailModal({ open, onOpenChange, account }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  account: EmailAccount | null;
}) {
  const [to, setTo] = useState('');
  const [password, setPassword] = useState('');
  const [subject, setSubject] = useState('Test Email from CRM');
  const [body, setBody] = useState('This is a test email to verify your outgoing email setup.');
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!account) return null;

  const handleSend = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch('http://localhost:4001/api/email/send-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          host: account.host,
          port: account.port,
          secure: !!account.smtp_secure,
          username: account.username,
          password,
          from: account.email,
          to,
          subject,
          text: body,
        }),
      });
      const data = await res.json();
      setResult(data.success ? 'Test email sent successfully!' : data.message);
    } catch (e) {
      setResult('Error sending test email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send Test Email</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Recipient Email</Label>
            <Input value={to} onChange={e => setTo(e.target.value)} placeholder="recipient@example.com" />
          </div>
          <div>
            <Label>SMTP Password for this account</Label>
            <Input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="SMTP password" />
          </div>
          <div>
            <Label>Subject</Label>
            <Input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Test Email from CRM" />
          </div>
          <div>
            <Label>Body</Label>
            <textarea value={body} onChange={e => setBody(e.target.value)} rows={4} className="w-full border rounded p-2" />
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <Button onClick={handleSend} disabled={loading || !to || !password}>Send Test Email</Button>
        </div>
        {result && <div className="mt-3 text-sm text-center text-gray-600">{result}</div>}
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
