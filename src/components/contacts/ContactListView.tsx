
import React from 'react';
import { Contact } from '@/types/contact';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Mail, Clock, MapPin, Phone, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface ContactListViewProps {
  contacts: Contact[];
  lastInteraction?: Record<string, any>;
}

export const ContactListView: React.FC<ContactListViewProps> = ({ contacts, lastInteraction }) => {
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
    <div className="space-y-3">
      {contacts.map(contact => {
        const interaction = lastInteraction?.[contact.id];
        
        return (
          <Card key={contact.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12 bg-primary/10">
                  <AvatarFallback className="text-primary">
                    {getInitials(contact.name)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-lg truncate">{contact.name}</h3>
                      <div className="flex flex-col space-y-1 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Mail className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
                          <span className="truncate">{contact.email}</span>
                        </div>
                        
                        {contact.phone && (
                          <div className="flex items-center">
                            <Phone className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
                            <span>{contact.phone}</span>
                          </div>
                        )}
                        
                        {contact.address && (
                          <div className="flex items-center">
                            <MapPin className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
                            <span className="truncate">{contact.address}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      
                      <Button variant="ghost" size="icon" asChild>
                        <Link to={`/contacts/${contact.id}`}>
                          <ChevronRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                  
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex flex-wrap gap-1">
                      {contact.tags.slice(0, 3).map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {contact.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{contact.tags.length - 3} more
                        </Badge>
                      )}
                    </div>
                    
                    {interaction && (
                      <div className="flex items-center text-xs text-gray-500">
                        <Clock className="h-3 w-3 mr-1" />
                        <span>
                          Last: {new Date(interaction.date).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
