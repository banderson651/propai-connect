import React from 'react';
import { EmailTemplateProps } from './types';

export const ClientFollowUpTemplate: React.FC<EmailTemplateProps> = ({
  recipientName,
  agent,
  followUpType,
  customMessage,
  callToAction,
}) => {
  const getSubjectLine = () => {
    switch (followUpType) {
      case 'property-viewing':
        return `Thoughts on the ${callToAction.propertyAddress} property?`;
      case 'general-checkin':
        return `Checking in - How can I help?`;
      case 'market-update':
        return `Market update for your area`;
      default:
        return `Following up`;
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-sm">
      <header className="border-b pb-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">{getSubjectLine()}</h1>
        <p className="text-gray-600 mt-1">A message from {agent.name}</p>
      </header>
      
      <div className="mb-6">
        <p className="text-gray-700 mb-4">Hi {recipientName},</p>
        
        {customMessage ? (
          <p className="text-gray-700">{customMessage}</p>
        ) : (
          <p className="text-gray-700">
            I wanted to follow up with you regarding our recent conversation. 
            Please don't hesitate to reach out if you have any questions or 
            if there's anything else I can assist you with.
          </p>
        )}
      </div>
      
      {callToAction && (
        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <h3 className="font-medium text-blue-800 mb-2">Next Steps</h3>
          <p className="text-gray-700 mb-3">{callToAction.message}</p>
          <a 
            href={callToAction.link}
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md text-sm transition-colors"
          >
            {callToAction.buttonText || 'Take Action'}
          </a>
        </div>
      )}
      
      <div className="border-t pt-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <img 
              src={agent.photo} 
              alt={agent.name}
              className="h-12 w-12 rounded-full"
            />
          </div>
          <div className="ml-4">
            <p className="font-medium">{agent.name}</p>
            <p className="text-sm text-gray-500">{agent.title}</p>
            <p className="text-sm">{agent.phone} | {agent.email}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

interface ClientFollowUpTemplateProps extends EmailTemplateProps {
  agent: {
    name: string;
    title: string;
    phone: string;
    email: string;
    photo: string;
  };
  followUpType: 'property-viewing' | 'general-checkin' | 'market-update' | string;
  callToAction?: {
    message: string;
    link: string;
    buttonText?: string;
    propertyAddress?: string;
  };
}
