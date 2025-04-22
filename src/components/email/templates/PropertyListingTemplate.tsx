import React from 'react';
import { EmailTemplateProps } from './types';

export const PropertyListingTemplate: React.FC<EmailTemplateProps> = ({
  contact,
  campaign,
  property,
  agent,
  customMessage,
}) => {
  // Safe default values for merge tags
  const recipientName = contact?.firstName ? `${contact.firstName} ${contact.lastName}` : 'Valued Client';
  const projectName = campaign?.projectName || 'our project';

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-sm">
      <header className="border-b pb-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          {`Hi ${recipientName}, check out this ${projectName} property!`}
        </h1>
        <p className="text-gray-600 mt-1">Exclusively listed by {agent?.name}</p>
      </header>
      
      {property?.mainImage && (
        <div className="mb-6">
          <img 
            src={property.mainImage} 
            alt={property.title}
            className="w-full h-64 object-cover rounded-lg"
          />
        </div>
      )}
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-50 p-3 rounded">
          <p className="text-sm text-gray-500">Price</p>
          <p className="font-medium">{property?.price}</p>
        </div>
        <div className="bg-gray-50 p-3 rounded">
          <p className="text-sm text-gray-500">Bed/Bath</p>
          <p className="font-medium">{property?.beds} / {property?.baths}</p>
        </div>
        <div className="bg-gray-50 p-3 rounded">
          <p className="text-sm text-gray-500">Sq. Ft.</p>
          <p className="font-medium">{property?.sqft}</p>
        </div>
        <div className="bg-gray-50 p-3 rounded">
          <p className="text-sm text-gray-500">Location</p>
          <p className="font-medium">{property?.location}</p>
        </div>
      </div>
      
      {customMessage && (
        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <p className="text-blue-800">{customMessage}</p>
        </div>
      )}
      
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Property Highlights</h2>
        <ul className="list-disc pl-5 space-y-1">
          {property?.highlights?.map((highlight, i) => (
            <li key={i} className="text-gray-700">{highlight}</li>
          ))}
        </ul>
      </div>
      
      <div className="border-t pt-6">
        <a 
          href={property?.link}
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-md transition-colors"
        >
          View Full Listing
        </a>
        <p className="text-sm text-gray-500 mt-4">
          Reply to this email or contact {agent?.name} directly at {agent?.phone}
        </p>
      </div>
    </div>
  );
};

interface PropertyListingTemplateProps extends EmailTemplateProps {
  property: {
    title: string;
    mainImage: string;
    price: string;
    beds: number;
    baths: number;
    sqft: number;
    location: string;
    highlights: string[];
    link: string;
  };
  agent: {
    name: string;
    phone: string;
  };
}
