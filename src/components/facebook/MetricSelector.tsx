import React from 'react';
import { X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCheckboxList } from "./MetricCheckboxList";
import { SelectedMetricsList } from "./SelectedMetricsList";

export type Metric = {
  id: string;
  name: string;
  field: string;
  formula?: string;
  isCustom?: boolean;
};

const DEFAULT_METRICS: Metric[] = [
  { id: "name", name: "Nome", field: "name" },
  { id: "status", name: "Status", field: "status" },
  { id: "objective", name: "Objetivo", field: "objective" },
  { id: "daily_budget", name: "Orçamento Diário", field: "daily_budget" },
  { id: "lifetime_budget", name: "Orçamento Total", field: "lifetime_budget" },
  { id: "budget_remaining", name: "Orçamento Restante", field: "budget_remaining" },
  { id: "spend", name: "Gastos", field: "spend" },
  { id: "impressions", name: "Impressões", field: "impressions" },
  { id: "clicks", name: "Cliques", field: "clicks" },
  { id: "cpc", name: "CPC", field: "cpc" },
  { id: "ctr", name: "CTR", field: "ctr" },
  { id: "cpm", name: "CPM", field: "cpm" },
  { id: "reach", name: "Alcance", field: "reach" },
  { id: "frequency", name: "Frequência", field: "frequency" },
];

interface MetricSelectorProps {
  selectedMetrics: Metric[];
  onMetricsChange: (metrics: Metric[]) => void;
}

export const MetricSelector = ({
  selectedMetrics,
  onMetricsChange,
}: MetricSelectorProps) => {
  const handleToggleMetric = (metric: Metric) => {
    const isSelected = selectedMetrics.some((m) => m.id === metric.id);
    if (isSelected) {
      onMetricsChange(selectedMetrics.filter((m) => m.id !== metric.id));
    } else {
      onMetricsChange([...selectedMetrics, metric]);
    }
  };

  const handleRemoveMetric = (metricId: string) => {
    onMetricsChange(selectedMetrics.filter((m) => m.id !== metricId));
  };

  return (
    <Card className="bg-[#1a1f2e] border-gray-700">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl font-semibold text-white">
          Personalizar Métricas
        </CardTitle>
        <button className="text-gray-400 hover:text-white">
          <X className="h-5 w-5" />
        </button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-8">
          <div>
            <h3 className="text-sm font-medium text-gray-400 mb-4">
              Escolha como você quer visualizar as colunas na tabela
            </h3>
            <MetricCheckboxList
              metrics={DEFAULT_METRICS}
              selectedMetrics={selectedMetrics}
              onToggleMetric={handleToggleMetric}
            />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-400 mb-4">
              Colunas selecionadas
            </h3>
            <SelectedMetricsList
              selectedMetrics={selectedMetrics}
              onRemoveMetric={handleRemoveMetric}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};