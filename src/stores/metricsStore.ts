import { create } from 'zustand';
import { type Metric } from '@/components/facebook/MetricSelector';

interface MetricsState {
  selectedMetrics: Metric[];
  setSelectedMetrics: (metrics: Metric[]) => void;
}

export const useMetricsStore = create<MetricsState>((set) => ({
  selectedMetrics: [
    { id: "status", name: "Status", field: "status" },
    { id: "name", name: "Campanha", field: "name" },
    { id: "budget", name: "Orçamento", field: "budget" },
    { id: "sales", name: "Vendas", field: "sales" },
    { id: "cpa", name: "CPA", field: "cpa" },
    { id: "spend", name: "Gastos", field: "spend" },
    { id: "revenue", name: "Faturamento", field: "revenue" },
    { id: "profit", name: "Lucro", field: "profit" },
    { id: "roas", name: "ROAS", field: "roas" },
    { id: "margin", name: "Margem", field: "margin" },
    { id: "roi", name: "ROI", field: "roi" },
    { id: "ic", name: "IC", field: "ic" }
  ],
  setSelectedMetrics: (metrics) => set({ selectedMetrics: metrics }),
}));