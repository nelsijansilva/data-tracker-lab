import type { Metric } from "@/components/facebook/MetricSelector";

export const calculateMetricValue = (data: any, metric: Metric) => {
  if (!metric.formula) {
    return data[metric.field];
  }

  try {
    const formula = metric.formula.replace(/[a-zA-Z_]+/g, (match) => {
      return data[match] || 0;
    });
    return eval(formula);
  } catch (error) {
    console.error(`Error calculating metric ${metric.name}:`, error);
    return 0;
  }
};