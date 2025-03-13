
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, User, AlertCircle } from 'lucide-react';
import { useWhatsApp, WhatsAppMessage } from '@/contexts/WhatsAppContext';
import { Contact } from '@/types/contact';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface WhatsAppChatProps {
  contact: Contact;
}

export const WhatsAppChat: React.FC<WhatsAppChatProps> = ({ contact }) => {
  const { isConnected, sendMessage, getMessages } = useWhatsApp();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load messages when contact changes
  useEffect(() => {
    if (isConnected && contact.id) {
      loadMessages();
    }
  }, [contact.id, isConnected]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const loadMessages = async () => {
    setIsLoading(true);
    try {
      const contactMessages = await getMessages(contact.id);
      setMessages(contactMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !isConnected || !contact.phone) return;

    // Add message to UI immediately for better UX
    const newMessage: WhatsAppMessage = {
      id: Date.now().toString(),
      contactId: contact.id,
      content: message,
      timestamp: new Date().toISOString(),
      direction: 'outgoing',
    };

    setMessages([...messages, newMessage]);
    setMessage('');
    
    // Send message through WhatsApp API
    const success = await sendMessage(contact.phone, message);
    
    if (!success) {
      // If sending failed, mark the message as failed or remove it
      setMessages(prev => prev.filter(msg => msg.id !== newMessage.id));
    } else {
      // Refresh messages to get the server-generated ID
      await loadMessages();
    }
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

  if (!contact.phone) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              This contact doesn't have a phone number. Add a phone number to send WhatsApp messages.
            </AlertDescription>
          </Alert>
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
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <p className="text-gray-500">Loading messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex justify-center items-center h-full">
            <p className="text-gray-500">No messages yet. Start a conversation!</p>
          </div>
        ) : (
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
        )}
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
