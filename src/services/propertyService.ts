
import { supabase } from '@/lib/supabase';
import { Property, PropertyStatus, PropertyType } from '@/types/property';
import { Contact } from '@/types/contact';

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
  try {
    let query = supabase
      .from('properties')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters) {
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      
      if (filters.type) {
        query = query.eq('property_type', filters.type);
      }
      
      if (filters.minPrice !== undefined) {
        query = query.gte('price', filters.minPrice);
      }
      
      if (filters.maxPrice !== undefined) {
        query = query.lte('price', filters.maxPrice);
      }
    }

    const { data, error } = await query;

    if (error) throw error;

    // Transform database format to application format
    return (data || []).map(property => ({
      id: property.id,
      title: property.title,
      description: property.description,
      address: property.location || '',
      city: '',
      state: '',
      zipCode: '',
      price: property.price || 0,
      bedrooms: 0,
      bathrooms: 0,
      squareFeet: 0,
      lotSize: 0,
      yearBuilt: 0,
      propertyType: property.property_type as PropertyType || 'residential',
      status: property.status as PropertyStatus,
      tags: [],
      features: [],
      images: ['/placeholder.svg'],
      ownerId: property.user_id,
      ownerName: 'Owner',
      createdAt: property.created_at,
      updatedAt: property.updated_at,
      publicPageUrl: `/properties/public/${property.title?.toLowerCase().replace(/\s+/g, '-') || property.id}`
    })) as Property[];
  } catch (error) {
    console.error('Error fetching properties:', error);
    return [];
  }
};

// Get property by ID
export const getPropertyById = async (id: string): Promise<Property | null> => {
  try {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    return {
      id: data.id,
      title: data.title,
      description: data.description,
      address: data.location || '',
      city: '',
      state: '',
      zipCode: '',
      price: data.price || 0,
      bedrooms: 0,
      bathrooms: 0,
      squareFeet: 0,
      lotSize: 0,
      yearBuilt: 0,
      propertyType: data.property_type as PropertyType || 'residential',
      status: data.status as PropertyStatus,
      tags: [],
      features: [],
      images: ['/placeholder.svg'],
      ownerId: data.user_id,
      ownerName: 'Owner',
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      publicPageUrl: `/properties/public/${data.title?.toLowerCase().replace(/\s+/g, '-') || data.id}`
    } as Property;
  } catch (error) {
    console.error('Error fetching property:', error);
    return null;
  }
};

// Create a new property
export const createProperty = async (propertyData: Omit<Property, 'id' | 'createdAt' | 'updatedAt' | 'publicPageUrl'>): Promise<Property> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('properties')
      .insert({
        user_id: user.id,
        title: propertyData.title,
        description: propertyData.description,
        price: propertyData.price,
        location: propertyData.address || `${propertyData.city}, ${propertyData.state}`,
        property_type: propertyData.propertyType,
        status: propertyData.status
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      title: data.title,
      description: data.description,
      address: propertyData.address,
      city: propertyData.city,
      state: propertyData.state,
      zipCode: propertyData.zipCode,
      price: data.price || 0,
      bedrooms: propertyData.bedrooms,
      bathrooms: propertyData.bathrooms,
      squareFeet: propertyData.squareFeet,
      lotSize: propertyData.lotSize,
      yearBuilt: propertyData.yearBuilt,
      propertyType: data.property_type as PropertyType,
      status: data.status as PropertyStatus,
      tags: propertyData.tags,
      features: propertyData.features,
      images: propertyData.images,
      ownerId: data.user_id,
      ownerName: propertyData.ownerName,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      publicPageUrl: `/properties/public/${data.title?.toLowerCase().replace(/\s+/g, '-') || data.id}`
    } as Property;
  } catch (error) {
    console.error('Error creating property:', error);
    throw error;
  }
};

// Update an existing property
export const updateProperty = async (id: string, propertyData: Partial<Omit<Property, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Property | null> => {
  try {
    const updateData: any = {};
    
    if (propertyData.title !== undefined) updateData.title = propertyData.title;
    if (propertyData.description !== undefined) updateData.description = propertyData.description;
    if (propertyData.price !== undefined) updateData.price = propertyData.price;
    if (propertyData.address) {
      updateData.location = propertyData.address;
    } else if (propertyData.city && propertyData.state) {
      updateData.location = `${propertyData.city}, ${propertyData.state}`;
    }
    if (propertyData.propertyType !== undefined) updateData.property_type = propertyData.propertyType;
    if (propertyData.status !== undefined) updateData.status = propertyData.status;

    const { data, error } = await supabase
      .from('properties')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      title: data.title,
      description: data.description,
      address: propertyData.address || data.location || '',
      city: propertyData.city || '',
      state: propertyData.state || '',
      zipCode: propertyData.zipCode || '',
      price: data.price || 0,
      bedrooms: propertyData.bedrooms || 0,
      bathrooms: propertyData.bathrooms || 0,
      squareFeet: propertyData.squareFeet || 0,
      lotSize: propertyData.lotSize || 0,
      yearBuilt: propertyData.yearBuilt || 0,
      propertyType: data.property_type as PropertyType,
      status: data.status as PropertyStatus,
      tags: propertyData.tags || [],
      features: propertyData.features || [],
      images: propertyData.images || ['/placeholder.svg'],
      ownerId: data.user_id,
      ownerName: propertyData.ownerName || 'Owner',
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      publicPageUrl: `/properties/public/${data.title?.toLowerCase().replace(/\s+/g, '-') || data.id}`
    } as Property;
  } catch (error) {
    console.error('Error updating property:', error);
    return null;
  }
};

// Delete a property
export const deleteProperty = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('properties')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting property:', error);
    return false;
  }
};

// Submit a lead for a property
export const submitPropertyLead = async (
  propertyId: string, 
  leadData: { name: string; email: string; phone?: string; message?: string }
): Promise<Contact> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const property = await getPropertyById(propertyId);
    
    if (!property) {
      throw new Error("Property not found");
    }
    
    // Create a new lead/contact
    const { data, error } = await supabase
      .from('contacts')
      .insert({
        user_id: user.id,
        name: leadData.name,
        email: leadData.email,
        phone: leadData.phone,
        notes: leadData.message,
        tags: ['property-lead', `property-${propertyId}`, property.propertyType]
      })
      .select()
      .single();

    if (error) throw error;

    return {
      ...data,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      tags: data.tags || []
    } as Contact;
  } catch (error) {
    console.error('Error submitting property lead:', error);
    throw error;
  }
};
