import React from 'react';
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Metric } from "./MetricSelector";

interface MetricCheckboxListProps {
  metrics: Metric[];
  selectedMetrics: Metric[];
  onToggleMetric: (metric: Metric) => void;
}

export const MetricCheckboxList = ({
  metrics,
  selectedMetrics,
  onToggleMetric,
}: MetricCheckboxListProps) => {
  return (
    <ScrollArea className="h-[500px] pr-4">
      <div className="space-y-4">
        {metrics.map((metric) => (
          <div key={metric.id} className="flex items-center space-x-2">
            <Checkbox
              id={metric.id}
              checked={selectedMetrics.some((m) => m.id === metric.id)}
              onCheckedChange={() => onToggleMetric(metric)}
            />
            <label
              htmlFor={metric.id}
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-200"
            >
              {metric.name}
            </label>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};