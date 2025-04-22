
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PropertyStatus, PropertyType } from '@/types/property';

interface PropertyFiltersProps {
  onFilterChange: (filters: {
    status?: PropertyStatus;
    type?: PropertyType;
    ownerId?: string;
    tags?: string[];
    minPrice?: number;
    maxPrice?: number;
    city?: string;
    state?: string;
  }) => void;
  owners: { id: string; name: string }[];
}

export const PropertyFilters: React.FC<PropertyFiltersProps> = ({
  onFilterChange,
  owners,
}) => {
  const [filters, setFilters] = useState({
    status: undefined as PropertyStatus | undefined,
    type: undefined as PropertyType | undefined,
    ownerId: '',
    minPrice: '',
    maxPrice: '',
    city: '',
    state: '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement> | 
    { name: string; value: string }
  ) => {
    const { name, value } = 'target' in e ? e.target : e;
    
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    onFilterChange({
      status: filters.status,
      type: filters.type,
      ownerId: filters.ownerId || undefined,
      minPrice: filters.minPrice ? Number(filters.minPrice) : undefined,
      maxPrice: filters.maxPrice ? Number(filters.maxPrice) : undefined,
      city: filters.city || undefined,
      state: filters.state || undefined,
    });
  };

  const handleReset = () => {
    setFilters({
      status: undefined,
      type: undefined,
      ownerId: '',
      minPrice: '',
      maxPrice: '',
      city: '',
      state: '',
    });
    
    onFilterChange({});
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg bg-white">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select 
            onValueChange={(value) => handleSelectChange('status', value)}
            value={filters.status || ''}
          >
            <SelectTrigger id="status">
              <SelectValue placeholder="Any status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Any status</SelectItem>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="sold">Sold</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="under-contract">Under Contract</SelectItem>
              <SelectItem value="construction">Construction</SelectItem>
              <SelectItem value="pre-construction">Pre-Construction</SelectItem>
              <SelectItem value="foreclosure">Foreclosure</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="type">Property Type</Label>
          <Select 
            onValueChange={(value) => handleSelectChange('type', value)}
            value={filters.type || ''}
          >
            <SelectTrigger id="type">
              <SelectValue placeholder="Any type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Any type</SelectItem>
              <SelectItem value="residential">Residential</SelectItem>
              <SelectItem value="commercial">Commercial</SelectItem>
              <SelectItem value="land">Land</SelectItem>
              <SelectItem value="industrial">Industrial</SelectItem>
              <SelectItem value="multi-family">Multi-Family</SelectItem>
              <SelectItem value="condo">Condo</SelectItem>
              <SelectItem value="apartment">Apartment</SelectItem>
              <SelectItem value="townhouse">Townhouse</SelectItem>
              <SelectItem value="single-family">Single Family</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="owner">Owner</Label>
          <Select 
            onValueChange={(value) => handleSelectChange('ownerId', value)}
            value={filters.ownerId}
          >
            <SelectTrigger id="owner">
              <SelectValue placeholder="Any owner" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Any owner</SelectItem>
              {owners.map((owner) => (
                <SelectItem key={owner.id} value={owner.id}>
                  {owner.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <Input
            id="city"
            name="city"
            value={filters.city}
            onChange={handleChange}
            placeholder="Any city"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="state">State</Label>
          <Input
            id="state"
            name="state"
            value={filters.state}
            onChange={handleChange}
            placeholder="Any state"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="minPrice">Min Price</Label>
          <Input
            id="minPrice"
            name="minPrice"
            type="number"
            value={filters.minPrice}
            onChange={handleChange}
            placeholder="No minimum"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="maxPrice">Max Price</Label>
          <Input
            id="maxPrice"
            name="maxPrice"
            type="number"
            value={filters.maxPrice}
            onChange={handleChange}
            placeholder="No maximum"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={handleReset}>
          Reset
        </Button>
        <Button type="submit">Apply Filters</Button>
      </div>
    </form>
  );
};
