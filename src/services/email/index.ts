// Re-export all email services
export * from './accountService';
export * from './templateService';
export * from './campaignService';
export * from './emailUtils';

// Export the email service
export { EmailService } from './emailService';
export { default as emailService } from './emailService';
