import { FB_BASE_URL } from '../config';
import { handleFacebookError } from '../errors';
import { apiClient } from '@/lib/api/client';

export const getFacebookCredentials = async () => {
  const data = await apiClient.get('/api/facebook/accounts');
  
  if (!data || data.length === 0) {
    throw new Error('Nenhuma conta do Facebook configurada');
  }
  
  if (!data[0].access_token) {
    throw new Error('Token de acesso do Facebook não encontrado. Por favor, configure suas credenciais.');
  }
  
  return data[0];
};

export const fetchFacebookData = async (endpoint: string, credentials: { 
  access_token: string;
  app_id: string;
  app_secret: string;
}) => {
  try {
    console.log('Making Facebook API request to:', `${FB_BASE_URL}/${endpoint}`);
    
    const response = await fetch(`${FB_BASE_URL}/${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${credentials.access_token}`,
        'Content-Type': 'application/json',
      },
      mode: 'cors',
    });

    if (!response.ok) {
      const data = await response.json();
      console.error('Facebook API error response:', data);
      handleFacebookError(data);
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error('Facebook API request failed:', error);
    handleFacebookError(error);
  }
};