import React, { useState, useEffect } from 'react';
import { Card, Button, Avatar, Badge } from '@radix-ui/themes';
import { Input } from '@/components/ui/input';
import { useQuery, useMutation } from '@tanstack/react-query';
import { fetchConversations, fetchMessages, sendMessage, assignChat } from '../../api/whatsappApi';

interface Conversation {
  id: string;
  contactName: string;
  contactAvatar?: string;
  lastMessage: string;
  unreadCount: number;
  assignedTo?: string;
}

interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: string;
}

const WhatsAppInbox: React.FC = () => {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [search, setSearch] = useState('');

  const { data: conversations, refetch: refetchConversations } = useQuery<Conversation[]>({
    queryKey: ['whatsappConversations'],
    queryFn: fetchConversations,
  });

  const { data: messages, refetch: refetchMessages } = useQuery<Message[]>({
    queryKey: ['whatsappMessages', selectedConversation],
    queryFn: () => selectedConversation ? fetchMessages(selectedConversation) : Promise.resolve([]),
    enabled: !!selectedConversation,
  });

  const sendMutation = useMutation({
    mutationFn: ({ conversationId, content }: { conversationId: string; content: string }) =>
      sendMessage(conversationId, content),
    onSuccess: () => {
      setMessageInput('');
      refetchMessages();
      refetchConversations();
    },
  });

  const handleSend = () => {
    if (selectedConversation && messageInput.trim()) {
      sendMutation.mutate({ conversationId: selectedConversation, content: messageInput });
    }
  };

  const filteredConversations = conversations?.filter(
    (conv) => conv.contactName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', height: '80vh' }}>
      {/* Sidebar: Conversation List */}
      <div style={{ width: 320, borderRight: '1px solid #eee', padding: 12 }}>
        <Input
          placeholder="Search contacts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ marginBottom: 10 }}
        />
        <div style={{ overflowY: 'auto', height: 'calc(80vh - 50px)' }}>
          {filteredConversations?.map((conv) => (
            <Card
              key={conv.id}
              style={{ marginBottom: 8, cursor: 'pointer', background: selectedConversation === conv.id ? '#f0f6ff' : undefined }}
              onClick={() => setSelectedConversation(conv.id)}
            >
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <Avatar src={conv.contactAvatar} fallback={conv.contactName[0]} />
                <div style={{ marginLeft: 12, flex: 1 }}>
                  <div style={{ fontWeight: 600 }}>{conv.contactName}</div>
                  <div style={{ fontSize: 12, color: '#888' }}>{conv.lastMessage}</div>
                </div>
                {conv.unreadCount > 0 && (
                  <Badge color="blue">{conv.unreadCount}</Badge>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Main: Chat Window */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {selectedConversation ? (
          <>
            <div style={{ flex: 1, overflowY: 'auto', padding: 16, background: '#f9f9f9' }}>
              {messages?.map((msg) => (
                <div key={msg.id} style={{ marginBottom: 12, textAlign: msg.sender === 'me' ? 'right' : 'left' }}>
                  <div
                    style={{
                      display: 'inline-block',
                      padding: 10,
                      borderRadius: 8,
                      background: msg.sender === 'me' ? '#e0f2fe' : '#fff',
                      maxWidth: '70%',
                    }}
                  >
                    <div>{msg.content}</div>
                    <div style={{ fontSize: 10, color: '#bbb', marginTop: 4 }}>{msg.timestamp}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ padding: 12, borderTop: '1px solid #eee', display: 'flex' }}>
              <Input
                placeholder="Type a message..."
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                style={{ flex: 1, marginRight: 8 }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSend();
                }}
              />
              <Button onClick={handleSend} disabled={sendMutation.isPending}>
                Send
              </Button>
            </div>
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888' }}>
            Select a conversation to start chatting
          </div>
        )}
      </div>
    </div>
  );
};

export default WhatsAppInbox;
