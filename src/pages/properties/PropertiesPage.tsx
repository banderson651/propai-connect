
import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PropertyCard } from '@/components/properties/PropertyCard';
import { PropertyFilters } from '@/components/properties/PropertyFilters';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Plus, Filter } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getProperties } from '@/services/propertyService';
import { Property, PropertyStatus, PropertyType } from '@/types/property';

const PropertiesPage = () => {
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<{
    status?: PropertyStatus;
    type?: PropertyType;
    ownerId?: string;
    tags?: string[];
    minPrice?: number;
    maxPrice?: number;
    city?: string;
    state?: string;
  }>({});

  const { data: properties = [], isLoading } = useQuery({
    queryKey: ['properties', filters],
    queryFn: () => getProperties(filters),
  });

  // For demonstration, using the property owners from the data
  const owners = React.useMemo(() => {
    const uniqueOwners = new Map();
    properties.forEach((property: Property) => {
      if (!uniqueOwners.has(property.ownerId)) {
        uniqueOwners.set(property.ownerId, {
          id: property.ownerId,
          name: property.ownerName,
        });
      }
    });
    return Array.from(uniqueOwners.values());
  }, [properties]);

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
  };

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Properties</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your real estate portfolio</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-1" /> Filters
          </Button>
          <Button asChild>
            <Link to="/properties/new">
              <Plus className="h-4 w-4 mr-1" /> Add Property
            </Link>
          </Button>
        </div>
      </div>

      {showFilters && (
        <div className="mb-6">
          <PropertyFilters onFilterChange={handleFilterChange} owners={owners} />
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-12">
          <p>Loading properties...</p>
        </div>
      ) : properties.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border">
          <h3 className="text-lg font-medium mb-2">No properties found</h3>
          <p className="text-gray-500 mb-4">
            {Object.keys(filters).length > 0
              ? "No properties match your filters. Try adjusting your criteria."
              : "Get started by adding your first property."}
          </p>
          <Button asChild>
            <Link to="/properties/new">
              <Plus className="h-4 w-4 mr-1" /> Add Property
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property: Property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default PropertiesPage;
