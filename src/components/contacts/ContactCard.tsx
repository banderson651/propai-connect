
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Mail, Phone, CalendarDays, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Contact, ContactTag } from '@/types/contact';

// Define tag colors mapping
const TagColors: Record<ContactTag, string> = {
  'buyer': 'bg-blue-100 text-blue-800',
  'seller': 'bg-green-100 text-green-800',
  'agent': 'bg-purple-100 text-purple-800',
  'investor': 'bg-amber-100 text-amber-800',
  'first-time-buyer': 'bg-cyan-100 text-cyan-800',
  'luxury': 'bg-pink-100 text-pink-800',
  'commercial': 'bg-violet-100 text-violet-800',
  'residential': 'bg-emerald-100 text-emerald-800',
  'hot-lead': 'bg-red-100 text-red-800',
  'cold-lead': 'bg-slate-100 text-slate-800',
  'warm-lead': 'bg-orange-100 text-orange-800',
};

export const ContactBadge = ({ tag }: { tag: ContactTag }) => {
  const colorClass = TagColors[tag] || 'bg-gray-100 text-gray-800';
  
  return (
    <Badge className={`${colorClass} hover:${colorClass} border-0`}>
      {tag}
    </Badge>
  );
};

interface ContactCardProps {
  contact: Contact;
  lastInteraction: any | null;
}

export const ContactCard = ({ contact, lastInteraction }: ContactCardProps) => {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-lg">{contact.name}</h3>
            <div className="flex items-center text-gray-600 text-sm mt-1">
              <Mail className="h-4 w-4 mr-1" />
              <span>{contact.email}</span>
            </div>
            {contact.phone && (
              <div className="flex items-center text-gray-600 text-sm mt-1">
                <Phone className="h-4 w-4 mr-1" />
                <span>{contact.phone}</span>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <Link to={`/contacts/${contact.id}`}>
              <Button variant="ghost" size="sm">
                <Eye className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
        
        <div className="mt-4 flex flex-wrap gap-1">
          {contact.tags.map(tag => (
            <ContactBadge key={tag} tag={tag} />
          ))}
        </div>
        
        {lastInteraction && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center text-sm text-gray-500">
              <CalendarDays className="h-4 w-4 mr-1" />
              <span>Last interaction: {new Date(lastInteraction.date).toLocaleDateString()}</span>
            </div>
            <p className="text-sm mt-1 text-gray-700 truncate">
              {lastInteraction.type.charAt(0).toUpperCase() + lastInteraction.type.slice(1)}:
              {' '}{lastInteraction.content.substring(0, 40)}
              {lastInteraction.content.length > 40 ? '...' : ''}
            </p>
          </div>
        )}
        
        <div className="mt-4 pt-4 border-t border-gray-100 flex gap-2"> {/* Communication buttons can go here */}
        </div>
      </CardContent>
    </Card>
  );
};
