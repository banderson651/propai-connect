import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { getContactById, getInteractionsByContactId, saveInteraction, deleteContact } from '@/services/mockData';
import { Interaction, InteractionType } from '@/types/contact';
import { 
  Edit, Trash2, Phone, Mail, MapPin, Tag, 
  MessageCircle, Calendar, Clock, File, Plus 
} from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from '@/components/ui/use-toast';
import { WhatsAppChat } from '@/components/whatsapp/WhatsAppChat';
import { WhatsAppButton, CallButton } from '@/components/whatsapp/WhatsAppButton';

const interactionTypeOptions: InteractionType[] = ['call', 'email', 'meeting', 'note', 'other'];

const interactionIcons: Record<InteractionType, any> = {
  'call': Phone,
  'email': Mail,
  'meeting': Calendar,
  'note': File,
  'other': MessageCircle,
};

const ContactDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [contact, setContact] = useState<any>(null);
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  const [newInteractionOpen, setNewInteractionOpen] = useState(false);
  const [interactionType, setInteractionType] = useState<InteractionType>('call');
  const [interactionContent, setInteractionContent] = useState('');
  const [interactionSubject, setInteractionSubject] = useState('');
  
  useEffect(() => {
    if (!id) return;
    
    const contactData = getContactById(id);
    if (!contactData) {
      toast({
        title: "Contact not found",
        description: "The requested contact could not be found.",
        variant: "destructive",
      });
      navigate('/contacts');
      return;
    }
    
    setContact(contactData);
    setInteractions(getInteractionsByContactId(id));
  }, [id, navigate, toast]);
  
  const sortedInteractions = useMemo(() => {
    return [...interactions].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [interactions]);
  
  const handleAddInteraction = () => {
    if (!contact || !interactionContent.trim()) return;
    
    const newInteraction = saveInteraction({
      contactId: contact.id,
      type: interactionType,
      date: new Date().toISOString(),
      content: interactionContent,
      subject: interactionSubject || undefined,
    });
    
    setInteractions(prev => [...prev, newInteraction]);
    setInteractionType('call');
    setInteractionContent('');
    setInteractionSubject('');
    setNewInteractionOpen(false);
    
    toast({
      title: "Interaction added",
      description: "The interaction has been added successfully.",
    });
  };
  
  const handleDeleteContact = () => {
    if (!contact) return;
    
    deleteContact(contact.id);
    toast({
      title: "Contact deleted",
      description: "The contact has been deleted successfully.",
    });
    navigate('/contacts');
  };
  
  if (!contact) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Loading contact details...</p>
        </div>
      </DashboardLayout>
    );
  }
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">{contact.name}</h1>
            <div className="flex flex-wrap gap-2 mt-2">
              {contact.tags.map((tag: string) => (
                <Badge key={tag} variant="outline">{tag}</Badge>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {contact.phone && (
              <>
                <CallButton contact={contact} />
                <WhatsAppButton contact={contact} />
              </>
            )}
            <Button variant="outline" size="sm" onClick={() => navigate(`/contacts/${contact.id}/edit`)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Delete Contact</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to delete {contact.name}? This action cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                  <Button variant="destructive" onClick={handleDeleteContact}>Delete</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p>{contact.email}</p>
                </div>
              </div>
              
              {contact.phone && (
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Phone</p>
                    <p>{contact.phone}</p>
                  </div>
                </div>
              )}
              
              {contact.address && (
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Address</p>
                    <p>{contact.address}</p>
                  </div>
                </div>
              )}
              
              <div className="flex items-start gap-3">
                <Tag className="h-5 w-5 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Tags</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {contact.tags.map((tag: string) => (
                      <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                    ))}
                  </div>
                </div>
              </div>
              
              {contact.notes && (
                <div className="pt-4 border-t border-gray-100">
                  <p className="text-sm font-medium text-gray-500 mb-2">Notes</p>
                  <p className="text-sm">{contact.notes}</p>
                </div>
              )}
              
              <div className="pt-4 border-t border-gray-100">
                <p className="text-sm font-medium text-gray-500 mb-2">Created</p>
                <p className="text-sm">{new Date(contact.createdAt).toLocaleDateString()}</p>
              </div>
            </CardContent>
          </Card>
          
          <Tabs className="md:col-span-2" defaultValue="interactions">
            <TabsList>
              <TabsTrigger value="interactions">Interactions</TabsTrigger>
              <TabsTrigger value="whatsapp">WhatsApp Chat</TabsTrigger>
            </TabsList>
            
            <TabsContent value="interactions">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg">Interaction History</CardTitle>
                  <Dialog open={newInteractionOpen} onOpenChange={setNewInteractionOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Interaction
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Interaction</DialogTitle>
                        <DialogDescription>
                          Record a new interaction with this contact.
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Interaction Type</label>
                          <Select 
                            value={interactionType} 
                            onValueChange={(value) => setInteractionType(value as InteractionType)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select interaction type" />
                            </SelectTrigger>
                            <SelectContent>
                              {interactionTypeOptions.map(type => (
                                <SelectItem key={type} value={type}>
                                  {type.charAt(0).toUpperCase() + type.slice(1)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        {(interactionType === 'email') && (
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Subject</label>
                            <Input
                              value={interactionSubject}
                              onChange={(e) => setInteractionSubject(e.target.value)}
                              placeholder="Email subject"
                            />
                          </div>
                        )}
                        
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Content</label>
                          <Textarea
                            value={interactionContent}
                            onChange={(e) => setInteractionContent(e.target.value)}
                            placeholder={`Details about this ${interactionType}`}
                            rows={5}
                          />
                        </div>
                      </div>
                      
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setNewInteractionOpen(false)}>Cancel</Button>
                        <Button onClick={handleAddInteraction}>Save Interaction</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="all">
                    <TabsList className="mb-4">
                      <TabsTrigger value="all">All</TabsTrigger>
                      <TabsTrigger value="calls">Calls</TabsTrigger>
                      <TabsTrigger value="emails">Emails</TabsTrigger>
                      <TabsTrigger value="meetings">Meetings</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="all">
                      <InteractionsList 
                        interactions={sortedInteractions} 
                        filter="all" 
                      />
                    </TabsContent>
                    
                    <TabsContent value="calls">
                      <InteractionsList 
                        interactions={sortedInteractions} 
                        filter="call" 
                      />
                    </TabsContent>
                    
                    <TabsContent value="emails">
                      <InteractionsList 
                        interactions={sortedInteractions} 
                        filter="email" 
                      />
                    </TabsContent>
                    
                    <TabsContent value="meetings">
                      <InteractionsList 
                        interactions={sortedInteractions} 
                        filter="meeting" 
                      />
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="whatsapp">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">WhatsApp Conversation</CardTitle>
                </CardHeader>
                <CardContent>
                  {contact.phone ? (
                    <WhatsAppChat contact={contact} />
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500">This contact doesn't have a phone number for WhatsApp messaging.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </DashboardLayout>
  );
};

interface InteractionsListProps {
  interactions: Interaction[];
  filter: 'all' | InteractionType;
}

const InteractionsList = ({ interactions, filter }: InteractionsListProps) => {
  const filteredInteractions = filter === 'all' 
    ? interactions 
    : interactions.filter(i => i.type === filter);
  
  if (filteredInteractions.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No interactions found.</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {filteredInteractions.map(interaction => {
        const Icon = interactionIcons[interaction.type] || MessageCircle;
        
        return (
          <div key={interaction.id} className="border-b border-gray-100 pb-4 last:border-0">
            <div className="flex items-center gap-2 mb-2">
              <div className="bg-blue-50 h-8 w-8 rounded-full flex items-center justify-center">
                <Icon className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="font-medium">
                  {interaction.type.charAt(0).toUpperCase() + interaction.type.slice(1)}
                  {interaction.subject && `: ${interaction.subject}`}
                </p>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Calendar className="h-3 w-3" />
                  <span>{new Date(interaction.date).toLocaleDateString()}</span>
                  <Clock className="h-3 w-3 ml-2" />
                  <span>{new Date(interaction.date).toLocaleTimeString()}</span>
                </div>
              </div>
            </div>
            <p className="pl-10 text-gray-700">{interaction.content}</p>
          </div>
        );
      })}
    </div>
  );
};

export default ContactDetailPage;
