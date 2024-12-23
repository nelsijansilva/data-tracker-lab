import type { Metric } from "@/components/facebook/MetricSelector";

export type MetricCategory = 'monetary' | 'percentage' | 'count' | 'rate';

export interface ProcessedMetric {
  value: number | string;
  category: MetricCategory;
  field: string;
}

const MONETARY_METRICS = ['spend', 'cpm', 'cpc', 'cost_per_unique_click'];
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
  if (category === 'monetary') {
    // Converte para centavos e depois formata como Real
    return `R$ ${(value).toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  }
  
  if (category === 'percentage') {
    // Mantém exatamente duas casas decimais sem arredondamento
    const fixedValue = value.toString().match(/^\d+(?:\.\d{0,2})?/);
    return `${fixedValue ? fixedValue[0] : value.toFixed(2)}%`;
  }
  
  if (category === 'rate') {
    // Mantém exatamente duas casas decimais sem arredondamento
    const fixedValue = value.toString().match(/^\d+(?:\.\d{0,2})?/);
    return fixedValue ? fixedValue[0] : value.toFixed(2);
  }
  
  // Para métricas de contagem, usa separador de milhares
  return value.toLocaleString('pt-BR', { maximumFractionDigits: 0 });
};

export const processInsightsData = (insights: any, metrics: Metric[]): Record<string, any> => {
  const result: Record<string, any> = {};
  
  metrics.forEach(metric => {
    if (!insights || !insights[metric.field]) {
      result[metric.field] = 0;
      return;
    }

    const rawValue = insights[metric.field];
    const numericValue = typeof rawValue === 'number' ? rawValue : 0;
    result[metric.field] = numericValue;
  });
  
  return result;
};