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
  addMetric: (metric: Omit<Metric, 'id'>) => Promise<void>;
  deleteMetric: (id: string) => Promise<void>;
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
      throw error;
    }
  },

  initializeDefaultMetrics: async () => {
    const { selectedMetrics } = get();
    
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
        throw error;
      }
    }
  },

  addMetric: async (metric) => {
    try {
      const { data, error } = await supabase
        .from('custom_metrics')
        .insert([{
          name: metric.name,
          field: metric.field,
          is_custom: metric.isCustom
        }])
        .select()
        .single();

      if (error) throw error;

      const { metrics } = get();
      set({ 
        metrics: [...metrics, {
          id: data.id,
          name: data.name,
          field: data.field,
          isCustom: data.is_custom
        }]
      });
    } catch (error) {
      console.error('Error adding metric:', error);
      throw error;
    }
  },

  deleteMetric: async (id) => {
    try {
      const { error } = await supabase
        .from('custom_metrics')
        .delete()
        .eq('id', id);

      if (error) throw error;

      const { metrics, selectedMetrics } = get();
      set({ 
        metrics: metrics.filter(m => m.id !== id),
        selectedMetrics: selectedMetrics.filter(m => m.id !== id)
      });
    } catch (error) {
      console.error('Error deleting metric:', error);
      throw error;
    }
  }
}));