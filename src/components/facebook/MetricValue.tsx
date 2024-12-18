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
    // Para CPM, mostrar sempre 2 casas decimais (movido para primeira condição)
    if (metric.field.toLowerCase().includes('cpm')) {
      return <span>{value.toFixed(2)}</span>;
    }
    
    // Para percentuais (CTR e taxas), sempre mostrar 2 casas decimais
    if (metric.field.includes('ctr') || metric.field.includes('rate')) {
      return <span>{(value * 100).toFixed(2)}%</span>;
    }
    
    // Para valores monetários (CPC, spend, cost), sempre mostrar 2 casas decimais
    if (
      metric.field.includes('cpc') || 
      metric.field.includes('spend') || 
      metric.field.includes('cost') || 
      metric.field.includes('budget')
    ) {
      return <span>R$ {value.toFixed(2)}</span>;
    }
    
    // Para números inteiros (impressions, clicks), usar separador de milhares
    if (Number.isInteger(value)) {
      return <span>{value.toLocaleString()}</span>;
    }
    
    // Para outros números decimais, mostrar 2 casas decimais
    return <span>{value.toFixed(2)}</span>;
  }

  // Para strings e outros tipos
  return <span>{String(value)}</span>;
};