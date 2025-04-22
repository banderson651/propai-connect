export interface EmailCampaignContact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  customFields?: Record<string, string>;
}

export interface EmailTemplateProps {
  contact?: EmailCampaignContact;
  campaign?: {
    name: string;
    projectName?: string;
  };
  recipientName: string;
  customMessage?: string;
  property?: {
    title: string;
    mainImage: string;
    price: string;
    beds: number;
    baths: number;
    sqft: number;
    location: string;
    highlights: string[];
    link: string;
    address?: string;
  };
  agent?: {
    name: string;
    phone: string;
    email?: string;
    photo?: string;
    title?: string;
    scheduleLink?: string;
    contactLink?: string;
  };
  eventDetails?: {
    date: string;
    time: string;
    specialNotes?: string;
  };
  rsvpLink?: string;
  followUpType?: 'property-viewing' | 'general-checkin' | 'market-update' | string;
  callToAction?: {
    message: string;
    link: string;
    buttonText?: string;
    propertyAddress?: string;
  };
  marketData?: {
    region: string;
    medianPrice: string;
    priceChange: number;
    inventory: number;
    inventoryChange: number;
    daysOnMarket: number;
    domChange: number;
    pricePerSqft: string;
    sqftChange: number;
    summary: string;
    featuredListings: Array<{
      address: string;
      price: string;
      beds: number;
      baths: number;
      sqft: number;
      image: string;
      link: string;
    }>;
  };
  transaction?: {
    type: 'sale' | 'purchase';
    propertyAddress: string;
    closeDate: string;
    price: string;
    propertyImage?: string;
  };
  nextSteps?: string[];
}
