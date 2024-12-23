import { Metric } from "@/components/facebook/MetricSelector";

export type CurrencyConfig = {
  currency: string;
  locale: string;
};

const DEFAULT_CURRENCY: CurrencyConfig = {
  currency: 'BRL',
  locale: 'pt-BR'
};

export const formatMetricValue = (value: any, metric: Metric, currencyConfig: CurrencyConfig = DEFAULT_CURRENCY) => {
  if (!value) return '0';

  // Se o valor for um array de objetos (comum em métricas do Facebook como 'actions')
  if (Array.isArray(value)) {
    return value.length.toString();
  }

  // Se o valor for um objeto
  if (typeof value === 'object') {
    if ('value' in value) {
      return formatMetricValue(value.value, metric, currencyConfig);
    }
    return '-';
  }

  // Para valores numéricos, formatar adequadamente
  if (typeof value === 'number') {
    const { currency, locale } = currencyConfig;

    // Para métricas monetárias (spend, cost), usar formatação de moeda sem arredondamento
    if (
      metric.field.includes('spend') || 
      metric.field.includes('cost') || 
      metric.field.includes('budget')
    ) {
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(value);
    }
    
    // Para CTR, CPM e CPC, mostrar exatamente como está, sem arredondamento
    if (
      metric.field.toLowerCase().includes('ctr') || 
      metric.field.toLowerCase().includes('cpm') || 
      metric.field.toLowerCase().includes('cpc')
    ) {
      return value.toString();
    }
    
    // Para percentuais (taxas), mostrar valor exato
    if (metric.field.includes('rate')) {
      return `${(value * 100).toString()}%`;
    }
    
    // Para números inteiros (impressions, clicks), usar separador de milhares
    if (Number.isInteger(value)) {
      return new Intl.NumberFormat(locale).format(value);
    }
    
    // Para outros números decimais, mostrar valor exato
    return value.toString();
  }

  // Para strings e outros tipos
  return String(value);
};