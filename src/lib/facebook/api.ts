import { supabase } from "@/integrations/supabase/client";

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

export const fetchCampaigns = async () => {
  const credentials = await getFacebookCredentials();
  const { account_id, access_token } = credentials;

  const response = await fetchFacebookData(
    `${account_id}/campaigns?fields=name,status,objective,insights{spend,impressions,clicks,ctr,cpc,cpm,cost_per_inline_link_click,cost_per_inline_post_engagement}`,
    access_token
  );

  return response.data.map((campaign: any) => ({
    id: campaign.id,
    name: campaign.name,
    status: campaign.status,
    objective: campaign.objective,
    spend: parseFloat(campaign.insights?.data?.[0]?.spend || '0'),
    impressions: campaign.insights?.data?.[0]?.impressions || 0,
    clicks: campaign.insights?.data?.[0]?.clicks || 0,
    ctr: campaign.insights?.data?.[0]?.ctr || 0,
    cpc: campaign.insights?.data?.[0]?.cpc || 0,
    cpm: campaign.insights?.data?.[0]?.cpm || 0,
    cost_per_inline_link_click: campaign.insights?.data?.[0]?.cost_per_inline_link_click || 0,
    cost_per_inline_post_engagement: campaign.insights?.data?.[0]?.cost_per_inline_post_engagement || 0
  }));
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