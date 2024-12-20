import { API_URL } from '@/config/api';

export const fetchFacebookAccounts = async () => {
  const response = await fetch(`${API_URL}/api/facebook/accounts`);
  if (!response.ok) {
    throw new Error('Failed to fetch Facebook accounts');
  }
  return response.json();
};

export const createFacebookAccount = async (accountData: any) => {
  const response = await fetch(`${API_URL}/api/facebook/accounts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(accountData),
  });
  if (!response.ok) {
    throw new Error('Failed to create Facebook account');
  }
  return response.json();
};

export const updateFacebookAccount = async (id: string, accountData: any) => {
  const response = await fetch(`${API_URL}/api/facebook/accounts/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(accountData),
  });
  if (!response.ok) {
    throw new Error('Failed to update Facebook account');
  }
  return response.json();
};

export const deleteFacebookAccount = async (id: string) => {
  const response = await fetch(`${API_URL}/api/facebook/accounts/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete Facebook account');
  }
  return response.json();
};

export const fetchCampaigns = async () => {
  const response = await fetch(`${API_URL}/api/facebook/campaigns`);
  if (!response.ok) {
    throw new Error('Failed to fetch campaigns');
  }
  return response.json();
};

export const fetchMetrics = async () => {
  const response = await fetch(`${API_URL}/api/metrics`);
  if (!response.ok) {
    throw new Error('Failed to fetch metrics');
  }
  return response.json();
};

export const fetchWebhookEvents = async () => {
  const response = await fetch(`${API_URL}/api/webhook/events`);
  if (!response.ok) {
    throw new Error('Failed to fetch webhook events');
  }
  return response.json();
};

export const fetchWebhookLogs = async () => {
  const response = await fetch(`${API_URL}/api/webhook/logs`);
  if (!response.ok) {
    throw new Error('Failed to fetch webhook logs');
  }
  return response.json();
};