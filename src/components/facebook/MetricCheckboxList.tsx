import React from 'react';
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Metric } from "./MetricSelector";
import { useMetricsStore } from "@/stores/metricsStore";

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
  const { deleteMetric } = useMetricsStore();

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Tem certeza que deseja deletar esta métrica?')) {
      await deleteMetric(id);
    }
  };

  return (
    <ScrollArea className="h-[500px] pr-4">
      <div className="space-y-4">
        {metrics.map((metric) => (
          <div key={metric.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-hacker-darker group">
            <div className="flex items-center space-x-2">
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
            <Button
              variant="ghost"
              size="icon"
              className="opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => handleDelete(metric.id, e)}
            >
              <Trash2 className="h-4 w-4 text-red-500 hover:text-red-400" />
            </Button>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};