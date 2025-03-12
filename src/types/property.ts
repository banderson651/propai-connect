
export type PropertyStatus = 
  | 'available' 
  | 'sold' 
  | 'pending' 
  | 'under-contract'
  | 'construction'
  | 'pre-construction'
  | 'foreclosure';

export type PropertyType = 
  | 'residential'
  | 'commercial'
  | 'land'
  | 'industrial'
  | 'multi-family'
  | 'condo'
  | 'apartment'
  | 'townhouse'
  | 'single-family';

export type PropertyTag = 
  | 'luxury'
  | 'investment'
  | 'rental'
  | 'new-construction'
  | 'renovated'
  | 'waterfront'
  | 'beachfront'
  | 'mountain-view'
  | 'downtown'
  | 'suburban'
  | 'rural'
  | string;

export interface Property {
  id: string;
  title: string;
  description: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  price: number;
  bedrooms?: number;
  bathrooms?: number;
  squareFeet?: number;
  lotSize?: number;
  yearBuilt?: number;
  propertyType: PropertyType;
  status: PropertyStatus;
  tags: PropertyTag[];
  features: string[];
  images: string[];
  ownerId: string;
  ownerName: string;
  createdAt: string;
  updatedAt: string;
  publicPageUrl: string;
}
