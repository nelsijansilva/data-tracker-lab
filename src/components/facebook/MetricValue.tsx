import React from 'react';
import type { Metric } from './MetricSelector';
import { formatMetricValue, CurrencyConfig } from '@/lib/facebook/metricFormatters';

interface MetricValueProps {
  value: any;
  metric: Metric;
  currencyConfig?: CurrencyConfig;
}

export const MetricValue: React.FC<MetricValueProps> = ({ 
  value, 
  metric, 
  currencyConfig 
}) => {
  return <span>{formatMetricValue(value, metric, currencyConfig)}</span>;
};