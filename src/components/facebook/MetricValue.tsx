import { DollarSign, TrendingUp, TrendingDown } from "lucide-react";
import type { Metric } from "@/components/facebook/MetricSelector";

interface MetricValueProps {
  value: any;
  metric: Metric;
}

export const MetricValue = ({ value, metric }: MetricValueProps) => {
  // Se o valor for um array de objetos (comum em métricas de ações do Facebook)
  if (Array.isArray(value)) {
    // Procura pelo objeto relevante no array baseado no tipo de ação
    const relevantAction = value.find(action => 
      action.action_type === metric.field || 
      action.action_type === metric.field.replace('website_', 'offsite_') ||
      action.action_type === metric.field.replace('app_', 'mobile_app_')
    );
    
    // Se encontrou uma ação relevante, use seu valor
    if (relevantAction) {
      value = relevantAction.value;
    } else {
      value = 0; // Valor padrão se não encontrar a ação específica
    }
  }

  // Se o valor não for um número após o processamento, retorna 0
  if (typeof value !== 'number') {
    value = 0;
  }

  // Formatação para métricas monetárias
  if (metric.field === 'spend' || metric.field.includes('cost')) {
    return (
      <div className="flex items-center gap-2">
        <DollarSign className="w-4 h-4" />
        {value.toFixed(2)}
      </div>
    );
  }

  // Formatação para métricas de taxa/porcentagem
  if (metric.field.includes('rate') || metric.field === 'ctr' || metric.field === 'website_purchase_roas') {
    return (
      <div className="flex items-center gap-2">
        {value > 1 ? (
          <TrendingUp className="w-4 h-4 text-green-500" />
        ) : (
          <TrendingDown className="w-4 h-4 text-red-500" />
        )}
        {value.toFixed(2)}%
      </div>
    );
  }

  // Formatação padrão para números
  return <>{value.toLocaleString()}</>;
};