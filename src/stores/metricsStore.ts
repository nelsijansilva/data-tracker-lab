import { create } from 'zustand';
import { type Metric } from '@/components/facebook/MetricSelector';

interface MetricsState {
  selectedMetrics: Metric[];
  setSelectedMetrics: (metrics: Metric[]) => void;
}

export const useMetricsStore = create<MetricsState>((set) => ({
  selectedMetrics: [
    { id: "name", name: "Nome", field: "name" },
    { id: "status", name: "Status", field: "status" },
    { id: "objective", name: "Objetivo", field: "objective" },
    { id: "spend", name: "Gasto", field: "spend" },
  ],
  setSelectedMetrics: (metrics) => set({ selectedMetrics: metrics }),
}));