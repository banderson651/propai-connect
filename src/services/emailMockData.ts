
import { Campaign, EmailAccount, EmailAccountStatus, EmailAccountType, EmailTemplate } from '@/types/email';

export const mockEmailAccounts: EmailAccount[] = [
  {
    id: '1',
    user_id: 'current-user',
    email: 'john.doe@gmail.com',
    name: 'John Doe',
    provider: 'Gmail',
    type: 'smtp' as EmailAccountType,
    status: 'connected' as EmailAccountStatus,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    last_checked: new Date().toISOString(),
    host: 'smtp.gmail.com',
    port: 587,
    secure: true,
    smtp_secure: true,
    username: 'john.doe@gmail.com',
    is_active: true,
    is_default: true,
    domain_verified: true
  },
  {
    id: '2',
    user_id: 'current-user',
    email: 'john.business@outlook.com',
    name: 'John Business',
    provider: 'Outlook',
    type: 'smtp' as EmailAccountType,
    status: 'error' as EmailAccountStatus,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    last_checked: new Date().toISOString(),
    host: 'smtp-mail.outlook.com',
    port: 587,
    secure: true,
    smtp_secure: true,
    username: 'john.business@outlook.com',
    errorMessage: 'Authentication failed. Please check your credentials.',
    is_active: false,
    is_default: false,
    domain_verified: false
  },
];

export const mockTemplates: EmailTemplate[] = [
  {
    id: '1',
    name: 'Property Listing Announcement',
    subject: 'New Property Just Listed!',
    body: `
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
    tags: ['property', 'announcement', 'listing'],
    isPrebuilt: false
  },
  {
    id: '2',
    name: 'Monthly Newsletter',
    subject: 'Real Estate Market Update - {{month}}',
    body: `
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
    tags: ['newsletter', 'market update'],
    isPrebuilt: false
  }
];

export const mockCampaigns: Campaign[] = [
  {
    id: '1',
    name: 'New Listings July 2023',
    subject: 'New Property Just Listed!',
    body: 'Check out our new property listings...',
    senderEmailAccountId: '1',
    contactListId: 'list1',
    status: 'draft',
    sentAt: null,
    stats: { sent: 0, opened: 0, clicked: 0, bounced: 0 },
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
    subject: 'Real Estate Market Update - August',
    body: 'Monthly market update content...',
    senderEmailAccountId: '1',
    contactListId: 'list2',
    status: 'sent',
    sentAt: new Date(new Date().setDate(new Date().getDate() + 5)).toISOString(),
    stats: { sent: 120, opened: 80, clicked: 25, bounced: 2 },
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
    subject: 'Price Reduced - Don\'t Miss Out!',
    body: 'Great news! Property prices have been reduced...',
    senderEmailAccountId: '1',
    contactListId: 'list1',
    status: 'sent',
    sentAt: new Date(new Date().setDate(new Date().getDate() - 10)).toISOString(),
    stats: { sent: 45, opened: 31, clicked: 11, bounced: 1 },
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
