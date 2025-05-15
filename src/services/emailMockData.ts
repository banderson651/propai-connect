import { Campaign, EmailAccount, EmailAccountStatus, EmailAccountType, EmailTemplate } from '@/types/email';

export const mockEmailAccounts: EmailAccount[] = [
  {
    id: '1',
    userId: 'current-user',
    email: 'john.doe@gmail.com',
    name: 'John Doe',
    provider: 'Gmail',
    type: 'smtp' as EmailAccountType, // Updated from 'gmail' to a valid type
    status: 'connected' as EmailAccountStatus,
    createdAt: new Date().toISOString(),
    lastSyncAt: new Date().toISOString(),
    host: 'smtp.gmail.com',
    port: 587,
    secure: true,
    username: 'john.doe@gmail.com'
  },
  {
    id: '2',
    userId: 'current-user',
    email: 'john.business@outlook.com',
    name: 'John Business',
    provider: 'Outlook',
    type: 'smtp' as EmailAccountType, // Updated from 'outlook' to a valid type
    status: 'error' as EmailAccountStatus,
    createdAt: new Date().toISOString(),
    lastSyncAt: new Date().toISOString(),
    host: 'smtp-mail.outlook.com',
    port: 587,
    secure: true,
    username: 'john.business@outlook.com',
    errorMessage: 'Authentication failed. Please check your credentials.'
  },
];

export const mockTemplates: EmailTemplate[] = [
  {
    id: '1',
    name: 'Property Listing Announcement',
    subject: 'New Property Just Listed!',
    content: `
      <h2>Exciting New Property Listing</h2>
      <p>Dear {{contact_name}},</p>
      <p>We're excited to share this new property that just came on the market:</p>
      <div style="margin: 15px 0;">
        <h3>{{property_name}}</h3>
        <p>{{property_address}}</p>
        <p><strong>Price:</strong> {{property_price}}</p>
        <p><strong>Features:</strong> {{property_features}}</p>
        <div style="margin-top: 10px;">
          <a href="{{property_url}}" style="background-color: #4CAF50; color: white; padding: 10px 15px; text-decoration: none; border-radius: 4px;">View Property Details</a>
        </div>
      </div>
      <p>Please let me know if you would like to schedule a viewing or if you have any questions.</p>
      <p>Best regards,<br>{{agent_name}}<br>{{agent_phone}}</p>
    `,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    userId: 'current-user',
    tags: ['property', 'announcement', 'listing']
  },
  {
    id: '2',
    name: 'Monthly Newsletter',
    subject: 'Real Estate Market Update - {{month}}',
    content: `
      <h2>Monthly Real Estate Update</h2>
      <p>Hello {{contact_name}},</p>
      <p>Here's what's happening in the real estate market this month:</p>
      <ul>
        <li>Market trends: {{market_trends}}</li>
        <li>Average prices: {{average_prices}}</li>
        <li>Interest rates: {{interest_rates}}</li>
      </ul>
      <h3>Featured Properties</h3>
      {{featured_properties}}
      <p>Feel free to reach out if you'd like more information on any of these topics.</p>
      <p>Regards,<br>{{agent_name}}<br>{{agent_phone}}</p>
    `,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    userId: 'current-user',
    tags: ['newsletter', 'market update']
  }
];

export const mockCampaigns: Campaign[] = [
  {
    id: '1',
    name: 'New Listings July 2023',
    templateId: '1',
    status: 'draft',
    scheduledDate: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    userId: 'current-user',
    recipientCount: 0,
    tags: ['listings', 'july'],
    accountId: '1'
  },
  {
    id: '2',
    name: 'Monthly Newsletter - August 2023',
    templateId: '2',
    status: 'scheduled',
    scheduledDate: new Date(new Date().setDate(new Date().getDate() + 5)).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    userId: 'current-user',
    recipientCount: 120,
    tags: ['newsletter', 'august'],
    accountId: '1'
  },
  {
    id: '3',
    name: 'Price Reduction Announcement',
    templateId: '1',
    status: 'sent',
    scheduledDate: new Date(new Date().setDate(new Date().getDate() - 10)).toISOString(),
    sentDate: new Date(new Date().setDate(new Date().getDate() - 10)).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    userId: 'current-user',
    recipientCount: 45,
    openRate: 68,
    clickRate: 24,
    tags: ['price reduction'],
    accountId: '1'
  }
];
