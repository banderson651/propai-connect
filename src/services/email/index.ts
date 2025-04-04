
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
  
  // Template services
  getEmailTemplateById,
  getEmailTemplates,
  createEmailTemplate,
  updateEmailTemplate,
  deleteEmailTemplate
};
