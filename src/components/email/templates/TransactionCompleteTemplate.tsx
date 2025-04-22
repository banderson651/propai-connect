import React from 'react';
import { EmailTemplateProps } from './types';

export const TransactionCompleteTemplate: React.FC<EmailTemplateProps> = ({
  recipientName,
  transaction,
  agent,
  nextSteps,
}) => {
  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-sm">
      <header className="border-b pb-4 mb-6 text-center">
        <h1 className="text-2xl font-bold text-gray-800">
          {transaction.type === 'sale' ? 'Congratulations on Your Sale!' : 'Welcome to Your New Home!'}
        </h1>
        <p className="text-gray-600 mt-1">
          {transaction.type === 'sale' 
            ? `Your property at ${transaction.propertyAddress} has closed!` 
            : `Your new property at ${transaction.propertyAddress} is officially yours!`}
        </p>
      </header>
      
      <div className="mb-6 text-center">
        <div className="inline-block bg-green-100 text-green-800 rounded-full px-4 py-2 mb-4">
          <p className="font-medium">Closed on {transaction.closeDate}</p>
        </div>
        
        {transaction.type === 'purchase' && (
          <div className="mb-6">
            <img 
              src={transaction.propertyImage} 
              alt={transaction.propertyAddress}
              className="w-full max-w-md mx-auto h-48 object-cover rounded-lg"
            />
          </div>
        )}
      </div>
      
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Transaction Details</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Property Address</p>
            <p className="font-medium">{transaction.propertyAddress}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Closing Date</p>
            <p className="font-medium">{transaction.closeDate}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">
              {transaction.type === 'sale' ? 'Sale Price' : 'Purchase Price'}
            </p>
            <p className="font-medium">{transaction.price}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Transaction Type</p>
            <p className="font-medium capitalize">{transaction.type}</p>
          </div>
        </div>
      </div>
      
      {nextSteps && (
        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <h3 className="font-medium text-blue-800 mb-2">What's Next?</h3>
          <ul className="list-disc pl-5 space-y-1">
            {nextSteps.map((step, i) => (
              <li key={i} className="text-gray-700">{step}</li>
            ))}
          </ul>
        </div>
      )}
      
      <div className="border-t pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">{agent.name}</p>
            <p className="text-sm text-gray-500">{agent.title}</p>
            <p className="text-sm">{agent.phone} | {agent.email}</p>
          </div>
          
          <div className="text-right">
            <p className="text-sm text-gray-500 mb-1">Need anything else?</p>
            <a 
              href={agent.contactLink}
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md text-sm transition-colors"
            >
              Contact Me
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

interface TransactionCompleteTemplateProps extends EmailTemplateProps {
  transaction: {
    type: 'sale' | 'purchase';
    propertyAddress: string;
    closeDate: string;
    price: string;
    propertyImage?: string;
  };
  agent: {
    name: string;
    title: string;
    phone: string;
    email: string;
    contactLink: string;
  };
  nextSteps?: string[];
}
