import type { Metric } from "@/components/facebook/MetricSelector";

// Métricas que devem usar média ao invés de soma
export const AVERAGE_METRICS = [
  'ctr', 
  'cpm', 
  'cpc', 
  'unique_ctr', 
  'total_ctr', 
  'frequency', 
  'unique_cpc'
];

export const calculateMetricTotals = (items: any[], metrics: Metric[]) => {
  return metrics.reduce((acc: any, metric) => {
    if (metric.field === 'name') {
      acc[metric.field] = `Total (${items.length})`;
    } else {
      const shouldUseAverage = AVERAGE_METRICS.includes(metric.field.toLowerCase());
      
      if (shouldUseAverage) {
        const validValues = items
          .map(item => {
            const value = parseFloat(item[metric.field]);
            return !isNaN(value) && value !== 0 ? value : null;
          })
          .filter((value): value is number => value !== null);
          
        acc[metric.field] = validValues.length > 0
          ? validValues.reduce((sum, value) => sum + value, 0) / validValues.length
          : 0;
      } else {
        acc[metric.field] = items.reduce((sum: number, item: any) => {
          const value = parseFloat(item[metric.field]) || 0;
          return sum + value;
        }, 0);
      }
    }
    return acc;
  }, {});
};