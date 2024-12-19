import { supabase } from "@/integrations/supabase/client";
import type { Metric } from "@/components/facebook/MetricSelector";
import type { DateRange } from "react-day-picker";
import { buildCampaignsEndpoint, buildAdSetsEndpoint, buildAdsEndpoint } from "./apiBuilder";
import { FB_BASE_URL } from "./config";
import { handleFacebookError } from "./errors";

export const getFacebookCredentials = async (accountId?: string) => {
  let query = supabase.from('facebook_ad_accounts').select('*');
  
  if (accountId) {
    query = query.eq('id', accountId);
  }
  
  const { data, error } = await query.limit(1).single();

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
    const url = `${FB_BASE_URL}/${endpoint}`;
    console.log('Making Facebook API request to:', url);
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      mode: 'cors',
      credentials: 'omit'
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Facebook API error response:', errorData);
      handleFacebookError(errorData);
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error('Facebook API request failed:', error);
    handleFacebookError(error);
  }
};

export const fetchCampaigns = async (selectedMetrics: Metric[], dateRange?: DateRange, selectedAccountId?: string) => {
  try {
    const credentials = await getFacebookCredentials(selectedAccountId);
    const { account_id, access_token } = credentials;

    // Remove any existing 'act_' prefix to prevent duplication
    const cleanAccountId = account_id.replace('act_', '');
    
    const endpoint = buildCampaignsEndpoint(cleanAccountId, selectedMetrics, dateRange);
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

    // Remove any existing 'act_' prefix to prevent duplication
    const cleanAccountId = account_id.replace('act_', '');
    
    const endpoint = buildAdSetsEndpoint(cleanAccountId, campaignId, selectedMetrics, dateRange);
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

export const fetchAds = async (adSetId: string | null, selectedMetrics: Metric[], dateRange?: DateRange) => {
  try {
    const credentials = await getFacebookCredentials();
    const { account_id, access_token } = credentials;

    // Remove any existing 'act_' prefix to prevent duplication
    const cleanAccountId = account_id.replace('act_', '');
    
    const endpoint = buildAdsEndpoint(cleanAccountId, adSetId, selectedMetrics, dateRange);
    console.log("Fetching ads with endpoint:", endpoint);
    
    const response = await fetchFacebookData(endpoint, access_token);

    if (!response.data) {
      throw new Error('Nenhum anúncio encontrado');
    }

    return response.data.map((ad: any) => {
      const result: any = {
        id: ad.id,
        name: ad.name,
        status: ad.status,
        preview_url: ad.preview_url
      };

      if (ad.insights?.data?.[0]) {
        const insights = ad.insights.data[0];
        selectedMetrics.forEach(metric => {
          if (!['name', 'status', 'preview_url'].includes(metric.field)) {
            result[metric.field] = insights[metric.field] || 0;
          }
        });
      }

      return result;
    });
  } catch (error: any) {
    console.error('Error fetching ads:', error);
    throw error;
  }
};