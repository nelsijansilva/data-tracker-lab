import React from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Metric } from './MetricSelector';

interface MetricListProps {
  metrics: Metric[];
  selectedMetrics: Metric[];
  onToggleMetric: (metric: Metric) => void;
  onDeleteMetric: (id: string) => void;
}

export const MetricList = ({
  metrics,
  selectedMetrics,
  onToggleMetric,
  onDeleteMetric,
}: MetricListProps) => {
  return (
    <ScrollArea className="h-[500px] rounded-md border border-gray-700 bg-[#2a2f3d] p-4">
      <div className="space-y-2">
        {metrics.map((metric) => {
          const isSelected = selectedMetrics.some((m) => m.id === metric.id);
          return (
            <div
              key={metric.id}
              onClick={() => onToggleMetric(metric)}
              className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                isSelected
                  ? 'bg-[#3b82f6]/10 border-[#3b82f6]'
                  : 'border-gray-700 hover:border-gray-600'
              }`}
            >
              <div>
                <p className="text-gray-300">{metric.name}</p>
                <p className="text-sm text-gray-500">{metric.field}</p>
              </div>
              {metric.isCustom && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteMetric(metric.id);
                  }}
                  className="text-red-500 hover:text-red-400"
                >
                  Excluir
                </button>
              )}
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
};