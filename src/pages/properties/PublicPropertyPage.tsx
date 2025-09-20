
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getPropertyById, submitPropertyLead } from '@/services/propertyService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { Building2, MapPin, Phone, Mail, User, CheckCircle } from 'lucide-react';

const PublicPropertyPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  // In a real app, you would fetch the property by its slug
  // For this demo, we'll just use the first property that matches in the URL
  const { data: property } = useQuery({
    queryKey: ['public-property', slug],
    queryFn: () => getPropertyById(slug || '', { requireAuth: false }),
    enabled: Boolean(slug),
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!property) return;
    
    setIsSubmitting(true);
    try {
      await submitPropertyLead(property.id, formData);
      setSubmitted(true);
      setFormData({ name: '', email: '', phone: '', message: '' });
    } catch (error) {
      console.error('Error submitting lead:', error);
      alert('Failed to submit your information. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (!property) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h1 className="text-2xl font-semibold mb-2">Property Not Found</h1>
            <p className="text-gray-500">
              The property you're looking for doesn't exist or has been removed.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">PropAI</h1>
            <p className="text-sm text-gray-500">Property Management System</p>
          </div>
        </div>
      </header>
      
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{property.title}</h1>
              <p className="text-lg text-gray-700 flex items-center mt-2">
                <MapPin className="h-5 w-5 mr-1 text-gray-400" /> 
                {property.address}, {property.city}, {property.state} {property.zipCode}
              </p>
              <div className="mt-4">
                <Badge className="text-lg px-3 py-1 bg-green-100 text-green-800 border-0">
                  {formatCurrency(property.price)}
                </Badge>
              </div>
            </div>
            
            <div className="h-96 overflow-hidden rounded-lg">
              <img 
                src={property.images[0] || '/placeholder.svg'} 
                alt={property.title}
                className="w-full h-full object-cover"
              />
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Property Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {property.propertyType && (
                    <div>
                      <p className="text-sm text-gray-500">Type</p>
                      <p className="font-semibold capitalize">{property.propertyType.replace('-', ' ')}</p>
                    </div>
                  )}
                  
                  {property.bedrooms && (
                    <div>
                      <p className="text-sm text-gray-500">Bedrooms</p>
                      <p className="font-semibold">{property.bedrooms}</p>
                    </div>
                  )}
                  
                  {property.bathrooms && (
                    <div>
                      <p className="text-sm text-gray-500">Bathrooms</p>
                      <p className="font-semibold">{property.bathrooms}</p>
                    </div>
                  )}
                  
                  {property.squareFeet && (
                    <div>
                      <p className="text-sm text-gray-500">Square Feet</p>
                      <p className="font-semibold">{property.squareFeet.toLocaleString()}</p>
                    </div>
                  )}
                  
                  {property.lotSize && (
                    <div>
                      <p className="text-sm text-gray-500">Lot Size</p>
                      <p className="font-semibold">{property.lotSize} acres</p>
                    </div>
                  )}
                  
                  {property.yearBuilt && (
                    <div>
                      <p className="text-sm text-gray-500">Year Built</p>
                      <p className="font-semibold">{property.yearBuilt}</p>
                    </div>
                  )}
                  
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <p className="font-semibold capitalize">{property.status.replace('-', ' ')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-line">{property.description}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Features</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {property.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 p-2">
                      <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="space-y-6">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>Interested in this property?</CardTitle>
              </CardHeader>
              <CardContent>
                {submitted ? (
                  <div className="text-center py-8">
                    <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Thank You!</h3>
                    <p className="text-gray-600 mb-4">
                      Your information has been submitted. A representative will contact you shortly.
                    </p>
                    <Button 
                      onClick={() => setSubmitted(false)}
                      variant="outline"
                    >
                      Submit Another Inquiry
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">
                        <User className="h-4 w-4 inline mr-1" /> Your Name
                      </Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">
                        <Mail className="h-4 w-4 inline mr-1" /> Email Address
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone">
                        <Phone className="h-4 w-4 inline mr-1" /> Phone Number
                      </Label>
                      <Input
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="message">Message</Label>
                      <Textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="I'm interested in this property..."
                        rows={4}
                      />
                    </div>
                    
                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                      {isSubmitting ? 'Submitting...' : 'Request Information'}
                    </Button>
                    
                    <p className="text-xs text-gray-500 text-center mt-2">
                      By submitting this form, you agree to be contacted about this property.
                    </p>
                  </form>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Property Agent</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center">
                  <User className="h-8 w-8 text-gray-500" />
                </div>
                <div>
                  <p className="font-semibold">{property.ownerName}</p>
                  <p className="text-sm text-gray-500">Real Estate Agent</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      <footer className="bg-gray-800 text-white py-8 mt-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">PropAI</h3>
              <p className="text-gray-400">
                Advanced property management solution for real estate professionals.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact</h3>
              <p className="text-gray-400">info@propai.com</p>
              <p className="text-gray-400">1-800-PROPAI</p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Legal</h3>
              <p className="text-gray-400">© 2023 PropAI. All rights reserved.</p>
              <p className="text-gray-400">Privacy Policy | Terms of Service</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicPropertyPage;
