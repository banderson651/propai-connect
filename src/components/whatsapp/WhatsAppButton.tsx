
import React from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare, Phone } from 'lucide-react';
import { useWhatsApp } from '@/contexts/WhatsAppContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { WhatsAppChat } from './WhatsAppChat';
import { Contact } from '@/types/contact';
import { useToast } from '@/components/ui/use-toast';

interface WhatsAppButtonProps {
  contact: Contact;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export const WhatsAppButton: React.FC<WhatsAppButtonProps> = ({ 
  contact, 
  variant = 'outline',
  size = 'sm'
}) => {
  const { isConnected } = useWhatsApp();
  const { toast } = useToast();
  const [open, setOpen] = React.useState(false);

  const handleClick = () => {
    if (!contact.phone) {
      toast({
        title: "No phone number",
        description: "This contact doesn't have a phone number to message.",
        variant: "destructive",
      });
      return;
    }
    
    if (!isConnected) {
      toast({
        title: "WhatsApp not connected",
        description: "Connect your WhatsApp account in Settings to use this feature.",
        variant: "destructive",
      });
      return;
    }
    
    setOpen(true);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant={variant} 
          size={size}
          onClick={handleClick}
          className="text-green-600 hover:text-green-700 hover:bg-green-50"
        >
          <MessageSquare className="h-4 w-4" />
          {size !== 'icon' && <span>WhatsApp</span>}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>WhatsApp Chat</DialogTitle>
          <DialogDescription>
            Chat with {contact.name} via WhatsApp
          </DialogDescription>
        </DialogHeader>
        <WhatsAppChat contact={contact} />
      </DialogContent>
    </Dialog>
  );
};

export const CallButton: React.FC<WhatsAppButtonProps> = ({ 
  contact, 
  variant = 'outline',
  size = 'sm'
}) => {
  const { toast } = useToast();

  const handleCall = () => {
    if (!contact.phone) {
      toast({
        title: "No phone number",
        description: "This contact doesn't have a phone number to call.",
        variant: "destructive",
      });
      return;
    }
    
    // In a real app, this might integrate with a calling service
    window.location.href = `tel:${contact.phone}`;
  };

  return (
    <Button 
      variant={variant} 
      size={size}
      onClick={handleCall}
      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
    >
      <Phone className="h-4 w-4" />
      {size !== 'icon' && <span>Call</span>}
    </Button>
  );
};
