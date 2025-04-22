import { supabase } from '@/lib/supabase';
import type { EmailTemplate } from '@/types/email';
import type { EmailTemplateProps } from '../components/email/templates/types';
import { PropertyListingTemplate, OpenHouseInvitationTemplate, ClientFollowUpTemplate, MarketUpdateTemplate, TransactionCompleteTemplate } from '../components/email/templates';
import { renderTemplateToHtml } from '@/components/email/templates/renderTemplateToHtml';

// Fetch all email templates from Supabase
export const getEmailTemplates = async (): Promise<EmailTemplate[]> => {
  try {
    // First check if the table exists
    const { error: tableError } = await supabase
      .from('email_templates')
      .select('count')
      .limit(1);
    
    if (tableError && tableError.message.includes('does not exist')) {
      // Table doesn't exist, return empty array
      console.warn('email_templates table does not exist');
      return [];
    }

    const { data, error } = await supabase
      .from('email_templates')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    
    // Add sample templates if no templates exist
    if (!data || data.length === 0) {
      const sampleTemplates = getSampleTemplates();
      return sampleTemplates;
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching email templates:', error);
    // Return sample templates as fallback
    return getSampleTemplates();
  }
};

// Get sample templates with static HTML
export const getSampleTemplates = (): EmailTemplate[] => {
  return [
    {
      id: 'property-listing',
      name: 'Property Listing',
      description: 'Showcase property details with images and features',
      is_system: true,
      html_content: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0;">
        <h2 style="color: #2c3e50;">New Property Alert: Luxury Waterfront Villa</h2>
        <p style="color: #7f8c8d;">Exclusively listed by John Smith</p>
        <div style="background-color: #f5f5f5; height: 200px; display: flex; align-items: center; justify-content: center; margin: 20px 0;">
          <span style="color: #bdc3c7;">Property Image</span>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0;">
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px;">
            <p style="color: #7f8c8d; margin: 0 0 5px 0; font-size: 12px;">Price</p>
            <p style="margin: 0; font-weight: bold;">$1,250,000</p>
          </div>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px;">
            <p style="color: #7f8c8d; margin: 0 0 5px 0; font-size: 12px;">Bed/Bath</p>
            <p style="margin: 0; font-weight: bold;">4 / 3</p>
          </div>
        </div>
        <div style="background-color: #e8f4fc; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
          <p style="color: #3498db; margin: 0;">Don't miss this rare opportunity!</p>
        </div>
        <div style="text-align: center;">
          <a href="#" style="display: inline-block; background-color: #3498db; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">View Listing</a>
        </div>
      </div>`,
      thumbnail_url: '/templates/property-listing.png',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'open-house',
      name: 'Open House Invitation',
      description: 'Invite clients to property viewings with RSVP',
      is_system: true,
      html_content: '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0;"><h2 style="text-align: center; color: #2c3e50;">Open House Invitation</h2><p style="text-align: center; color: #7f8c8d;">You\'re invited to tour this beautiful property</p><div style="background-color: #f5f5f5; height: 200px; display: flex; align-items: center; justify-content: center; margin: 20px 0;"><span style="color: #bdc3c7;">Property Image</span></div><div style="background-color: #e8f4fc; padding: 15px; border-radius: 5px; margin-bottom: 20px;"><h3 style="color: #3498db; margin-top: 0;">Event Details</h3><p style="margin: 5px 0; font-size: 14px;">Date: Saturday, May 15th</p><p style="margin: 5px 0; font-size: 14px;">Time: 1:00 PM - 4:00 PM</p></div><div style="text-align: center;"><a href="#" style="display: inline-block; background-color: #27ae60; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">RSVP Now</a></div></div>',
      thumbnail_url: '/templates/open-house.png',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'client-followup',
      name: 'Client Follow-Up',
      description: 'Personalized follow-up with call-to-action',
      is_system: true,
      html_content: '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0;"><h2 style="color: #2c3e50;">Thoughts on the property?</h2><p style="color: #7f8c8d;">A message from Jane Realtor</p><p style="margin: 15px 0;">Hi {{contact.firstName}},</p><p style="margin: 15px 0;">I wanted to follow up regarding our recent property viewing. Please let me know if you have any questions!</p><div style="background-color: #e8f4fc; padding: 15px; border-radius: 5px; margin: 20px 0;"><h3 style="color: #3498db; margin-top: 0;">Next Steps</h3><p style="margin-bottom: 10px; font-size: 14px;">Would you like to schedule another viewing?</p><a href="#" style="display: inline-block; background-color: #3498db; color: white; padding: 8px 15px; text-decoration: none; border-radius: 5px; font-size: 14px;">Schedule Now</a></div></div>',
      thumbnail_url: '/templates/client-followup.png',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'market-update',
      name: 'Market Update',
      description: 'Share market trends and statistics with clients',
      is_system: true,
      html_content: '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0;"><h2 style="text-align: center; color: #2c3e50;">Market Update: Downtown Area</h2><p style="text-align: center; color: #7f8c8d;">Current trends for April 2025</p><div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0;"><div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px;"><p style="color: #7f8c8d; margin: 0 0 5px 0; font-size: 12px;">Median Price</p><p style="margin: 0 0 5px 0; font-weight: bold;">$750,000</p><p style="color: #27ae60; margin: 0; font-size: 12px;">↑ 3.2%</p></div><div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px;"><p style="color: #7f8c8d; margin: 0 0 5px 0; font-size: 12px;">Inventory</p><p style="margin: 0 0 5px 0; font-weight: bold;">142 homes</p><p style="color: #e74c3c; margin: 0; font-size: 12px;">↓ 5.1%</p></div></div><h3 style="color: #2c3e50; font-size: 16px;">Market Summary</h3><p style="color: #34495e; font-size: 14px;">The market continues to favor sellers with limited inventory and strong demand...</p></div>',
      thumbnail_url: '/templates/market-update.png',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'transaction-complete',
      name: 'Transaction Complete',
      description: 'Congratulate clients on successful transactions',
      is_system: true,
      html_content: '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0;"><h2 style="text-align: center; color: #2c3e50;">Congratulations on Your New Home!</h2><p style="text-align: center; color: #7f8c8d;">A message from your real estate team</p><div style="background-color: #f5f5f5; height: 200px; display: flex; align-items: center; justify-content: center; margin: 20px 0;"><span style="color: #bdc3c7;">Property Image</span></div><p style="margin: 15px 0; text-align: center; font-size: 16px;">Thank you for trusting us with your real estate needs. We wish you many happy years in your new home!</p><div style="background-color: #e8f4fc; padding: 15px; border-radius: 5px; margin: 20px 0;"><h3 style="color: #3498db; margin-top: 0;">Important Dates</h3><p style="margin: 5px 0; font-size: 14px;">Closing Date: June 15th, 2025</p><p style="margin: 5px 0; font-size: 14px;">Move-in Date: June 30th, 2025</p></div></div>',
      thumbnail_url: '/templates/transaction-complete.png',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];
};

export const getComponentTemplates = () => ({
  'property-listing': PropertyListingTemplate,
  'open-house': OpenHouseInvitationTemplate,
  'client-followup': ClientFollowUpTemplate,
  'market-update': MarketUpdateTemplate,
  'transaction-complete': TransactionCompleteTemplate,
});

export const sendTemplateEmail = async (
  templateId: string,
  recipient: string,
  data: EmailTemplateProps
) => {
  try {
    // First try to get the template from the database
    const { data: templateData, error } = await supabase
      .from('email_templates')
      .select('html_content')
      .eq('id', templateId)
      .single();
    
    let html = '';
    
    if (error || !templateData) {
      // If not found in database, try to render using component
      const templates = getComponentTemplates();
      const Component = templates[templateId as keyof typeof templates];
      
      if (Component) {
        html = renderTemplateToHtml({
          component: Component,
          props: data
        });
      } else {
        // Fallback to sample templates
        const sampleTemplates = getSampleTemplates();
        const template = sampleTemplates.find(t => t.id === templateId);
        
        if (template) {
          html = template.html_content;
        } else {
          throw new Error(`Template ${templateId} not found`);
        }
      }
    } else {
      // Use the HTML content from the database
      html = templateData.html_content;
    }
    
    // Replace any placeholders in the HTML
    if (data.contact) {
      html = html.replace(/{{contact\.firstName}}/g, data.contact.firstName || '');
      html = html.replace(/{{contact\.lastName}}/g, data.contact.lastName || '');
      html = html.replace(/{{contact\.email}}/g, data.contact.email || '');
    }
    
    return {
      to: recipient,
      html,
    };
  } catch (error) {
    console.error('Error sending template email:', error);
    throw error;
  }
};
