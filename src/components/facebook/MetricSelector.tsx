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
  { id: "budget", name: "Orçamento", field: "budget" },
  { id: "cpa", name: "CPA", field: "cpa" },
  { id: "product_cost", name: "Custos de Produto", field: "product_cost" },
  { id: "conversations", name: "[Conversas] - Conversas Iniciadas", field: "conversations" },
  { id: "conversation_cost", name: "[Custo / Conversa] - Custo por Conversa Iniciada", field: "conversation_cost" },
  { id: "sales", name: "Vendas", field: "sales" },
  { id: "spend", name: "Gastos", field: "spend" },
  { id: "revenue", name: "Faturamento", field: "revenue" },
  { id: "profit", name: "Lucro", field: "profit" },
  { id: "roas", name: "ROAS", field: "roas" },
  { id: "margin", name: "Margem", field: "margin" },
  { id: "roi", name: "ROI", field: "roi" },
  { id: "ic", name: "[IC] - Finalização de compra iniciada", field: "ic" },
  { id: "registrations", name: "Cadastros", field: "registrations" },
  { id: "cpl", name: "[CPL] - Custo por Cadastro", field: "cpl" },
  { id: "cpi", name: "[CPI] - Custo por finalização de compra iniciada", field: "cpi" },
  { id: "cpc", name: "[CPC] - Custo por clique", field: "cpc" },
  { id: "ctr", name: "CTR", field: "ctr" },
  { id: "cpm", name: "CPM", field: "cpm" },
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