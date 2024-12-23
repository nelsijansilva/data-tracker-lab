export type FacebookMetricMapping = {
  field: string;
  apiField?: string;
  isInsightMetric?: boolean;
  level?: 'account' | 'campaign' | 'adset' | 'ad';
};

export const FACEBOOK_METRIC_MAPPINGS: Record<string, FacebookMetricMapping> = {
  // Basic non-insight metrics
  name: { field: 'name', isInsightMetric: false },
  status: { field: 'status', isInsightMetric: false },
  objective: { field: 'objective', isInsightMetric: false },
  
  // Valid insight metrics with appropriate levels
  spend: { field: 'spend', isInsightMetric: true },
  impressions: { field: 'impressions', isInsightMetric: true },
  clicks: { field: 'clicks', isInsightMetric: true },
  cpc: { field: 'cpc', isInsightMetric: true },
  ctr: { field: 'ctr', isInsightMetric: true },
  cpm: { field: 'cpm', isInsightMetric: true },
  reach: { field: 'reach', isInsightMetric: true },
  frequency: { field: 'frequency', isInsightMetric: true },
  cost_per_unique_click: { field: 'cost_per_unique_click', isInsightMetric: true },
  unique_clicks: { field: 'unique_clicks', isInsightMetric: true },
  unique_ctr: { field: 'unique_ctr', isInsightMetric: true }
};

export const getMetricMapping = (field: string): FacebookMetricMapping => {
  const mapping = FACEBOOK_METRIC_MAPPINGS[field];
  if (!mapping) {
    console.warn(`Metric mapping not found for field: ${field}. This metric will be ignored.`);
    return { field, isInsightMetric: false };
  }
  return mapping;
};

export const buildFieldsParameter = (metrics: string[]): string => {
  const basicFields = metrics
    .map(field => getMetricMapping(field))
    .filter(mapping => !mapping.isInsightMetric)
    .map(mapping => mapping.field);

  return [...new Set(basicFields)].join(',');
};

export const buildInsightsFieldsParameter = (metrics: string[], level?: 'account' | 'campaign' | 'adset' | 'ad'): string => {
  const insightFields = metrics
    .map(field => getMetricMapping(field))
    .filter(mapping => {
      if (!mapping.isInsightMetric) return false;
      if (level && mapping.level && mapping.level !== level) return false;
      return true;
    })
    .map(mapping => mapping.field);

  return [...new Set(insightFields)].join(',');
};