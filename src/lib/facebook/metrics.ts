export type FacebookMetricMapping = {
  field: string;
  apiField?: string;
  isInsightMetric?: boolean;
};

export const FACEBOOK_METRIC_MAPPINGS: Record<string, FacebookMetricMapping> = {
  name: { field: 'name', isInsightMetric: false },
  status: { field: 'status', isInsightMetric: false },
  objective: { field: 'objective', isInsightMetric: false },
  daily_budget: { field: 'daily_budget', isInsightMetric: false },
  lifetime_budget: { field: 'lifetime_budget', isInsightMetric: false },
  budget_remaining: { field: 'budget_remaining', isInsightMetric: false },
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
  unique_ctr: { field: 'unique_ctr', isInsightMetric: true },
  cost_per_action_type: { field: 'cost_per_action_type', isInsightMetric: true },
  actions: { field: 'actions', isInsightMetric: true }
};

export const getMetricMapping = (field: string): FacebookMetricMapping => {
  return (
    FACEBOOK_METRIC_MAPPINGS[field] || 
    { field, isInsightMetric: true }
  );
};

export const buildFieldsParameter = (metrics: string[]): string => {
  const basicFields = metrics
    .map(field => getMetricMapping(field))
    .filter(mapping => !mapping.isInsightMetric)
    .map(mapping => mapping.field);

  return [...new Set(basicFields)].join(',');
};

export const buildInsightsFieldsParameter = (metrics: string[]): string => {
  const insightFields = metrics
    .map(field => getMetricMapping(field))
    .filter(mapping => mapping.isInsightMetric)
    .map(mapping => mapping.field);

  return [...new Set(insightFields)].join(',');
};