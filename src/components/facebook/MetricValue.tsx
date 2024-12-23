import React from 'react';
import type { Metric } from './MetricSelector';
import { getMetricCategory, processMetricValue } from '@/lib/facebook/metricProcessing';

interface MetricValueProps {
  value: any;
  metric: Metric;
}

export const MetricValue: React.FC<MetricValueProps> = ({ value, metric }) => {
  if (!value) return <span>0</span>;

  // Se o valor for um array de objetos (comum em métricas do Facebook como 'actions')
  if (Array.isArray(value)) {
    return <span>{value.length}</span>;
  }

  // Se o valor for um objeto
  if (typeof value === 'object') {
    if ('value' in value) {
      return <span>{value.value}</span>;
    }
    return <span>-</span>;
  }

  // Para valores numéricos, usar nossa nova lógica de processamento
  if (typeof value === 'number') {
    const category = getMetricCategory(metric.field);
    return <span>{processMetricValue(value, category)}</span>;
  }

  // Para strings e outros tipos
  return <span>{String(value)}</span>;
};