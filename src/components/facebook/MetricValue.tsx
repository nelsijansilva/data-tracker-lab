import { DollarSign, TrendingUp, TrendingDown } from "lucide-react";
import type { Metric } from "@/components/facebook/MetricSelector";

interface MetricValueProps {
  value: any;
  metric: Metric;
}

export const MetricValue = ({ value, metric }: MetricValueProps) => {
  if (typeof value !== 'number') return <>{value}</>;

  if (metric.field === 'spend' || metric.field.includes('cost')) {
    return (
      <div className="flex items-center gap-2">
        <DollarSign className="w-4 h-4" />
        {value.toFixed(2)}
      </div>
    );
  }

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

  return <>{value.toLocaleString()}</>;
};