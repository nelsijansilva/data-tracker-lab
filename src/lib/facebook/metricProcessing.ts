import type { Metric } from '@/components/facebook/MetricSelector';

export type MetricCategory = 'monetary' | 'percentage' | 'count' | 'rate';

export interface ProcessedMetric {
  value: number | string;
  category: MetricCategory;
  field: string;
}

const MONETARY_METRICS = ['spend', 'cpm', 'cpc', 'cost_per_unique_click', 'cost_per_conversion'];
const PERCENTAGE_METRICS = ['ctr', 'unique_ctr'];
const RATE_METRICS = ['frequency'];
const COUNT_METRICS = ['impressions', 'clicks', 'reach', 'unique_clicks'];

export const getMetricCategory = (field: string): MetricCategory => {
  const normalizedField = field.toLowerCase();
  
  if (MONETARY_METRICS.some(metric => normalizedField.includes(metric))) {
    return 'monetary';
  }
  if (PERCENTAGE_METRICS.some(metric => normalizedField.includes(metric))) {
    return 'percentage';
  }
  if (RATE_METRICS.some(metric => normalizedField.includes(metric))) {
    return 'rate';
  }
  return 'count';
};

export const processMetricValue = (value: number, category: MetricCategory): string => {
  if (typeof value !== 'number' || isNaN(value)) {
    return '0';
  }

  if (category === 'monetary') {
    return `R$ ${value.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  }
  
  if (category === 'percentage') {
    const fixedValue = value.toFixed(2);
    return `${fixedValue}%`;
  }
  
  if (category === 'rate') {
    const fixedValue = value.toFixed(2);
    return fixedValue;
  }
  
  return value.toLocaleString('pt-BR', { maximumFractionDigits: 0 });
};

export const processInsightsData = (insights: any, metrics: Metric[]): Record<string, any> => {
  const result: Record<string, any> = {};
  
  metrics.forEach(metric => {
    if (!insights || !insights[metric.field]) {
      result[metric.field] = 0;
      return;
    }

    let rawValue = insights[metric.field];
    
    // Handle array values (like actions)
    if (Array.isArray(rawValue)) {
      rawValue = rawValue.length;
    }

    // Convert string numbers to actual numbers
    const numericValue = typeof rawValue === 'string' ? parseFloat(rawValue) : rawValue;
    result[metric.field] = typeof numericValue === 'number' && !isNaN(numericValue) ? numericValue : 0;
  });
  
  return result;
};