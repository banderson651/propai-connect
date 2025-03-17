
import { EmailTemplate } from '@/types/email';
import { mockEmailTemplates } from '../emailMockData';
import { v4 as uuidv4 } from 'uuid';

// Email Templates
export const getEmailTemplates = (): Promise<EmailTemplate[]> => {
  return Promise.resolve([...mockEmailTemplates]);
};

export const getEmailTemplateById = (id: string): Promise<EmailTemplate | undefined> => {
  const template = mockEmailTemplates.find(template => template.id === id);
  return Promise.resolve(template);
};

export const createEmailTemplate = (template: Omit<EmailTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<EmailTemplate> => {
  const now = new Date().toISOString();
  const newTemplate: EmailTemplate = {
    ...template,
    id: uuidv4(),
    createdAt: now,
    updatedAt: now,
  };
  mockEmailTemplates.push(newTemplate);
  return Promise.resolve(newTemplate);
};

export const updateEmailTemplate = (id: string, updates: Partial<EmailTemplate>): Promise<EmailTemplate | undefined> => {
  const index = mockEmailTemplates.findIndex(template => template.id === id);
  if (index === -1) return Promise.resolve(undefined);
  
  mockEmailTemplates[index] = { 
    ...mockEmailTemplates[index], 
    ...updates, 
    updatedAt: new Date().toISOString() 
  };
  return Promise.resolve(mockEmailTemplates[index]);
};

export const deleteEmailTemplate = (id: string): Promise<boolean> => {
  const index = mockEmailTemplates.findIndex(template => template.id === id);
  if (index === -1) return Promise.resolve(false);
  
  mockEmailTemplates.splice(index, 1);
  return Promise.resolve(true);
};
