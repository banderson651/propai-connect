import React from 'react';
import { EmailTemplateProps } from './types';

export const OpenHouseInvitationTemplate: React.FC<EmailTemplateProps> = ({
  recipientName,
  property,
  eventDetails,
  agent,
  rsvpLink,
}) => {
  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-sm">
      <header className="border-b pb-4 mb-6 text-center">
        <h1 className="text-2xl font-bold text-gray-800">Open House Invitation</h1>
        <p className="text-gray-600 mt-1">You're invited to tour this beautiful property</p>
      </header>
      
      <div className="mb-6">
        <img 
          src={property.mainImage} 
          alt={property.title}
          className="w-full h-64 object-cover rounded-lg"
        />
        <h2 className="text-xl font-semibold mt-4">{property.title}</h2>
        <p className="text-gray-700">{property.address}</p>
      </div>
      
      <div className="bg-blue-50 p-4 rounded-lg mb-6">
        <h3 className="font-medium text-blue-800 mb-2">Event Details</h3>
        <div className="space-y-2">
          <p><span className="font-medium">Date:</span> {eventDetails.date}</p>
          <p><span className="font-medium">Time:</span> {eventDetails.time}</p>
          <p><span className="font-medium">Location:</span> {property.address}</p>
          {eventDetails.specialNotes && (
            <p><span className="font-medium">Notes:</span> {eventDetails.specialNotes}</p>
          )}
        </div>
      </div>
      
      <div className="mb-6">
        <h3 className="font-medium mb-2">Property Highlights</h3>
        <ul className="list-disc pl-5 space-y-1">
          {property.highlights.map((highlight, i) => (
            <li key={i} className="text-gray-700">{highlight}</li>
          ))}
        </ul>
      </div>
      
      <div className="border-t pt-6 text-center">
        <a 
          href={rsvpLink}
          className="inline-block bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-md transition-colors mb-4"
        >
          RSVP Now
        </a>
        <p className="text-sm text-gray-500">
          Hosted by {agent.name} | {agent.phone} | {agent.email}
        </p>
      </div>
    </div>
  );
};

interface OpenHouseInvitationTemplateProps extends EmailTemplateProps {
  property: {
    title: string;
    mainImage: string;
    address: string;
    highlights: string[];
  };
  eventDetails: {
    date: string;
    time: string;
    specialNotes?: string;
  };
  agent: {
    name: string;
    phone: string;
    email: string;
  };
  rsvpLink: string;
}
