import React from 'react';
import type { Metric } from './MetricSelector';

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

  // Para valores numéricos, formatar adequadamente
  if (typeof value === 'number') {
    if (metric.field.includes('ctr') || metric.field.includes('rate')) {
      return <span>{(value * 100).toFixed(2)}%</span>;
    }
    if (metric.field.includes('spend') || metric.field.includes('cost') || metric.field.includes('budget')) {
      return <span>R$ {value.toFixed(2)}</span>;
    }
    if (Number.isInteger(value)) {
      return <span>{value.toLocaleString()}</span>;
    }
    return <span>{value.toFixed(2)}</span>;
  }

  // Para strings e outros tipos
  return <span>{String(value)}</span>;
};