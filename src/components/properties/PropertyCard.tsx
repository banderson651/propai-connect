
import React from 'react';
import { Property } from '@/types/property';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { Eye, Edit, Share2 } from 'lucide-react';

interface PropertyCardProps {
  property: Property;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({ property }) => {
  const statusColors = {
    'available': 'bg-green-100 text-green-800',
    'sold': 'bg-gray-100 text-gray-800',
    'pending': 'bg-yellow-100 text-yellow-800',
    'under-contract': 'bg-blue-100 text-blue-800',
    'construction': 'bg-purple-100 text-purple-800',
    'pre-construction': 'bg-indigo-100 text-indigo-800',
    'foreclosure': 'bg-red-100 text-red-800'
  };

  const handleShare = () => {
    navigator.clipboard.writeText(`${window.location.origin}${property.publicPageUrl}`);
    // In a real app, this would show a toast notification
    alert('Property link copied to clipboard!');
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative h-48 overflow-hidden">
        <img 
          src={property.images[0] || '/placeholder.svg'} 
          alt={property.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-3 right-3">
          <Badge variant="outline" className={`${statusColors[property.status]} border-0`}>
            {property.status.replace('-', ' ')}
          </Badge>
        </div>
      </div>
      
      <CardHeader className="p-4 pb-0">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold text-lg truncate">{property.title}</h3>
            <p className="text-sm text-muted-foreground">{property.city}, {property.state}</p>
          </div>
          <p className="font-semibold text-lg">{formatCurrency(property.price)}</p>
        </div>
      </CardHeader>
      
      <CardContent className="p-4">
        <div className="flex gap-4 mb-3">
          {property.bedrooms && (
            <div>
              <p className="text-sm font-medium">{property.bedrooms}</p>
              <p className="text-xs text-muted-foreground">Beds</p>
            </div>
          )}
          {property.bathrooms && (
            <div>
              <p className="text-sm font-medium">{property.bathrooms}</p>
              <p className="text-xs text-muted-foreground">Baths</p>
            </div>
          )}
          {property.squareFeet && (
            <div>
              <p className="text-sm font-medium">{property.squareFeet.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Sq Ft</p>
            </div>
          )}
        </div>
        
        <div className="flex flex-wrap gap-1 mt-2">
          {property.tags.slice(0, 3).map((tag, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {tag.replace('-', ' ')}
            </Badge>
          ))}
          {property.tags.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{property.tags.length - 3} more
            </Badge>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0 flex justify-between">
        <Button asChild variant="outline" size="sm">
          <Link to={`/properties/${property.id}`}>
            <Eye className="h-4 w-4 mr-1" /> Details
          </Link>
        </Button>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm">
            <Link to={`/properties/${property.id}/edit`}>
              <Edit className="h-4 w-4 mr-1" /> Edit
            </Link>
          </Button>
          <Button variant="outline" size="sm" onClick={handleShare}>
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};
