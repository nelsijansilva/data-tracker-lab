import { supabase } from "@/integrations/supabase/client";
import type { Metric } from "@/components/facebook/MetricSelector";
import type { DateRange } from "react-day-picker";
import { format } from "date-fns";

const FB_API_VERSION = 'v21.0';
const FB_BASE_URL = `https://graph.facebook.com/${FB_API_VERSION}`;

const REQUIRED_PERMISSIONS = [
  'ads_read',
  'ads_management',
  'read_insights'
];

export const fetchFacebookData = async (endpoint: string, accessToken: string) => {
  try {
    const response = await fetch(`${FB_BASE_URL}/${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      const data = await response.json();
      if (data.error?.code === 100) {
        throw new Error(`Permissões insuficientes do Facebook. Por favor, verifique se seu token de acesso tem as permissões necessárias: ${REQUIRED_PERMISSIONS.join(', ')}`);
      }
      throw new Error(`Erro na API do Facebook: ${data.error?.message || 'Erro desconhecido'}`);
    }

    return response.json();
  } catch (error: any) {
    console.error('Facebook API error:', error);
    throw new Error(error.message || 'Erro ao acessar a API do Facebook');
  }
};

export const getFacebookCredentials = async () => {
  const { data, error } = await supabase
    .from('facebook_ad_accounts')
    .select('*')
    .limit(1)
    .single();

  if (error) throw error;
  if (!data) throw new Error('Nenhuma conta do Facebook configurada');
  return data;
};

const buildInsightsFields = (metrics: Metric[], dateRange?: DateRange) => {
  // Separate basic fields from insights fields
  const basicFields = ['name', 'status', 'objective', 'daily_budget', 'lifetime_budget', 'budget_remaining'];
  const insightsFields = metrics
    .filter(metric => !basicFields.includes(metric.field))
    .map(metric => metric.field)
    .filter(field => !field.includes('budget')); // Remove budget-related fields from insights

  let fields = basicFields.join(',');
  
  // Only add insights if there are valid insights fields
  if (insightsFields.length > 0) {
    fields += `,insights{${insightsFields.join(',')}}`;
  }
  
  // Add time range if provided
  if (dateRange?.from && dateRange?.to) {
    const timeRange = {
      since: format(dateRange.from, 'yyyy-MM-dd'),
      until: format(dateRange.to, 'yyyy-MM-dd'),
    };
    fields += `&time_range=${JSON.stringify(timeRange)}`;
  }
  
  return fields;
};

export const fetchCampaigns = async (selectedMetrics: Metric[], dateRange?: DateRange) => {
  try {
    const credentials = await getFacebookCredentials();
    const { account_id, access_token } = credentials;

    const fields = buildInsightsFields(selectedMetrics, dateRange);
    const endpoint = `${account_id}/campaigns?fields=${fields}`;
    
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
            if (Array.isArray(insights[metric.field])) {
              result[metric.field] = insights[metric.field][0]?.value || 0;
            } else {
              result[metric.field] = insights[metric.field] || 0;
            }
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

export const fetchAdSets = async () => {
  try {
    const credentials = await getFacebookCredentials();
    const { account_id, access_token } = credentials;

    const response = await fetchFacebookData(
      `${account_id}/adsets?fields=name,status,budget_remaining,daily_budget,lifetime_budget,campaign`,
      access_token
    );

    return response.data;
  } catch (error: any) {
    console.error('Error fetching ad sets:', error);
    throw error;
  }
};

export const fetchAds = async () => {
  try {
    const credentials = await getFacebookCredentials();
    const { account_id, access_token } = credentials;

    const response = await fetchFacebookData(
      `${account_id}/ads?fields=name,status,preview_url,adset`,
      access_token
    );

    return response.data;
  } catch (error: any) {
    console.error('Error fetching ads:', error);
    throw error;
  }
};