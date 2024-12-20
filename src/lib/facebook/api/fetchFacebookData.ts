import { FB_BASE_URL } from '../config';
import { handleFacebookError } from '../errors';
import { supabase } from '@/integrations/supabase/client';

export const getFacebookCredentials = async () => {
  const { data, error } = await supabase
    .from('facebook_ad_accounts')
    .select('*')
    .limit(1)
    .single();

  if (error) {
    console.error('Error fetching Facebook credentials:', error);
    throw new Error('Erro ao buscar credenciais do Facebook. Por favor, configure sua conta primeiro.');
  }
  if (!data) throw new Error('Nenhuma conta do Facebook configurada');
  
  if (!data.access_token) {
    throw new Error('Token de acesso do Facebook não encontrado. Por favor, configure suas credenciais.');
  }
  
  return data;
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