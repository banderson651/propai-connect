
import { Property, PropertyStatus, PropertyType } from '@/types/property';
import { mockProperties } from './propertyMockData';
import { v4 as uuidv4 } from 'uuid';
import { Contact } from '@/types/contact';

// In-memory property database
let properties = [...mockProperties];

// Get all properties with optional filtering
export const getProperties = async (filters?: {
  status?: PropertyStatus;
  type?: PropertyType;
  ownerId?: string;
  tags?: string[];
  minPrice?: number;
  maxPrice?: number;
  city?: string;
  state?: string;
}): Promise<Property[]> => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 500));
  
  let filteredProperties = [...properties];
  
  if (filters) {
    if (filters.status) {
      filteredProperties = filteredProperties.filter(p => p.status === filters.status);
    }
    
    if (filters.type) {
      filteredProperties = filteredProperties.filter(p => p.propertyType === filters.type);
    }
    
    if (filters.ownerId) {
      filteredProperties = filteredProperties.filter(p => p.ownerId === filters.ownerId);
    }
    
    if (filters.tags && filters.tags.length > 0) {
      filteredProperties = filteredProperties.filter(p => 
        filters.tags?.some(tag => p.tags.includes(tag))
      );
    }
    
    if (filters.minPrice !== undefined) {
      filteredProperties = filteredProperties.filter(p => p.price >= filters.minPrice!);
    }
    
    if (filters.maxPrice !== undefined) {
      filteredProperties = filteredProperties.filter(p => p.price <= filters.maxPrice!);
    }
    
    if (filters.city) {
      filteredProperties = filteredProperties.filter(p => 
        p.city.toLowerCase().includes(filters.city!.toLowerCase())
      );
    }
    
    if (filters.state) {
      filteredProperties = filteredProperties.filter(p => p.state === filters.state);
    }
  }
  
  return filteredProperties;
};

// Get property by ID
export const getPropertyById = async (id: string): Promise<Property | null> => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 300));
  return properties.find(p => p.id === id) || null;
};

// Create a new property
export const createProperty = async (propertyData: Omit<Property, 'id' | 'createdAt' | 'updatedAt' | 'publicPageUrl'>): Promise<Property> => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const newProperty: Property = {
    ...propertyData,
    id: uuidv4(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    publicPageUrl: `/properties/public/${propertyData.title.toLowerCase().replace(/\s+/g, '-')}`
  };
  
  properties.push(newProperty);
  return newProperty;
};

// Update an existing property
export const updateProperty = async (id: string, propertyData: Partial<Omit<Property, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Property | null> => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 600));
  
  const propertyIndex = properties.findIndex(p => p.id === id);
  
  if (propertyIndex === -1) {
    return null;
  }
  
  const updatedProperty = {
    ...properties[propertyIndex],
    ...propertyData,
    updatedAt: new Date().toISOString()
  };
  
  properties[propertyIndex] = updatedProperty;
  return updatedProperty;
};

// Delete a property
export const deleteProperty = async (id: string): Promise<boolean> => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 400));
  
  const initialLength = properties.length;
  properties = properties.filter(p => p.id !== id);
  
  return properties.length < initialLength;
};

// Submit a lead for a property
export const submitPropertyLead = async (
  propertyId: string, 
  leadData: { name: string; email: string; phone?: string; message?: string }
): Promise<Contact> => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 700));
  
  const property = properties.find(p => p.id === propertyId);
  
  if (!property) {
    throw new Error("Property not found");
  }
  
  // Create a new lead/contact (in a real app, this would call the contactService)
  const newContact: Contact = {
    id: uuidv4(),
    name: leadData.name,
    email: leadData.email,
    phone: leadData.phone,
    notes: leadData.message,
    tags: ['property-lead', `property-${propertyId}`, property.propertyType],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  // In a real app, this would be handled by the contacts service
  // Here we're just returning the created contact
  return newContact;
};
