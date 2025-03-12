
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, Phone, User } from 'lucide-react';
import { useWhatsApp } from '@/contexts/WhatsAppContext';
import { Contact } from '@/types/contact';

// Mock type for chat messages (in a real app, this would be in a types file)
interface ChatMessage {
  id: string;
  contactId: string;
  content: string;
  timestamp: string;
  direction: 'incoming' | 'outgoing';
}

// In a real app, this would come from an API
const getMockMessages = (contactId: string): ChatMessage[] => {
  return [
    {
      id: '1',
      contactId,
      content: 'Hi there! I saw your property listing on your website.',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      direction: 'incoming',
    },
    {
      id: '2',
      contactId,
      content: 'Thanks for your interest! Which property are you looking at?',
      timestamp: new Date(Date.now() - 3500000).toISOString(),
      direction: 'outgoing',
    },
    {
      id: '3',
      contactId,
      content: 'The one on Main Street. Is it still available?',
      timestamp: new Date(Date.now() - 3400000).toISOString(),
      direction: 'incoming',
    },
  ];
};

interface WhatsAppChatProps {
  contact: Contact;
}

export const WhatsAppChat: React.FC<WhatsAppChatProps> = ({ contact }) => {
  const { isConnected, sendMessage } = useWhatsApp();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load messages when contact changes
  useEffect(() => {
    setMessages(getMockMessages(contact.id));
  }, [contact.id]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!message.trim() || !isConnected) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      contactId: contact.id,
      content: message,
      timestamp: new Date().toISOString(),
      direction: 'outgoing',
    };

    setMessages([...messages, newMessage]);
    setMessage('');

    // In a real app, we would wait for the API response
    await sendMessage(contact.phone || '', message);

    // Simulate a reply after 2 seconds (for demo purposes)
    setTimeout(() => {
      const replyMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        contactId: contact.id,
        content: "Thanks for your message. I'll get back to you soon.",
        timestamp: new Date().toISOString(),
        direction: 'incoming',
      };
      
      setMessages(prev => [...prev, replyMessage]);
    }, 2000);
  };

  if (!isConnected) {
    return (
      <Card className="w-full">
        <CardContent className="p-6 text-center">
          <p className="text-gray-500">
            Please connect your WhatsApp account to chat with leads.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full h-[500px] flex flex-col">
      <CardHeader className="p-4 border-b">
        <CardTitle className="text-md flex items-center gap-2">
          <User className="h-5 w-5" />
          <span>{contact.name}</span>
          {contact.phone && (
            <span className="text-sm text-gray-500 ml-2">{contact.phone}</span>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-4 flex-grow overflow-y-auto">
        <div className="space-y-4">
          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex ${msg.direction === 'outgoing' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[80%] p-3 rounded-lg ${
                  msg.direction === 'outgoing' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <p>{msg.content}</p>
                <p className={`text-xs mt-1 ${
                  msg.direction === 'outgoing' 
                    ? 'text-primary-foreground/70' 
                    : 'text-gray-500'
                }`}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </CardContent>
      
      <CardFooter className="p-4 border-t">
        <div className="flex w-full gap-2">
          <Input
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
          />
          <Button 
            onClick={handleSendMessage}
            disabled={!message.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};
