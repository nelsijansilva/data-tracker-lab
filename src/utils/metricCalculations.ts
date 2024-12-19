import type { Metric } from "@/components/facebook/MetricSelector";

export const calculateMetricValue = (data: any, metric: Metric) => {
  // If there's no formula, return the direct field value
  if (!metric.formula) {
    return data[metric.field];
  }

  try {
    // If there is a formula, evaluate it by replacing field names with their values
    const formula = metric.formula.replace(/[a-zA-Z_]+/g, (match) => {
      return data[match] || 0;
    });
    return eval(formula);
  } catch (error) {
    console.error(`Error calculating metric ${metric.name}:`, error);
    return 0;
  }
};