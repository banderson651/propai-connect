import { useState, useMemo, useCallback } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, UserPlus, Tag } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getContacts, getInteractions } from '@/services/mockData';
import { Contact, ContactTag } from '@/types/contact';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { ContactCard } from '@/components/contacts/ContactCard';
import { ContactViewType, ContactsViewSwitcher } from '@/components/contacts/ContactsViewSwitcher';
import { ImportContacts } from '@/components/contacts/ImportContacts';
import { ContactListView } from '@/components/contacts/ContactListView';
import { ContactTableView } from '@/components/contacts/ContactTableView';
import { ContactCarouselView } from '@/components/contacts/ContactCarouselView';
const TagColors: Record<ContactTag, string> = {
  'buyer': 'bg-blue-100 text-blue-800 hover:bg-blue-100',
  'seller': 'bg-green-100 text-green-800 hover:bg-green-100',
  'agent': 'bg-purple-100 text-purple-800 hover:bg-purple-100',
  'investor': 'bg-amber-100 text-amber-800 hover:bg-amber-100',
  'first-time-buyer': 'bg-cyan-100 text-cyan-800 hover:bg-cyan-100',
  'luxury': 'bg-pink-100 text-pink-800 hover:bg-pink-100',
  'commercial': 'bg-violet-100 text-violet-800 hover:bg-violet-100',
  'residential': 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100',
  'hot-lead': 'bg-red-100 text-red-800 hover:bg-red-100',
  'cold-lead': 'bg-slate-100 text-slate-800 hover:bg-slate-100',
  'warm-lead': 'bg-orange-100 text-orange-800 hover:bg-orange-100'
};
const ContactBadge = ({
  tag
}: {
  tag: ContactTag;
}) => {
  const colorClass = TagColors[tag] || 'bg-gray-100 text-gray-800 hover:bg-gray-100';
  return <Badge className={`${colorClass} border-0`}>
      {tag}
    </Badge>;
};
const ContactsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<ContactTag | null>(null);
  const [viewType, setViewType] = useState<ContactViewType>('grid');
  const contacts = getContacts();
  const interactions = getInteractions();
  const allTags = useMemo(() => {
    const tags = new Set<ContactTag>();
    contacts.forEach(contact => {
      contact.tags.forEach(tag => tags.add(tag));
    });
    return Array.from(tags);
  }, [contacts]);
  const filteredContacts = useMemo(() => {
    return contacts.filter(contact => {
      const matchesSearch = searchTerm === '' || contact.name.toLowerCase().includes(searchTerm.toLowerCase()) || contact.email.toLowerCase().includes(searchTerm.toLowerCase()) || contact.phone && contact.phone.includes(searchTerm);
      const matchesTag = !selectedTag || contact.tags.includes(selectedTag);
      return matchesSearch && matchesTag;
    });
  }, [contacts, searchTerm, selectedTag]);
  const getContactLastInteractions = useCallback(() => {
    const lastInteractionMap: Record<string, any> = {};
    contacts.forEach(contact => {
      const contactInteractions = interactions.filter(i => i.contactId === contact.id);
      if (contactInteractions.length > 0) {
        const sorted = [...contactInteractions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        lastInteractionMap[contact.id] = sorted[0];
      }
    });
    return lastInteractionMap;
  }, [contacts, interactions]);
  const lastInteractionMap = useMemo(() => getContactLastInteractions(), [getContactLastInteractions]);
  const renderContactsView = () => {
    switch (viewType) {
      case 'list':
        return <ContactListView contacts={filteredContacts} lastInteraction={lastInteractionMap} />;
      case 'table':
        return <ContactTableView contacts={filteredContacts} lastInteraction={lastInteractionMap} />;
      case 'carousel':
        return <ContactCarouselView contacts={filteredContacts} lastInteraction={lastInteractionMap} />;
      case 'grid':
      default:
        return <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredContacts.map(contact => <ContactCard key={contact.id} contact={contact} lastInteraction={lastInteractionMap[contact.id]} />)}
            
            {filteredContacts.length === 0 && <div className="col-span-3 text-center py-12">
                <p className="text-gray-500">No contacts found matching your criteria.</p>
              </div>}
          </div>;
    }
  };
  return <DashboardLayout pageTitle="Contacts">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Contacts</h1>
            <p className="text-gray-600 mt-1">
              Manage your contacts and track interactions
            </p>
          </div>
          <div className="flex gap-2">
            <ImportContacts />
            <Link to="/contacts/new">
              <Button className="bg-primary hover:bg-blue-600 text-white">
                <UserPlus className="mr-2 h-4 w-4" />
                Add Contact
              </Button>
            </Link>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input placeholder="Search contacts..." className="pl-10 bg-white border-gray-200" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
          <div className="flex gap-2 items-center">
            <ContactsViewSwitcher currentView={viewType} onChange={setViewType} />
            <Button variant={selectedTag ? "default" : "outline"} className="flex items-center gap-2" onClick={() => setSelectedTag(null)}>
              <Tag className="h-4 w-4" />
              All Tags
            </Button>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 my-4">
          {allTags.map(tag => <Badge key={tag} className={`cursor-pointer transition-colors ${selectedTag === tag ? TagColors[tag] || 'bg-gray-200 text-gray-800' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`} onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}>
              {tag}
            </Badge>)}
        </div>
        
        <Tabs defaultValue="all" className="bg-white rounded-xl border border-gray-200 shadow-lg">
          <TabsList className="bg-gray-100 border border-gray-200 m-1">
            <TabsTrigger value="all" className="data-[state=active]:bg-primary data-[state=active]:text-white">All Contacts</TabsTrigger>
            <TabsTrigger value="recent" className="data-[state=active]:bg-primary data-[state=active]:text-white">Recently Added</TabsTrigger>
            <TabsTrigger value="buyers" className="data-[state=active]:bg-primary data-[state=active]:text-white">Buyers</TabsTrigger>
            <TabsTrigger value="sellers" className="data-[state=active]:bg-primary data-[state=active]:text-white">Sellers</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-6 p-6">
            {renderContactsView()}
          </TabsContent>
          
          <TabsContent value="recent" className="mt-6">
            {viewType === 'grid' ? <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredContacts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 6).map(contact => <ContactCard key={contact.id} contact={contact} lastInteraction={lastInteractionMap[contact.id]} />)}
              </div> : <>
                {(() => {
              const recentContacts = filteredContacts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 6);
              switch (viewType) {
                case 'list':
                  return <ContactListView contacts={recentContacts} lastInteraction={lastInteractionMap} />;
                case 'table':
                  return <ContactTableView contacts={recentContacts} lastInteraction={lastInteractionMap} />;
                case 'carousel':
                  return <ContactCarouselView contacts={recentContacts} lastInteraction={lastInteractionMap} />;
                default:
                  return null;
              }
            })()}
              </>}
          </TabsContent>
          
          <TabsContent value="buyers" className="mt-6">
            {(() => {
            const buyerContacts = filteredContacts.filter(contact => contact.tags.includes('buyer'));
            switch (viewType) {
              case 'grid':
                return <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {buyerContacts.map(contact => <ContactCard key={contact.id} contact={contact} lastInteraction={lastInteractionMap[contact.id]} />)}
                      
                      {buyerContacts.length === 0 && <div className="col-span-3 text-center py-12">
                          <p className="text-gray-500">No buyers found matching your criteria.</p>
                        </div>}
                    </div>;
              case 'list':
                return <ContactListView contacts={buyerContacts} lastInteraction={lastInteractionMap} />;
              case 'table':
                return <ContactTableView contacts={buyerContacts} lastInteraction={lastInteractionMap} />;
              case 'carousel':
                return <ContactCarouselView contacts={buyerContacts} lastInteraction={lastInteractionMap} />;
              default:
                return null;
            }
          })()}
          </TabsContent>
          
          <TabsContent value="sellers" className="mt-6">
            {(() => {
            const sellerContacts = filteredContacts.filter(contact => contact.tags.includes('seller'));
            switch (viewType) {
              case 'grid':
                return <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {sellerContacts.map(contact => <ContactCard key={contact.id} contact={contact} lastInteraction={lastInteractionMap[contact.id]} />)}
                      
                      {sellerContacts.length === 0 && <div className="col-span-3 text-center py-12">
                          <p className="text-gray-500">No sellers found matching your criteria.</p>
                        </div>}
                    </div>;
              case 'list':
                return <ContactListView contacts={sellerContacts} lastInteraction={lastInteractionMap} />;
              case 'table':
                return <ContactTableView contacts={sellerContacts} lastInteraction={lastInteractionMap} />;
              case 'carousel':
                return <ContactCarouselView contacts={sellerContacts} lastInteraction={lastInteractionMap} />;
              default:
                return null;
            }
          })()}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>;
};
export default ContactsPage;