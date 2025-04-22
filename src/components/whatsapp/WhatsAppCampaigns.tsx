import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { fetchCampaigns, createCampaign, sendCampaign } from '../../api/whatsappApi';
import { Card, Button, Badge } from '@radix-ui/themes';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface Campaign {
  id: string;
  name: string;
  message: string;
  status: 'scheduled' | 'sent' | 'failed';
  scheduledAt?: string;
}

const WhatsAppCampaigns: React.FC = () => {
  const [newName, setNewName] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');

  const { data: campaigns, refetch } = useQuery<Campaign[]>({
    queryKey: ['whatsappCampaigns'],
    queryFn: fetchCampaigns,
  });

  const createMutation = useMutation({
    mutationFn: ({ name, message, scheduledAt }: { name: string; message: string; scheduledAt?: string }) => createCampaign(name, message, scheduledAt),
    onSuccess: () => {
      setNewName(''); setNewMessage(''); setScheduledAt(''); refetch();
    },
  });

  const sendMutation = useMutation({
    mutationFn: (id: string) => sendCampaign(id),
    onSuccess: () => refetch(),
  });

  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <h2>WhatsApp Campaigns</h2>
      <Card style={{ marginBottom: 16 }}>
        <Input placeholder="Campaign Name" value={newName} onChange={e => setNewName(e.target.value)} style={{ marginBottom: 8 }} />
        <Textarea placeholder="Message Content" value={newMessage} onChange={e => setNewMessage(e.target.value)} style={{ marginBottom: 8 }} />
        <Input type="datetime-local" value={scheduledAt} onChange={e => setScheduledAt(e.target.value)} style={{ marginBottom: 8 }} />
        <Button onClick={() => createMutation.mutate({ name: newName, message: newMessage, scheduledAt })} disabled={!newName || !newMessage}>Create Campaign</Button>
      </Card>
      {campaigns?.map(camp => (
        <Card key={camp.id} style={{ marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <strong>{camp.name}</strong> <Badge color={camp.status === 'sent' ? 'green' : camp.status === 'scheduled' ? 'yellow' : 'red'}>{camp.status}</Badge>
            </div>
            <div>
              {camp.status === 'scheduled' && <Button size="1" onClick={() => sendMutation.mutate(camp.id)}>Send Now</Button>}
            </div>
          </div>
          <div style={{ marginTop: 8 }}>{camp.message}</div>
          {camp.scheduledAt && <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>Scheduled for: {camp.scheduledAt}</div>}
        </Card>
      ))}
    </div>
  );
};

export default WhatsAppCampaigns;
