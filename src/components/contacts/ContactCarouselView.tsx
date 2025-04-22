
import React from 'react';
import { Contact } from '@/types/contact';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { WhatsAppButton, CallButton } from '@/components/whatsapp/WhatsAppButton';
import { Button } from '@/components/ui/button';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  ChevronLeft, 
  ChevronRight 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface ContactCarouselViewProps {
  contacts: Contact[];
  lastInteraction?: Record<string, any>;
}

export const ContactCarouselView: React.FC<ContactCarouselViewProps> = ({ 
  contacts, 
  lastInteraction 
}) => {
  if (!contacts.length) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No contacts found.</p>
      </div>
    );
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <Carousel
      className="w-full"
      opts={{
        align: "start",
        loop: true,
      }}
    >
      <CarouselContent className="-ml-2 md:-ml-4">
        {contacts.map(contact => {
          const interaction = lastInteraction?.[contact.id];
          
          return (
            <CarouselItem key={contact.id} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
              <Card className="h-full flex flex-col">
                <CardContent className="p-6 flex-grow">
                  <div className="flex flex-col items-center text-center">
                    <Avatar className="h-20 w-20 mb-4">
                      <AvatarFallback className="bg-primary/10 text-primary text-xl">
                        {getInitials(contact.name)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <h3 className="font-semibold text-lg">{contact.name}</h3>
                    
                    <div className="flex flex-wrap justify-center gap-1 mt-2">
                      {contact.tags.slice(0, 3).map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {contact.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{contact.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="mt-4 space-y-2 text-sm text-gray-600">
                      <div className="flex items-center justify-center">
                        <Mail className="h-4 w-4 mr-2 text-gray-500" />
                        <span>{contact.email}</span>
                      </div>
                      
                      {contact.phone && (
                        <div className="flex items-center justify-center">
                          <Phone className="h-4 w-4 mr-2 text-gray-500" />
                          <span>{contact.phone}</span>
                        </div>
                      )}
                      
                      {contact.address && (
                        <div className="flex items-center justify-center">
                          <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                          <span className="truncate max-w-[200px]">{contact.address}</span>
                        </div>
                      )}
                    </div>
                    
                    {interaction && (
                      <div className="mt-4 pt-4 border-t border-gray-100 w-full">
                        <div className="flex items-center justify-center text-sm text-gray-500">
                          <Calendar className="h-4 w-4 mr-2" />
                          <span>Last interaction: {new Date(interaction.date).toLocaleDateString()}</span>
                        </div>
                        <p className="text-sm mt-1 text-gray-600">
                          {interaction.type.charAt(0).toUpperCase() + interaction.type.slice(1)}: 
                          {' '}{interaction.content.substring(0, 40)}
                          {interaction.content.length > 40 ? '...' : ''}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
                
                <CardFooter className="flex justify-center gap-2 p-4 pt-0">
                  <WhatsAppButton contact={contact} variant="default" size="sm" />
                  <CallButton contact={contact} variant="default" size="sm" />
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/contacts/${contact.id}`}>
                      View
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            </CarouselItem>
          );
        })}
      </CarouselContent>
      <CarouselPrevious className="hidden md:flex" />
      <CarouselNext className="hidden md:flex" />
    </Carousel>
  );
};
