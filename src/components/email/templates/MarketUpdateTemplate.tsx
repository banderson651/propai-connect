import React from 'react';
import { EmailTemplateProps } from './types';

export const MarketUpdateTemplate: React.FC<EmailTemplateProps> = ({
  recipientName,
  marketData,
  agent,
  customMessage,
}) => {
  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-sm">
      <header className="border-b pb-4 mb-6 text-center">
        <h1 className="text-2xl font-bold text-gray-800">Market Update: {marketData.region}</h1>
        <p className="text-gray-600 mt-1">Current trends and insights for {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
      </header>
      
      {customMessage && (
        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <p className="text-blue-800">{customMessage}</p>
        </div>
      )}
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-50 p-3 rounded">
          <p className="text-sm text-gray-500">Median Price</p>
          <p className="font-medium text-lg">{marketData.medianPrice}</p>
          <p className="text-xs mt-1 text-gray-500">
            {marketData.priceChange >= 0 ? '↑' : '↓'} {Math.abs(marketData.priceChange)}% from last month
          </p>
        </div>
        <div className="bg-gray-50 p-3 rounded">
          <p className="text-sm text-gray-500">Inventory</p>
          <p className="font-medium text-lg">{marketData.inventory}</p>
          <p className="text-xs mt-1 text-gray-500">
            {marketData.inventoryChange >= 0 ? '+' : ''}{marketData.inventoryChange} homes
          </p>
        </div>
        <div className="bg-gray-50 p-3 rounded">
          <p className="text-sm text-gray-500">Days on Market</p>
          <p className="font-medium text-lg">{marketData.daysOnMarket}</p>
          <p className="text-xs mt-1 text-gray-500">
            {marketData.domChange >= 0 ? '+' : ''}{marketData.domChange} days
          </p>
        </div>
        <div className="bg-gray-50 p-3 rounded">
          <p className="text-sm text-gray-500">Price per Sq.Ft.</p>
          <p className="font-medium text-lg">{marketData.pricePerSqft}</p>
          <p className="text-xs mt-1 text-gray-500">
            {marketData.sqftChange >= 0 ? '↑' : '↓'} {Math.abs(marketData.sqftChange)}%
          </p>
        </div>
      </div>
      
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Market Summary</h2>
        <p className="text-gray-700">{marketData.summary}</p>
      </div>
      
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Featured Listings</h2>
        <div className="space-y-4">
          {marketData.featuredListings.map((listing, i) => (
            <div key={i} className="border rounded-lg p-3">
              <div className="flex">
                <div className="flex-shrink-0 w-24 h-24 bg-gray-200 rounded overflow-hidden">
                  <img src={listing.image} alt={listing.address} className="w-full h-full object-cover" />
                </div>
                <div className="ml-4">
                  <p className="font-medium">{listing.address}</p>
                  <p className="text-sm text-gray-600">{listing.price} • {listing.beds} beds • {listing.baths} baths • {listing.sqft} sqft</p>
                  <a 
                    href={listing.link}
                    className="inline-block mt-1 text-sm text-blue-600 hover:text-blue-800"
                  >
                    View Details
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="border-t pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">{agent.name}</p>
            <p className="text-sm text-gray-500">{agent.title}</p>
            <p className="text-sm">{agent.phone}</p>
          </div>
          <a 
            href={agent.scheduleLink}
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md text-sm transition-colors"
          >
            Schedule Consultation
          </a>
        </div>
      </div>
    </div>
  );
};

interface MarketUpdateTemplateProps extends EmailTemplateProps {
  marketData: {
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
  agent: {
    name: string;
    title: string;
    phone: string;
    scheduleLink: string;
  };
}
