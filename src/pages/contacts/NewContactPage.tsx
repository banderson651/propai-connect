
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { saveContact, analyzeTextForTags } from '@/services/mockData';
import { ContactTag } from '@/types/contact';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

const tagOptions: ContactTag[] = [
  'buyer', 'seller', 'agent', 'investor', 'first-time-buyer',
  'luxury', 'commercial', 'residential', 'hot-lead', 'cold-lead', 'warm-lead'
];

const NewContactPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [tags, setTags] = useState<ContactTag[]>([]);
  const [customTag, setCustomTag] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const addTag = (tag: ContactTag) => {
    if (!tags.includes(tag)) {
      setTags([...tags, tag]);
    }
  };
  
  const removeTag = (tagToRemove: ContactTag) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };
  
  const addCustomTag = () => {
    if (customTag.trim() && !tags.includes(customTag as ContactTag)) {
      setTags([...tags, customTag as ContactTag]);
      setCustomTag('');
    }
  };
  
  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newNotes = e.target.value;
    setNotes(newNotes);
    
    // Auto-tag based on notes content if it's substantial
    if (newNotes.length > 20) {
      const suggestedTags = analyzeTextForTags(newNotes);
      if (suggestedTags.length > 0) {
        const newTags = [...tags];
        suggestedTags.forEach(tag => {
          if (!newTags.includes(tag)) {
            newTags.push(tag);
          }
        });
        setTags(newTags);
      }
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const contactData = {
      name,
      email,
      phone: phone || undefined,
      address: address || undefined,
      tags,
      notes: notes || undefined,
    };
    
    try {
      saveContact(contactData);
      
      toast({
        title: "Contact created",
        description: `${name} has been added to your contacts.`,
      });
      
      navigate('/contacts');
    } catch (error) {
      console.error('Error saving contact:', error);
      toast({
        title: "Error",
        description: "Failed to create contact. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">Add New Contact</h1>
        
        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="tags">Tags</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {tags.map(tag => (
                    <Badge key={tag} className="flex items-center gap-1 bg-blue-100 text-blue-800 hover:bg-blue-200">
                      {tag}
                      <button 
                        type="button" 
                        onClick={() => removeTag(tag)}
                        className="h-4 w-4 rounded-full flex items-center justify-center hover:bg-blue-200"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {tagOptions.filter(tag => !tags.includes(tag)).map(tag => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="cursor-pointer hover:bg-blue-50"
                      onClick={() => addTag(tag)}
                    >
                      + {tag}
                    </Badge>
                  ))}
                </div>
                
                <div className="flex gap-2">
                  <Input
                    placeholder="Add custom tag"
                    value={customTag}
                    onChange={(e) => setCustomTag(e.target.value)}
                    className="w-auto"
                  />
                  <Button type="button" variant="outline" onClick={addCustomTag}>Add</Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={handleNotesChange}
                  placeholder="Add any relevant information about this contact..."
                  rows={5}
                />
                <p className="text-xs text-blue-600">
                  * NLP-based auto-tagging is enabled. Tags will be suggested as you type.
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button type="button" variant="outline" onClick={() => navigate('/contacts')}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || !name || !email}>
                {isSubmitting ? 'Creating...' : 'Create Contact'}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default NewContactPage;
