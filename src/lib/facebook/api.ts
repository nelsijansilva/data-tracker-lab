import { supabase } from "@/integrations/supabase/client";
import type { Metric } from "@/components/facebook/MetricSelector";
import type { DateRange } from "react-day-picker";
import { format } from "date-fns";

const FB_API_VERSION = 'v21.0';
const FB_BASE_URL = `https://graph.facebook.com/${FB_API_VERSION}`;

export const fetchFacebookData = async (endpoint: string, accessToken: string) => {
  const response = await fetch(`${FB_BASE_URL}/${endpoint}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Facebook API error: ${JSON.stringify(errorData)}`);
  }

  return response.json();
};

export const getFacebookCredentials = async () => {
  const { data, error } = await supabase
    .from('facebook_ad_accounts')
    .select('*')
    .limit(1)
    .single();

  if (error) throw error;
  return data;
};

const buildInsightsFields = (metrics: Metric[]) => {
  const basicFields = ['name', 'status', 'objective'];
  const insightsFields = metrics
    .filter(metric => !basicFields.includes(metric.field))
    .map(metric => metric.field);
  
  return [...basicFields, `insights{${insightsFields.join(',')}}`].join(',');
};

export const fetchCampaigns = async (selectedMetrics: Metric[], dateRange?: DateRange) => {
  const credentials = await getFacebookCredentials();
  const { account_id, access_token } = credentials;

  const fields = buildInsightsFields(selectedMetrics);
  let endpoint = `${account_id}/campaigns?fields=${fields}`;
  
  if (dateRange?.from && dateRange?.to) {
    const timeRange = {
      since: format(dateRange.from, 'yyyy-MM-dd'),
      until: format(dateRange.to, 'yyyy-MM-dd'),
    };
    endpoint += `&time_range=${JSON.stringify(timeRange)}`;
  }

  console.log("Fetching campaigns with fields:", fields);
  
  const response = await fetchFacebookData(endpoint, access_token);

  return response.data.map((campaign: any) => {
    const result: any = {
      id: campaign.id,
      name: campaign.name,
      status: campaign.status,
      objective: campaign.objective,
    };

    if (campaign.insights?.data?.[0]) {
      const insights = campaign.insights.data[0];
      selectedMetrics.forEach(metric => {
        if (!['name', 'status', 'objective'].includes(metric.field)) {
          result[metric.field] = insights[metric.field] || 0;
        }
      });
    }

    return result;
  });
};

export const fetchAdSets = async () => {
  const credentials = await getFacebookCredentials();
  const { account_id, access_token } = credentials;

  const response = await fetchFacebookData(
    `${account_id}/adsets?fields=name,status,budget_remaining,daily_budget,lifetime_budget,campaign`,
    access_token
  );

  return response.data;
};

export const fetchAds = async () => {
  const credentials = await getFacebookCredentials();
  const { account_id, access_token } = credentials;

  const response = await fetchFacebookData(
    `${account_id}/ads?fields=name,status,preview_url,adset`,
    access_token
  );

  return response.data;
};