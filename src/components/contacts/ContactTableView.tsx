
import React from 'react';
import { Contact } from '@/types/contact';
import { Badge } from '@/components/ui/badge';
import { WhatsAppButton, CallButton } from '@/components/whatsapp/WhatsAppButton';
import { MoreHorizontal, Mail, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDistanceToNow } from 'date-fns';

interface ContactTableViewProps {
  contacts: Contact[];
  lastInteraction?: Record<string, any>;
}

export const ContactTableView: React.FC<ContactTableViewProps> = ({ contacts, lastInteraction }) => {
  if (!contacts.length) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No contacts found.</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Contact Info</TableHead>
            <TableHead>Tags</TableHead>
            <TableHead>Last Activity</TableHead>
            <TableHead className="w-[140px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {contacts.map(contact => {
            const interaction = lastInteraction?.[contact.id];
            
            return (
              <TableRow key={contact.id}>
                <TableCell className="font-medium">
                  <Link to={`/contacts/${contact.id}`} className="hover:underline">
                    {contact.name}
                  </Link>
                </TableCell>
                
                <TableCell>
                  <div className="flex flex-col space-y-1">
                    <div className="flex items-center text-sm">
                      <Mail className="h-3.5 w-3.5 mr-1 text-gray-500" />
                      <span>{contact.email}</span>
                    </div>
                    
                    {contact.phone && (
                      <div className="flex items-center text-sm">
                        <Phone className="h-3.5 w-3.5 mr-1 text-gray-500" />
                        <span>{contact.phone}</span>
                      </div>
                    )}
                  </div>
                </TableCell>
                
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {contact.tags.slice(0, 2).map(tag => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {contact.tags.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{contact.tags.length - 2} more
                      </Badge>
                    )}
                  </div>
                </TableCell>
                
                <TableCell>
                  {interaction ? (
                    <span className="text-sm text-gray-600">
                      {formatDistanceToNow(new Date(interaction.date), { addSuffix: true })}
                    </span>
                  ) : (
                    <span className="text-sm text-gray-400">No activity</span>
                  )}
                </TableCell>
                
                <TableCell>
                  <div className="flex items-center gap-2">
                    <WhatsAppButton contact={contact} size="sm" />
                    <CallButton contact={contact} size="sm" />
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link to={`/contacts/${contact.id}`}>View Details</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link to={`/contacts/${contact.id}`}>Add Interaction</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link to={`/email/campaigns/new?contactId=${contact.id}`}>Send Email</Link>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
