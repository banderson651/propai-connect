
import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useQuery } from '@tanstack/react-query';
import { getPropertyById, deleteProperty } from '@/services/propertyService';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ArrowLeft, Edit, Trash, Share2, Building2, MapPin, Tag, Users, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const PropertyDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);

  const { data: property, isLoading } = useQuery({
    queryKey: ['property', id],
    queryFn: () => getPropertyById(id!),
    enabled: !!id,
  });

  const handleDelete = async () => {
    if (!id) return;
    
    try {
      await deleteProperty(id);
      toast({
        title: "Property Deleted",
        description: "The property has been deleted successfully.",
      });
      navigate('/properties');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete the property. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleShare = () => {
    if (!property) return;
    
    navigator.clipboard.writeText(`${window.location.origin}${property.publicPageUrl}`);
    toast({
      title: "Link Copied",
      description: "Property link has been copied to clipboard.",
    });
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p>Loading property details...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!property) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h3 className="text-lg font-medium mb-2">Property Not Found</h3>
          <p className="text-gray-500 mb-4">
            The property you're looking for doesn't exist or has been removed.
          </p>
          <Button asChild>
            <Link to="/properties">Go Back to Properties</Link>
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-6">
        <Button asChild variant="outline" size="sm" className="mb-4">
          <Link to="/properties">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to Properties
          </Link>
        </Button>
        
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">{property.title}</h1>
            <p className="text-gray-500 flex items-center mt-1">
              <MapPin className="h-4 w-4 mr-1" /> 
              {property.address}, {property.city}, {property.state} {property.zipCode}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button onClick={handleShare} variant="outline">
              <Share2 className="h-4 w-4 mr-1" /> Share
            </Button>
            <Button asChild variant="outline">
              <Link to={`/properties/${property.id}/edit`}>
                <Edit className="h-4 w-4 mr-1" /> Edit
              </Link>
            </Button>
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="destructive">
                  <Trash className="h-4 w-4 mr-1" /> Delete
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Delete Property</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to delete this property? This action cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button variant="destructive" onClick={handleDelete}>
                    Delete
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <div className="h-64 overflow-hidden">
              <img 
                src={property.images[0] || '/placeholder.svg'} 
                alt={property.title}
                className="w-full h-full object-cover"
              />
            </div>
            <CardContent className="p-6">
              <Tabs defaultValue="details">
                <TabsList className="mb-4">
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="features">Features</TabsTrigger>
                  <TabsTrigger value="description">Description</TabsTrigger>
                </TabsList>
                
                <TabsContent value="details" className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gray-50 p-3 rounded-md">
                      <p className="text-sm text-gray-500">Price</p>
                      <p className="font-semibold">{formatCurrency(property.price)}</p>
                    </div>
                    
                    {property.propertyType && (
                      <div className="bg-gray-50 p-3 rounded-md">
                        <p className="text-sm text-gray-500">Type</p>
                        <p className="font-semibold capitalize">{property.propertyType.replace('-', ' ')}</p>
                      </div>
                    )}
                    
                    <div className="bg-gray-50 p-3 rounded-md">
                      <p className="text-sm text-gray-500">Status</p>
                      <p className="font-semibold capitalize">{property.status.replace('-', ' ')}</p>
                    </div>
                    
                    {property.yearBuilt && (
                      <div className="bg-gray-50 p-3 rounded-md">
                        <p className="text-sm text-gray-500">Year Built</p>
                        <p className="font-semibold">{property.yearBuilt}</p>
                      </div>
                    )}
                    
                    {property.bedrooms && (
                      <div className="bg-gray-50 p-3 rounded-md">
                        <p className="text-sm text-gray-500">Bedrooms</p>
                        <p className="font-semibold">{property.bedrooms}</p>
                      </div>
                    )}
                    
                    {property.bathrooms && (
                      <div className="bg-gray-50 p-3 rounded-md">
                        <p className="text-sm text-gray-500">Bathrooms</p>
                        <p className="font-semibold">{property.bathrooms}</p>
                      </div>
                    )}
                    
                    {property.squareFeet && (
                      <div className="bg-gray-50 p-3 rounded-md">
                        <p className="text-sm text-gray-500">Square Feet</p>
                        <p className="font-semibold">{property.squareFeet.toLocaleString()}</p>
                      </div>
                    )}
                    
                    {property.lotSize && (
                      <div className="bg-gray-50 p-3 rounded-md">
                        <p className="text-sm text-gray-500">Lot Size</p>
                        <p className="font-semibold">{property.lotSize} acres</p>
                      </div>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="features">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {property.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2 p-2">
                        <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="description">
                  <p className="text-gray-700 whitespace-pre-line">{property.description}</p>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-blue-100 p-2 rounded-full">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Owner</p>
                  <p className="font-medium">{property.ownerName}</p>
                </div>
              </div>
              
              <Button asChild className="w-full mb-2">
                <Link to={`/properties/${property.id}/leads`}>
                  View Associated Leads
                </Link>
              </Button>
              
              <Button asChild variant="outline" className="w-full">
                <Link to={property.publicPageUrl} target="_blank">
                  View Public Page
                </Link>
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-green-100 p-2 rounded-full">
                  <Tag className="h-5 w-5 text-green-600" />
                </div>
                <h3 className="font-medium">Tags</h3>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {property.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary">
                    {tag.replace('-', ' ')}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-purple-100 p-2 rounded-full">
                  <Building2 className="h-5 w-5 text-purple-600" />
                </div>
                <h3 className="font-medium">Property Information</h3>
              </div>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Property ID</span>
                  <span className="font-medium">{property.id.substring(0, 8)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Property Type</span>
                  <span className="font-medium capitalize">{property.propertyType.replace('-', ' ')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Status</span>
                  <span className="font-medium capitalize">{property.status.replace('-', ' ')}</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-orange-100 p-2 rounded-full">
                  <Calendar className="h-5 w-5 text-orange-600" />
                </div>
                <h3 className="font-medium">Dates</h3>
              </div>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Created</span>
                  <span className="font-medium">{new Date(property.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Last Updated</span>
                  <span className="font-medium">{new Date(property.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PropertyDetailPage;
