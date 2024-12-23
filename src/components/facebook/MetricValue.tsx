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
    // Para CTR, CPM e CPC, sempre mostrar 2 casas decimais
    if (
      metric.field.toLowerCase().includes('ctr') || 
      metric.field.toLowerCase().includes('cpm') || 
      metric.field.toLowerCase().includes('cpc')
    ) {
      // Primeiro converte para string com muitas casas decimais e depois limita a 2
      return <span>{Number(value.toFixed(2))}</span>;
    }
    
    // Para percentuais (taxas), sempre mostrar 2 casas decimais
    if (metric.field.includes('rate')) {
      return <span>{(value * 100).toFixed(2)}%</span>;
    }
    
    // Para valores monetários (spend, cost), sempre mostrar 2 casas decimais
    if (
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