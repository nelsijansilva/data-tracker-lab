import { create } from 'zustand';
import { supabase } from "@/integrations/supabase/client";

export type Metric = {
  id: string;
  name: string;
  field: string;
  isCustom?: boolean;
};

interface MetricsState {
  metrics: Metric[];
  selectedMetrics: Metric[];
  setSelectedMetrics: (metrics: Metric[]) => void;
  fetchMetrics: () => Promise<void>;
  initializeDefaultMetrics: () => Promise<void>;
}

const DEFAULT_METRIC_FIELDS = [
  'spend',
  'impressions',
  'clicks',
  'ctr',
  'cpc',
  'reach'
];

export const useMetricsStore = create<MetricsState>((set, get) => ({
  metrics: [],
  selectedMetrics: [],
  setSelectedMetrics: (metrics) => set({ selectedMetrics: metrics }),
  
  fetchMetrics: async () => {
    try {
      const { data, error } = await supabase
        .from('custom_metrics')
        .select('*');

      if (error) throw error;

      const formattedMetrics = data.map(metric => ({
        id: metric.id,
        name: metric.name,
        field: metric.field,
        isCustom: metric.is_custom
      }));

      set({ metrics: formattedMetrics });
    } catch (error) {
      console.error('Error fetching metrics:', error);
    }
  },

  initializeDefaultMetrics: async () => {
    const { selectedMetrics } = get();
    
    // Only initialize if no metrics are selected
    if (selectedMetrics.length === 0) {
      try {
        const { data, error } = await supabase
          .from('custom_metrics')
          .select('*')
          .in('field', DEFAULT_METRIC_FIELDS);

        if (error) throw error;

        const defaultMetrics = data.map(metric => ({
          id: metric.id,
          name: metric.name,
          field: metric.field,
          isCustom: metric.is_custom
        }));

        set({ selectedMetrics: defaultMetrics });
      } catch (error) {
        console.error('Error initializing default metrics:', error);
      }
    }
  }
}));