import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { fetchChannels, addChannel, editChannel, deleteChannel, fetchChannelStats } from '../../api/whatsappApi';
import { Card, Button, Badge } from '@radix-ui/themes';

interface Channel {
  id: string;
  name: string;
  number: string;
  status: string;
  qualityScore: string;
  messageLimit: string;
  balance: string;
  twoFA: boolean;
}

const WhatsAppChannels: React.FC = () => {
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState<string | null>(null);
  const [showStats, setShowStats] = useState<string | null>(null);

  const { data: channels, refetch } = useQuery<Channel[]>({
    queryKey: ['whatsappChannels'],
    queryFn: fetchChannels,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteChannel(id),
    onSuccess: () => refetch(),
  });

  const filtered = channels?.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <input placeholder="Search Channel By Name..." value={search} onChange={e => setSearch(e.target.value)} style={{ padding: 8, width: 300 }} />
        <Button onClick={() => setShowAdd(true)}>+ Add New Channel</Button>
      </div>
      {filtered?.map(channel => (
        <Card key={channel.id} style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <strong>{channel.name}</strong> <span style={{ color: '#888' }}>{channel.number}</span>
              <div style={{ marginTop: 8 }}>
                <Badge color={channel.status === 'FLAGGED' ? 'red' : 'green'}>{channel.status}</Badge>{' '}
                <Badge color={channel.qualityScore === 'RED' ? 'red' : channel.qualityScore === 'YELLOW' ? 'yellow' : 'green'}>{channel.qualityScore}</Badge>{' '}
                <Badge>{channel.messageLimit} users/day</Badge>{' '}
                <Badge>{channel.twoFA ? '2FA: Yes' : '2FA: No'}</Badge>{' '}
                <Badge>Balance: {channel.balance}</Badge>
              </div>
            </div>
            <div>
              <Button size="1" variant="soft" color="blue" onClick={() => setShowStats(channel.id)}>Stats</Button>{' '}
              <Button size="1" variant="soft" color="gray" onClick={() => setShowEdit(channel.id)}>Edit</Button>{' '}
              <Button size="1" variant="soft" color="red" onClick={() => deleteMutation.mutate(channel.id)}>Delete</Button>
            </div>
          </div>
        </Card>
      ))}
      {/* Modals for Add/Edit/Stats would go here */}
      {showAdd && <div>Add Channel Modal (to implement)</div>}
      {showEdit && <div>Edit Channel Modal for {showEdit} (to implement)</div>}
      {showStats && <div>Stats Modal for {showStats} (to implement)</div>}
    </div>
  );
};

export default WhatsAppChannels;
