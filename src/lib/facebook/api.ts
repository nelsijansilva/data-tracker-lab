import { supabase } from "@/integrations/supabase/client";
import type { Metric } from "@/components/facebook/MetricSelector";
import type { DateRange } from "react-day-picker";
import { buildCampaignsEndpoint, buildAdSetsEndpoint } from "./apiBuilder";
import { FB_BASE_URL } from "./config";
import { handleFacebookError } from "./errors";

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

export const fetchFacebookData = async (endpoint: string, accessToken: string) => {
  try {
    console.log('Making Facebook API request to:', `${FB_BASE_URL}/${endpoint}`);
    
    const response = await fetch(`${FB_BASE_URL}/${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      mode: 'cors',
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Facebook API error response:', data);
      handleFacebookError(data);
    }

    return data;
  } catch (error: any) {
    console.error('Facebook API request failed:', error);
    handleFacebookError(error);
  }
};

export const fetchCampaigns = async (selectedMetrics: Metric[], dateRange?: DateRange) => {
  try {
    const credentials = await getFacebookCredentials();
    const { account_id, access_token } = credentials;

    const endpoint = buildCampaignsEndpoint(account_id, selectedMetrics, dateRange);
    console.log("Fetching campaigns with endpoint:", endpoint);
    
    const response = await fetchFacebookData(endpoint, access_token);
    
    if (!response.data) {
      throw new Error('Nenhuma campanha encontrada');
    }

    return response.data.map((campaign: any) => {
      const result: any = {
        id: campaign.id,
        name: campaign.name,
        status: campaign.status,
        objective: campaign.objective,
        daily_budget: campaign.daily_budget,
        lifetime_budget: campaign.lifetime_budget,
        budget_remaining: campaign.budget_remaining
      };

      if (campaign.insights?.data?.[0]) {
        const insights = campaign.insights.data[0];
        selectedMetrics.forEach(metric => {
          if (!['name', 'status', 'objective', 'daily_budget', 'lifetime_budget', 'budget_remaining'].includes(metric.field)) {
            result[metric.field] = insights[metric.field] || 0;
          }
        });
      }

      return result;
    });
  } catch (error: any) {
    console.error('Error fetching campaigns:', error);
    throw error;
  }
};

export const fetchAdSets = async (campaignId: string | null, selectedMetrics: Metric[], dateRange?: DateRange) => {
  try {
    const credentials = await getFacebookCredentials();
    const { account_id, access_token } = credentials;

    const endpoint = buildAdSetsEndpoint(account_id, campaignId, selectedMetrics, dateRange);
    console.log("Fetching ad sets with endpoint:", endpoint);
    
    const response = await fetchFacebookData(endpoint, access_token);

    if (!response.data) {
      throw new Error('Nenhum conjunto de anúncios encontrado');
    }

    return response.data.map((adSet: any) => {
      const result: any = {
        id: adSet.id,
        name: adSet.name,
        status: adSet.status,
        daily_budget: adSet.daily_budget,
        lifetime_budget: adSet.lifetime_budget,
        budget_remaining: adSet.budget_remaining
      };

      if (adSet.insights?.data?.[0]) {
        const insights = adSet.insights.data[0];
        selectedMetrics.forEach(metric => {
          if (!['name', 'status', 'daily_budget', 'lifetime_budget', 'budget_remaining'].includes(metric.field)) {
            result[metric.field] = insights[metric.field] || 0;
          }
        });
      }

      return result;
    });
  } catch (error: any) {
    console.error('Error fetching ad sets:', error);
    throw error;
  }
};