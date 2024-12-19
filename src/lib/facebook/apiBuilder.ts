import { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { buildFieldsParameter, buildInsightsFieldsParameter } from "./metrics";
import type { Metric } from "@/components/facebook/MetricSelector";

export const buildCampaignsEndpoint = (
  accountId: string,
  selectedMetrics: Metric[],
  dateRange?: DateRange
): string => {
  const metricFields = selectedMetrics.map(metric => metric.field);
  const fields = buildFieldsParameter(metricFields);
  const insightFields = buildInsightsFieldsParameter(metricFields);
  
  let endpoint = `${accountId}/campaigns?fields=${fields}`;

  if (insightFields && dateRange?.from && dateRange?.to) {
    endpoint += `,insights.time_range({"since":"${format(dateRange.from, 'yyyy-MM-dd')}","until":"${format(dateRange.to, 'yyyy-MM-dd')}"}).fields(${insightFields})`;
  }

  return endpoint;
};

export const buildAdSetsEndpoint = (
  accountId: string,
  campaignId: string | null,
  selectedMetrics: Metric[],
  dateRange?: DateRange
): string => {
  const metricFields = selectedMetrics.map(metric => metric.field);
  const fields = buildFieldsParameter(metricFields);
  const insightFields = buildInsightsFieldsParameter(metricFields);
  
  let endpoint = `${accountId}/adsets?fields=${fields}`;

  if (insightFields && dateRange?.from && dateRange?.to) {
    endpoint += `,insights.time_range({"since":"${format(dateRange.from, 'yyyy-MM-dd')}","until":"${format(dateRange.to, 'yyyy-MM-dd')}"}).fields(${insightFields})`;
  }

  if (campaignId) {
    endpoint += `&filtering=[{"field":"campaign.id","operator":"EQUAL","value":"${campaignId}"}]`;
  }

  return endpoint;
};

export const buildAdsEndpoint = (
  accountId: string,
  adSetId: string | null,
  selectedMetrics: Metric[],
  dateRange?: DateRange
): string => {
  const metricFields = selectedMetrics.map(metric => metric.field);
  const fields = buildFieldsParameter(metricFields);
  const insightFields = buildInsightsFieldsParameter(metricFields);
  
  let endpoint = `${accountId}/ads?fields=${fields},preview_url`;

  if (insightFields && dateRange?.from && dateRange?.to) {
    endpoint += `,insights.time_range({"since":"${format(dateRange.from, 'yyyy-MM-dd')}","until":"${format(dateRange.to, 'yyyy-MM-dd')}"}).fields(${insightFields})`;
  }

  if (adSetId) {
    endpoint += `&filtering=[{"field":"adset.id","operator":"EQUAL","value":"${adSetId}"}]`;
  }

  return endpoint;
};