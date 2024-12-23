import { Metric } from '@/components/facebook/MetricSelector';
import { getMetricMapping } from './metrics';

export type CurrencyConfig = {
  currency: string;
  locale: string;
};

const DEFAULT_CURRENCY: CurrencyConfig = {
  currency: 'BRL',
  locale: 'pt-BR'
};

export const formatMetricValue = (value: any, metric: Metric, currencyConfig: CurrencyConfig = DEFAULT_CURRENCY) => {
  if (value === null || value === undefined) return '0';

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

  const metricMapping = getMetricMapping(metric.field);
  const numericValue = Number(value);

  if (isNaN(numericValue)) {
    return String(value);
  }

  const { currency, locale } = currencyConfig;

  switch (metricMapping.format) {
    case 'currency':
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(numericValue);

    case 'percentage':
      // Divide por 100 para converter o valor decimal em percentual
      return new Intl.NumberFormat(locale, {
        style: 'percent',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(numericValue / 100);

    case 'decimal':
      return new Intl.NumberFormat(locale, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(numericValue);

    case 'number':
      return new Intl.NumberFormat(locale, {
        maximumFractionDigits: 0
      }).format(numericValue);

    default:
      return String(value);
  }
};