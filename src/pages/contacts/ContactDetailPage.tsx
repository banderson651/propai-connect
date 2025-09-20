
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { ArrowLeft, Phone, Mail, MapPin, Tag, MessageSquare, Calendar, Plus } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { Contact, Interaction } from '@/types/contact';
import { getContactById, getInteractionsByContactId, updateContact as updateContactService, saveInteraction as saveInteractionService } from '@/services/contactService';

export default function ContactDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [contact, setContact] = useState<Contact | null>(null);
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContact, setEditedContact] = useState<Contact | null>(null);
  const [newInteraction, setNewInteraction] = useState<{ type: Interaction['type']; content: string; subject: string }>({
    type: 'note',
    content: '',
    subject: ''
  });
  const [showAddInteraction, setShowAddInteraction] = useState(false);

  const fetchContact = useCallback(async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      const contactData = await getContactById(id);

      if (!contactData) {
        setContact(null);
        setEditedContact(null);
        toast({
          title: 'Not found',
          description: 'The requested contact could not be located.',
          variant: 'destructive'
        });
        return;
      }

      setContact(contactData);
      setEditedContact(contactData);
    } catch (error) {
      console.error('Error fetching contact:', error);
      toast({
        title: 'Error',
        description: 'Failed to load contact details',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  }, [id, toast]);

  const fetchInteractions = useCallback(async () => {
    try {
      if (!id) return;
      const interactionData = await getInteractionsByContactId(id);
      setInteractions(interactionData);
    } catch (error) {
      console.error('Error fetching interactions:', error);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchContact();
      fetchInteractions();
    }
  }, [id, fetchContact, fetchInteractions]);

  const handleSave = async () => {
    if (!editedContact || !id) return;

    try {
      const updated = await updateContactService(id, {
        name: editedContact.name,
        email: editedContact.email,
        phone: editedContact.phone,
        address: editedContact.address,
        tags: editedContact.tags,
        notes: editedContact.notes
      });

      if (!updated) throw new Error('Failed to update contact');

      setContact(updated);
      setEditedContact(updated);
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ['contacts'] });

      toast({
        title: 'Success',
        description: 'Contact updated successfully'
      });
    } catch (error) {
      console.error('Error updating contact:', error);
      toast({
        title: 'Error',
        description: 'Failed to update contact',
        variant: 'destructive'
      });
    }
  };

  const handleAddInteraction = async () => {
    if (!newInteraction.content.trim() || !id) return;

    try {
      const created = await saveInteractionService({
        contactId: id,
        type: newInteraction.type,
        content: newInteraction.content,
        subject: newInteraction.subject || undefined,
        date: new Date().toISOString()
      });

      if (!created) throw new Error('Failed to add interaction');

      setNewInteraction({ type: 'note', content: '', subject: '' });
      setShowAddInteraction(false);
      await fetchInteractions();
      queryClient.invalidateQueries({ queryKey: ['interactions'] });
      toast({
        title: 'Success',
        description: 'Interaction added successfully'
      });
    } catch (error) {
      console.error('Error adding interaction:', error);
      toast({
        title: 'Error',
        description: 'Failed to add interaction',
        variant: 'destructive'
      });
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!contact) {
    return (
      <DashboardLayout>
        <div className="text-center py-8">
          <h2 className="text-2xl font-bold text-gray-900">Contact not found</h2>
          <Button onClick={() => navigate('/contacts')} className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Contacts
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto py-6">
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/contacts')}
            className="flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Contacts
          </Button>
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave}>Save Changes</Button>
              </>
            ) : (
              <Button onClick={() => setIsEditing(true)}>Edit Contact</Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Contact Information */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Contact Information
                  {contact.tags.length > 0 && (
                    <div className="flex gap-1">
                      {contact.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary">
                          <Tag className="h-3 w-3 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEditing ? (
                  <>
                    <div>
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        value={editedContact?.name || ''}
                        onChange={(e) => setEditedContact(prev => prev ? { ...prev, name: e.target.value } : null)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={editedContact?.email || ''}
                        onChange={(e) => setEditedContact(prev => prev ? { ...prev, email: e.target.value } : null)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={editedContact?.phone || ''}
                        onChange={(e) => setEditedContact(prev => prev ? { ...prev, phone: e.target.value } : null)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="address">Address</Label>
                      <Textarea
                        id="address"
                        value={editedContact?.address || ''}
                        onChange={(e) => setEditedContact(prev => prev ? { ...prev, address: e.target.value } : null)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="notes">Notes</Label>
                      <Textarea
                        id="notes"
                        value={editedContact?.notes || ''}
                        onChange={(e) => setEditedContact(prev => prev ? { ...prev, notes: e.target.value } : null)}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <span>{contact.email}</span>
                    </div>
                    {contact.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <span>{contact.phone}</span>
                      </div>
                    )}
                    {contact.address && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span>{contact.address}</span>
                      </div>
                    )}
                    {contact.notes && (
                      <div>
                        <h4 className="font-medium mb-2">Notes</h4>
                        <p className="text-gray-600">{contact.notes}</p>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <Mail className="h-4 w-4 mr-2" />
                  Send Email
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Send WhatsApp
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Meeting
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Interactions */}
        <Card className="mt-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Interactions</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAddInteraction(!showAddInteraction)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Interaction
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {showAddInteraction && (
              <div className="mb-6 p-4 border rounded-lg">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="interactionType">Type</Label>
                    <select
                      id="interactionType"
                      value={newInteraction.type}
                      onChange={(e) => setNewInteraction(prev => ({ ...prev, type: e.target.value as Interaction['type'] }))}
                      className="w-full mt-1 block rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    >
                      <option value="note">Note</option>
                      <option value="call">Call</option>
                      <option value="email">Email</option>
                      <option value="meeting">Meeting</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      value={newInteraction.subject}
                      onChange={(e) => setNewInteraction(prev => ({ ...prev, subject: e.target.value }))}
                      placeholder="Brief description"
                    />
                  </div>
                  <div>
                    <Label htmlFor="content">Content</Label>
                    <Textarea
                      id="content"
                      value={newInteraction.content}
                      onChange={(e) => setNewInteraction(prev => ({ ...prev, content: e.target.value }))}
                      placeholder="Detailed notes..."
                      rows={3}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleAddInteraction}>Add Interaction</Button>
                    <Button variant="outline" onClick={() => setShowAddInteraction(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              {interactions.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No interactions yet</p>
              ) : (
                interactions.map((interaction) => (
                  <div key={interaction.id} className="border-l-4 border-blue-200 pl-4 py-2">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{interaction.type}</Badge>
                        {interaction.subject && (
                          <span className="font-medium">{interaction.subject}</span>
                        )}
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(interaction.date).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-700">{interaction.content}</p>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
