import { create } from 'zustand';
import { apiClient } from '@/lib/api/client';

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
    const { persistSelectedMetrics } = get();
    await persistSelectedMetrics(metrics);
  },
  
  fetchMetrics: async () => {
    try {
      const data = await apiClient.get('/api/metrics');
      const formattedMetrics = data.map((metric: any) => ({
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
      await loadPersistedMetrics();
      
      if (get().selectedMetrics.length === 0) {
        try {
          const data = await apiClient.get('/api/metrics');
          const defaultMetrics = data.filter((metric: any) => 
            DEFAULT_METRIC_FIELDS.includes(metric.field)
          ).map((metric: any) => ({
            id: metric.id,
            name: metric.name,
            field: metric.field,
            isCustom: metric.is_custom
          }));

          set({ selectedMetrics: defaultMetrics });
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
      await apiClient.delete('/api/selected_metrics');

      // Then insert new selections
      if (metrics.length > 0) {
        await apiClient.post('/api/selected_metrics', 
          metrics.map(metric => ({
            metric_id: metric.id
          }))
        );
      }
    } catch (error) {
      console.error('Error persisting selected metrics:', error);
      throw error;
    }
  },

  loadPersistedMetrics: async () => {
    try {
      const data = await apiClient.get('/api/selected_metrics');
      if (data && data.length > 0) {
        const metrics = data.map(item => ({
          id: item.metric_id,
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
      const data = await apiClient.post('/api/metrics', {
        name: metric.name,
        field: metric.field,
        is_custom: metric.isCustom
      });

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
      await apiClient.delete(`/api/metrics/${id}`);

      const { metrics, selectedMetrics } = get();
      const newSelectedMetrics = selectedMetrics.filter(m => m.id !== id);
      
      set({ 
        metrics: metrics.filter(m => m.id !== id),
        selectedMetrics: newSelectedMetrics
      });

      const { persistSelectedMetrics } = get();
      await persistSelectedMetrics(newSelectedMetrics);
    } catch (error) {
      console.error('Error deleting metric:', error);
      throw error;
    }
  }
}));
