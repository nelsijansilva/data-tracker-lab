import { DollarSign, TrendingUp, TrendingDown } from "lucide-react";
import type { Metric } from "@/components/facebook/MetricSelector";

interface MetricValueProps {
  value: any;
  metric: Metric;
}

export const MetricValue = ({ value, metric }: MetricValueProps) => {
  if (typeof value !== 'number') return <>{value}</>;

  // Handle monetary values (spend and cost metrics)
  if (metric.field === 'spend' || metric.field.includes('cost')) {
    return (
      <div className="flex items-center gap-2">
        <DollarSign className="w-4 h-4" />
        {value.toFixed(2)}
      </div>
    );
  }

  // Handle rate metrics (ctr, cpc, cpm)
  if (metric.field === 'ctr' || metric.field === 'cpc' || metric.field === 'cpm') {
    const formattedValue = value.toFixed(2);
    const icon = value > 0 ? (
      <TrendingUp className="w-4 h-4 text-green-500" />
    ) : (
      <TrendingDown className="w-4 h-4 text-red-500" />
    );

    return (
      <div className="flex items-center gap-2">
        {icon}
        {formattedValue}
        {metric.field === 'ctr' && '%'}
      </div>
    );
  }

  // Handle other numeric values
  return <>{value.toLocaleString()}</>;
};