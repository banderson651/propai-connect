
// Re-export all email services
import { 
  getCampaigns, 
  getCampaignById, 
  createCampaign, 
  deleteCampaign,
  startCampaign,
  pauseCampaign,
  resumeCampaign,
  stopCampaign,
  sendCampaign
} from './campaignService';

import {
  getEmailAccountById,
  createEmailAccount,
  updateEmailAccount,
  deleteEmailAccount,
  getEmailAccounts,
  testEmailConnection
} from './accountService';

import {
  getEmailTemplateById,
  getEmailTemplates,
  createEmailTemplate,
  updateEmailTemplate,
  deleteEmailTemplate
} from './templateService';

import { sendTestEmail } from './emailUtils';
import emailService from './emailService';

export {
  // Campaign services
  getCampaigns,
  getCampaignById,
  createCampaign,
  deleteCampaign,
  startCampaign,
  pauseCampaign,
  resumeCampaign,
  stopCampaign,
  sendCampaign,
  
  // Account services
  getEmailAccountById,
  createEmailAccount,
  updateEmailAccount,
  deleteEmailAccount,
  getEmailAccounts,
  testEmailConnection,
  sendTestEmail,
  
  // Template services
  getEmailTemplateById,
  getEmailTemplates,
  createEmailTemplate,
  updateEmailTemplate,
  deleteEmailTemplate,
  
  // Email service instance
  emailService
};
