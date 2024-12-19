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

// Updated metrics to use only valid Facebook Insights API fields
// Reference: https://developers.facebook.com/docs/marketing-api/reference/ads-insights/
const DEFAULT_METRICS: Metric[] = [
  { id: "name", name: "Nome", field: "name" },
  { id: "status", name: "Status", field: "status" },
  { id: "objective", name: "Objetivo", field: "objective" },
  { id: "daily_budget", name: "Orçamento Diário", field: "daily_budget" },
  { id: "lifetime_budget", name: "Orçamento Total", field: "lifetime_budget" },
  { id: "budget_remaining", name: "Orçamento Restante", field: "budget_remaining" },
  { id: "spend", name: "Gastos", field: "spend" },
  { id: "impressions", name: "Impressões", field: "impressions" },
  { id: "reach", name: "Alcance", field: "reach" },
  { id: "clicks", name: "Cliques", field: "clicks" },
  { id: "cpc", name: "CPC", field: "cpc" },
  { id: "cpm", name: "CPM", field: "cpm" },
  { id: "ctr", name: "CTR", field: "ctr" },
  { id: "frequency", name: "Frequência", field: "frequency" },
  { id: "cost_per_unique_click", name: "Custo por Clique Único", field: "cost_per_unique_click" },
  { id: "unique_clicks", name: "Cliques Únicos", field: "unique_clicks" },
  { id: "unique_ctr", name: "CTR Único", field: "unique_ctr" },
  { id: "cost_per_action_type", name: "Custo por Ação", field: "cost_per_action_type" },
  { id: "actions", name: "Ações", field: "actions" }
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

  const handleReorderMetrics = (newMetrics: Metric[]) => {
    onMetricsChange(newMetrics);
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
              onReorderMetrics={handleReorderMetrics}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};