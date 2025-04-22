import axios from 'axios';

// Replace with your backend API URL
const API_BASE = '/api/whatsapp';

export async function fetchConversations() {
  const { data } = await axios.get(`${API_BASE}/conversations`);
  return data;
}

export async function fetchMessages(conversationId: string) {
  const { data } = await axios.get(`${API_BASE}/messages/${conversationId}`);
  return data;
}

export async function sendMessage(conversationId: string, content: string) {
  const { data } = await axios.post(`${API_BASE}/messages/${conversationId}`, { content });
  return data;
}

export async function assignChat(conversationId: string, userId: string) {
  const { data } = await axios.post(`${API_BASE}/assign`, { conversationId, userId });
  return data;
}

export async function fetchTemplates() {
  const { data } = await axios.get(`${API_BASE}/templates`);
  return data;
}

export async function createTemplate(name: string, content: string) {
  const { data } = await axios.post(`${API_BASE}/templates`, { name, content });
  return data;
}

export async function updateTemplate(id: string, content: string) {
  const { data } = await axios.put(`${API_BASE}/templates/${id}`, { content });
  return data;
}

export async function deleteTemplate(id: string) {
  const { data } = await axios.delete(`${API_BASE}/templates/${id}`);
  return data;
}

export async function fetchCampaigns() {
  const { data } = await axios.get(`${API_BASE}/campaigns`);
  return data;
}

export async function createCampaign(name: string, message: string, scheduledAt?: string) {
  const { data } = await axios.post(`${API_BASE}/campaigns`, { name, message, scheduledAt });
  return data;
}

export async function sendCampaign(id: string) {
  const { data } = await axios.post(`${API_BASE}/campaigns/send`, { id });
  return data;
}

export async function fetchAnalytics() {
  const { data } = await axios.get(`${API_BASE}/analytics`);
  return data;
}

export async function fetchChannels() {
  const { data } = await axios.get(`${API_BASE}/channels`);
  return data;
}

export async function addChannel(channel: any) {
  const { data } = await axios.post(`${API_BASE}/channels`, channel);
  return data;
}

export async function editChannel(id: string, updates: any) {
  const { data } = await axios.put(`${API_BASE}/channels/${id}`, updates);
  return data;
}

export async function deleteChannel(id: string) {
  const { data } = await axios.delete(`${API_BASE}/channels/${id}`);
  return data;
}

export async function fetchChannelStats(id: string) {
  const { data } = await axios.get(`${API_BASE}/channels/${id}/stats`);
  return data;
}
