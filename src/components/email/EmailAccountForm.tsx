import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function EmailAccountForm({ open, onOpenChange, onAccountAdded }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAccountAdded: (account: any) => void;
}) {
  const [form, setForm] = useState({
    host: '',
    port: 587,
    secure: false,
    username: '',
    password: '',
    from: '',
  });
  const [loading, setLoading] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleTest = async () => {
    setLoading(true);
    setTestResult(null);
    try {
      const res = await fetch('http://localhost:4001/api/email/test-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      setTestResult(data.success ? 'Connection successful!' : data.message);
    } catch (e) {
      setTestResult('Error connecting to server.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setTestResult(null);
    try {
      const res = await fetch('http://localhost:4001/api/email/add-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      setTestResult(data.success ? 'Account saved!' : data.message);
      if (data.success) {
        onAccountAdded(form);
        onOpenChange(false);
      }
    } catch (e) {
      setTestResult('Error saving account.');
    } finally {
      setLoading(false);
    }
  };

  // Auto-set secure=true if port is 465
  const handlePortBlur = () => {
    setForm(f => ({ ...f, secure: String(f.port) === '465' }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Email Account</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>SMTP Host</Label>
            <Input name="host" value={form.host} onChange={handleChange} placeholder="smtp.example.com" />
          </div>
          <div>
            <Label>SMTP Port</Label>
            <Input name="port" type="number" value={form.port} onChange={handleChange} onBlur={handlePortBlur} />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" name="secure" checked={form.secure} onChange={handleChange} id="secure" />
            <Label htmlFor="secure">Use SSL/TLS (check for port 465)</Label>
          </div>
          <div>
            <Label>Username</Label>
            <Input name="username" value={form.username} onChange={handleChange} />
          </div>
          <div>
            <Label>Password</Label>
            <Input name="password" type="password" value={form.password} onChange={handleChange} />
          </div>
          <div>
            <Label>From Email</Label>
            <Input name="from" value={form.from} onChange={handleChange} placeholder="me@example.com" />
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <Button variant="outline" onClick={handleTest} disabled={loading}>Test Connection</Button>
          <Button onClick={handleSave} disabled={loading}>Save Account</Button>
        </div>
        {testResult && <div className="mt-3 text-sm text-center text-gray-600">{testResult}</div>}
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
