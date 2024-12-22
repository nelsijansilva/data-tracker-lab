import { create } from 'zustand';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

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

const handleApiError = (error: any, message: string) => {
  console.error(message, error);
  toast({
    title: "Error",
    description: message,
    variant: "destructive",
  });
};

export const useMetricsStore = create<MetricsState>((set, get) => ({
  metrics: [],
  selectedMetrics: [],
  
  setSelectedMetrics: async (metrics) => {
    set({ selectedMetrics: metrics });
    try {
      const { persistSelectedMetrics } = get();
      await persistSelectedMetrics(metrics);
    } catch (error) {
      handleApiError(error, "Failed to save selected metrics");
    }
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
      handleApiError(error, "Failed to fetch metrics");
    }
  },

  initializeDefaultMetrics: async () => {
    const { selectedMetrics, loadPersistedMetrics } = get();
    
    if (selectedMetrics.length === 0) {
      try {
        await loadPersistedMetrics();
        
        if (get().selectedMetrics.length === 0) {
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
          const { persistSelectedMetrics } = get();
          await persistSelectedMetrics(defaultMetrics);
        }
      } catch (error) {
        handleApiError(error, "Failed to initialize default metrics");
      }
    }
  },

  persistSelectedMetrics: async (metrics: Metric[]) => {
    try {
      const { error: deleteError } = await supabase
        .from('selected_metrics')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');

      if (deleteError) throw deleteError;

      if (metrics.length > 0) {
        const { error: insertError } = await supabase
          .from('selected_metrics')
          .insert(metrics.map(metric => ({ metric_id: metric.id })));

        if (insertError) throw insertError;
      }
    } catch (error) {
      handleApiError(error, "Failed to persist selected metrics");
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
      handleApiError(error, "Failed to load persisted metrics");
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
      handleApiError(error, "Failed to add metric");
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

      const { persistSelectedMetrics } = get();
      await persistSelectedMetrics(newSelectedMetrics);
    } catch (error) {
      handleApiError(error, "Failed to delete metric");
    }
  }
}));
