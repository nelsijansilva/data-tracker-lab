import { create } from 'zustand';
import { type Metric } from '@/components/facebook/MetricSelector';

interface MetricsState {
  selectedMetrics: Metric[];
  setSelectedMetrics: (metrics: Metric[]) => void;
}

export const useMetricsStore = create<MetricsState>((set) => ({
  selectedMetrics: [
    { id: "status", name: "Status", field: "status" },
    { id: "name", name: "Nome", field: "name" },
    { id: "spend", name: "Gastos", field: "spend" },
    { id: "impressions", name: "Impressões", field: "impressions" },
    { id: "clicks", name: "Cliques", field: "clicks" },
    { id: "ctr", name: "CTR", field: "ctr" },
    { id: "cpc", name: "CPC", field: "cpc" },
    { id: "reach", name: "Alcance", field: "reach" }
  ],
  setSelectedMetrics: (metrics) => set({ selectedMetrics: metrics }),
}));