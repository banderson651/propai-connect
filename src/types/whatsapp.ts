export interface WhatsAppTemplate {
  id: string;
  name: string;
  content: string;
  language: string;
  category: 'UTILITY' | 'MARKETING' | 'AUTHENTICATION';
  variables: string[];
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface WhatsAppMessage {
  id: string;
  contactId: string;
  content: string;
  timestamp: string;
  direction: 'incoming' | 'outgoing';
  status?: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
}

export interface WhatsAppAnalytics {
  messageSent: number;
  messageDelivered: number;
  messageRead: number;
  messagesFailed: number;
  responseRate: number;
  averageResponseTime: number;
  dailyMessages: {
    date: string;
    count: number;
  }[];
}

export interface WhatsAppConfig {
  phoneNumber: string;
  apiKey: string;
  businessAccountId?: string;
} 