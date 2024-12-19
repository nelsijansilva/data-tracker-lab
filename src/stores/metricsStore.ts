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
  persistSelectedMetrics: (metrics: Metric[]) => Promise<void>;
  loadPersistedMetrics: () => Promise<void>;
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
  
  setSelectedMetrics: async (metrics) => {
    set({ selectedMetrics: metrics });
    // Persist the selection whenever it changes
    const { persistSelectedMetrics } = get();
    await persistSelectedMetrics(metrics);
  },
  
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
    const { selectedMetrics, loadPersistedMetrics } = get();
    
    if (selectedMetrics.length === 0) {
      // First try to load persisted metrics
      await loadPersistedMetrics();
      
      // If still no metrics are selected, load defaults
      if (get().selectedMetrics.length === 0) {
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
          // Persist default metrics
          const { persistSelectedMetrics } = get();
          await persistSelectedMetrics(defaultMetrics);
        } catch (error) {
          console.error('Error initializing default metrics:', error);
          throw error;
        }
      }
    }
  },

  persistSelectedMetrics: async (metrics: Metric[]) => {
    try {
      // First, delete all existing selections
      const { error: deleteError } = await supabase
        .from('selected_metrics')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all records

      if (deleteError) throw deleteError;

      // Then insert new selections
      if (metrics.length > 0) {
        const { error: insertError } = await supabase
          .from('selected_metrics')
          .insert(
            metrics.map(metric => ({
              metric_id: metric.id
            }))
          );

        if (insertError) throw insertError;
      }
    } catch (error) {
      console.error('Error persisting selected metrics:', error);
      throw error;
    }
  },

  loadPersistedMetrics: async () => {
    try {
      const { data, error } = await supabase
        .from('selected_metrics')
        .select(`
          metric_id,
          custom_metrics (
            id,
            name,
            field,
            is_custom
          )
        `);

      if (error) throw error;

      if (data && data.length > 0) {
        const metrics = data.map(item => ({
          id: item.custom_metrics.id,
          name: item.custom_metrics.name,
          field: item.custom_metrics.field,
          isCustom: item.custom_metrics.is_custom
        }));

        set({ selectedMetrics: metrics });
      }
    } catch (error) {
      console.error('Error loading persisted metrics:', error);
      throw error;
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
      const newSelectedMetrics = selectedMetrics.filter(m => m.id !== id);
      
      set({ 
        metrics: metrics.filter(m => m.id !== id),
        selectedMetrics: newSelectedMetrics
      });

      // Update persisted selections
      const { persistSelectedMetrics } = get();
      await persistSelectedMetrics(newSelectedMetrics);
    } catch (error) {
      console.error('Error deleting metric:', error);
      throw error;
    }
  }
}));