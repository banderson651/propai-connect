import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { fetchTemplates, createTemplate, updateTemplate, deleteTemplate } from '../../api/whatsappApi';
import { Card, Button, Badge } from '@radix-ui/themes';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface Template {
  id: string;
  name: string;
  content: string;
  status: 'approved' | 'pending' | 'rejected';
}

const WhatsAppTemplates: React.FC = () => {
  const [newName, setNewName] = useState('');
  const [newContent, setNewContent] = useState('');
  const [editing, setEditing] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  const { data: templates, refetch } = useQuery<Template[]>({
    queryKey: ['whatsappTemplates'],
    queryFn: fetchTemplates,
  });

  const createMutation = useMutation({
    mutationFn: ({ name, content }: { name: string; content: string }) => createTemplate(name, content),
    onSuccess: () => {
      setNewName(''); setNewContent(''); refetch();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, content }: { id: string; content: string }) => updateTemplate(id, content),
    onSuccess: () => { setEditing(null); setEditContent(''); refetch(); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteTemplate(id),
    onSuccess: () => refetch(),
  });

  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <h2>WhatsApp Templates</h2>
      <Card style={{ marginBottom: 16 }}>
        <Input placeholder="Template Name" value={newName} onChange={e => setNewName(e.target.value)} style={{ marginBottom: 8 }} />
        <Textarea placeholder="Message Content" value={newContent} onChange={e => setNewContent(e.target.value)} style={{ marginBottom: 8 }} />
        <Button onClick={() => createMutation.mutate({ name: newName, content: newContent })} disabled={!newName || !newContent}>Create Template</Button>
      </Card>
      {templates?.map(tmpl => (
        <Card key={tmpl.id} style={{ marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <strong>{tmpl.name}</strong> <Badge color={tmpl.status === 'approved' ? 'green' : tmpl.status === 'pending' ? 'yellow' : 'red'}>{tmpl.status}</Badge>
            </div>
            <div>
              <Button size="1" variant="soft" color="red" onClick={() => deleteMutation.mutate(tmpl.id)}>Delete</Button>
            </div>
          </div>
          {editing === tmpl.id ? (
            <div>
              <Textarea value={editContent} onChange={e => setEditContent(e.target.value)} style={{ marginTop: 8 }} />
              <Button onClick={() => updateMutation.mutate({ id: tmpl.id, content: editContent })} style={{ marginTop: 4 }}>Save</Button>
              <Button onClick={() => setEditing(null)} style={{ marginTop: 4, marginLeft: 8 }}>Cancel</Button>
            </div>
          ) : (
            <div style={{ marginTop: 8 }}>{tmpl.content}</div>
          )}
          {editing !== tmpl.id && (
            <Button size="1" variant="soft" color="blue" onClick={() => { setEditing(tmpl.id); setEditContent(tmpl.content); }} style={{ marginTop: 4 }}>Edit</Button>
          )}
        </Card>
      ))}
    </div>
  );
};

export default WhatsAppTemplates;
