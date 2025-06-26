
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { EmailAccount } from '@/types/email';

interface EmailAccountFormProps {
  initialData?: EmailAccount;
  onSubmit: (data: EmailAccount) => void;
  onCancel: () => void;
}

export function EmailAccountForm({ initialData, onSubmit, onCancel }: EmailAccountFormProps) {
  const [formData, setFormData] = useState<Partial<EmailAccount>>(
    initialData || {
      email: '',
      name: '',
      type: 'smtp',
      host: '',
      port: 587,
      username: '',
      secure: true,
      smtp_secure: true,
      is_active: true,
      is_default: false,
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData as EmailAccount);
  };

  const handleInputChange = (field: keyof EmailAccount, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            value={formData.email || ''}
            onChange={(e) => handleInputChange('email', e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="name">Display Name</Label>
          <Input
            id="name"
            value={formData.name || ''}
            onChange={(e) => handleInputChange('name', e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="host">SMTP Host</Label>
          <Input
            id="host"
            value={formData.host || ''}
            onChange={(e) => handleInputChange('host', e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="port">SMTP Port</Label>
          <Input
            id="port"
            type="number"
            value={formData.port || 587}
            onChange={(e) => handleInputChange('port', parseInt(e.target.value))}
            required
          />
        </div>
        <div>
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            value={formData.username || ''}
            onChange={(e) => handleInputChange('username', e.target.value)}
            required
          />
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            id="secure"
            checked={formData.secure || false}
            onCheckedChange={(checked) => handleInputChange('secure', checked)}
          />
          <Label htmlFor="secure">Use SSL/TLS</Label>
        </div>
      </div>
      
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {initialData ? 'Update' : 'Create'} Account
        </Button>
      </div>
    </form>
  );
}
