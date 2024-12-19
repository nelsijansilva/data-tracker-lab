import { DateRange } from "react-day-picker";
import type { Metric } from "@/components/facebook/MetricSelector";

export const buildCampaignsEndpoint = (accountId: string, selectedMetrics: Metric[], dateRange?: DateRange): string => {
  let endpoint = `act_${accountId}/campaigns?fields=name,status`;

  if (dateRange?.from && dateRange?.to) {
    const insights = selectedMetrics
      .filter(metric => !['name', 'status'].includes(metric.field))
      .map(metric => metric.field)
      .join(',');

    endpoint += `,insights.time_range({"since":"${dateRange.from.toISOString().split('T')[0]}","until":"${dateRange.to.toISOString().split('T')[0]}"}).fields(${insights})`;
  }

  return endpoint;
};

export const buildAdSetsEndpoint = (accountId: string, campaignId: string | null, selectedMetrics: Metric[], dateRange?: DateRange): string => {
  let endpoint = `act_${accountId}/adsets?fields=name,status`;

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
  let endpoint = `act_${accountId}/ads?fields=name,status,creative{id,name,title,body,object_story_spec{link_data{message,link,caption,description,image_url}},asset_feed_spec{bodies,descriptions,titles,videos,images}}`;

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
  return `act_${accountId}/generatepreviews?creative={"object_story_id":"${adId}"}&ad_format=${adFormat}`;
};
