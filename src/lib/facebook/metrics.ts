export type FacebookMetricMapping = {
  field: string;
  apiField?: string;
  isInsightMetric?: boolean;
  level?: 'account' | 'campaign' | 'adset' | 'ad';
  format?: 'currency' | 'percentage' | 'number' | 'decimal';
};

export const FACEBOOK_METRIC_MAPPINGS: Record<string, FacebookMetricMapping> = {
  // Basic non-insight metrics
  name: { field: 'name', isInsightMetric: false },
  status: { field: 'status', isInsightMetric: false },
  objective: { field: 'objective', isInsightMetric: false },
  
  // Budget metrics
  budget_remaining: { field: 'budget_remaining', isInsightMetric: false, format: 'currency' },
  daily_budget: { field: 'daily_budget', isInsightMetric: false, format: 'currency' },
  lifetime_budget: { field: 'lifetime_budget', isInsightMetric: false, format: 'currency' },
  
  // Valid insight metrics with appropriate levels and formats
  spend: { field: 'spend', isInsightMetric: true, format: 'currency' },
  impressions: { field: 'impressions', isInsightMetric: true, format: 'number' },
  clicks: { field: 'clicks', isInsightMetric: true, format: 'number' },
  cpc: { field: 'cpc', isInsightMetric: true, format: 'currency' },
  ctr: { field: 'ctr', isInsightMetric: true, format: 'percentage' },
  cpm: { field: 'cpm', isInsightMetric: true, format: 'currency' },
  reach: { field: 'reach', isInsightMetric: true, format: 'number' },
  frequency: { field: 'frequency', isInsightMetric: true, format: 'decimal' },
  cost_per_unique_click: { field: 'cost_per_unique_click', isInsightMetric: true, format: 'currency' },
  unique_clicks: { field: 'unique_clicks', isInsightMetric: true, format: 'number' },
  unique_ctr: { field: 'unique_ctr', isInsightMetric: true, format: 'percentage' }
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