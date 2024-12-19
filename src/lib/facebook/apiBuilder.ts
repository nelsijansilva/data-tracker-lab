import { DateRange } from "react-day-picker";
import type { Metric } from "@/components/facebook/MetricSelector";
import { buildFieldsParameter, buildInsightsFieldsParameter } from "./metrics";

const ensureActPrefix = (accountId: string) => {
  const cleanId = accountId.replace('act_', '');
  return `act_${cleanId}`;
};

export const buildCampaignsEndpoint = (accountId: string, selectedMetrics: Metric[], dateRange?: DateRange): string => {
  const formattedAccountId = ensureActPrefix(accountId);
  let endpoint = `${formattedAccountId}/campaigns?fields=name,status`;

  if (dateRange?.from && dateRange?.to) {
    const insights = buildInsightsFieldsParameter(selectedMetrics.map(m => m.field));
    
    if (insights) {
      endpoint += `,insights.time_range({"since":"${dateRange.from.toISOString().split('T')[0]}","until":"${dateRange.to.toISOString().split('T')[0]}"})`;
      endpoint += `.level(campaign)`;  // Add campaign level
      endpoint += `.fields(${insights})`;
    }
  }

  return endpoint;
};

export const buildAdSetsEndpoint = (accountId: string, campaignId: string | null, selectedMetrics: Metric[], dateRange?: DateRange): string => {
  const formattedAccountId = ensureActPrefix(accountId);
  let endpoint = `${formattedAccountId}/adsets?fields=name,status`;

  if (dateRange?.from && dateRange?.to) {
    const insights = selectedMetrics
      .filter(metric => !['name', 'status'].includes(metric.field))
      .map(metric => metric.field)
      .join(',');

    endpoint += `,insights.time_range({"since":"${dateRange.from.toISOString().split('T')[0]}","until":"${dateRange.to.toISOString().split('T')[0]}"}).fields(${insights})`;
  }

  if (campaignId) {
    endpoint += `&filtering=[{"field":"campaign.id","operator":"EQUAL","value":"${campaignId}"}]`;
  }

  return endpoint;
};

export const buildAdsEndpoint = (accountId: string, adSetId: string | null, selectedMetrics: Metric[], dateRange?: DateRange): string => {
  const formattedAccountId = ensureActPrefix(accountId);
  let endpoint = `${formattedAccountId}/ads?fields=name,status,creative{id,name,title,body,object_story_spec{link_data{message,link,caption,description,image_url}},asset_feed_spec{bodies,descriptions,titles,videos,images}}`;

  if (dateRange?.from && dateRange?.to) {
    const insights = selectedMetrics
      .filter(metric => !['name', 'status', 'preview_url'].includes(metric.field))
      .map(metric => metric.field)
      .join(',');

    endpoint += `,insights.time_range({"since":"${dateRange.from.toISOString().split('T')[0]}","until":"${dateRange.to.toISOString().split('T')[0]}"}).fields(${insights})`;
  }

  if (adSetId) {
    endpoint += `&filtering=[{"field":"adset.id","operator":"EQUAL","value":"${adSetId}"}]`;
  }

  return endpoint;
};

export const buildAdPreviewEndpoint = (accountId: string, adId: string, adFormat: string = "DESKTOP_FEED_STANDARD"): string => {
  const formattedAccountId = ensureActPrefix(accountId);
  return `${formattedAccountId}/generatepreviews?creative={"object_story_id":"${adId}"}&ad_format=${adFormat}`;
};
