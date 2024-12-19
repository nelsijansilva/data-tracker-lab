import React from 'react';
import { X } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Metric } from "./MetricSelector";

interface SelectedMetricsListProps {
  selectedMetrics: Metric[];
  onRemoveMetric: (metricId: string) => void;
}

export const SelectedMetricsList = ({
  selectedMetrics,
  onRemoveMetric,
}: SelectedMetricsListProps) => {
  return (
    <ScrollArea className="h-[500px]">
      <div className="space-y-2">
        {selectedMetrics.map((metric) => (
          <div
            key={metric.id}
            className="flex items-center justify-between p-3 bg-[#2f3850] rounded-lg group"
          >
            <span className="text-sm text-gray-200">{metric.name}</span>
            <button
              onClick={() => onRemoveMetric(metric.id)}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="h-4 w-4 text-gray-400 hover:text-gray-200" />
            </button>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};