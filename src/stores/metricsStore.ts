import { create } from 'zustand';
import { type Metric } from '@/components/facebook/MetricSelector';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface MetricsState {
  metrics: Metric[];
  selectedMetrics: Metric[];
  setSelectedMetrics: (metrics: Metric[]) => void;
  deleteMetric: (id: string) => Promise<void>;
  addMetric: (metric: Omit<Metric, 'id'>) => Promise<void>;
  fetchMetrics: () => Promise<void>;
}

export const useMetricsStore = create<MetricsState>((set) => ({
  metrics: [],
  selectedMetrics: [],
  
  setSelectedMetrics: (metrics) => set({ selectedMetrics: metrics }),
  
  fetchMetrics: async () => {
    const { data, error } = await supabase
      .from('custom_metrics')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      toast.error('Erro ao carregar métricas');
      console.error('Error fetching metrics:', error);
      return;
    }

    const metrics = data.map(m => ({
      id: m.id,
      name: m.name,
      field: m.field,
      isCustom: m.is_custom
    }));

    set({ metrics });
  },

  deleteMetric: async (id: string) => {
    const { error } = await supabase
      .from('custom_metrics')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Erro ao deletar métrica');
      console.error('Error deleting metric:', error);
      return;
    }

    toast.success('Métrica deletada com sucesso');
    set(state => ({
      metrics: state.metrics.filter(m => m.id !== id),
      selectedMetrics: state.selectedMetrics.filter(m => m.id !== id)
    }));
  },

  addMetric: async (metric: Omit<Metric, 'id'>) => {
    const { data, error } = await supabase
      .from('custom_metrics')
      .insert([{
        name: metric.name,
        field: metric.field,
        is_custom: metric.isCustom || false
      }])
      .select()
      .single();

    if (error) {
      toast.error('Erro ao adicionar métrica');
      console.error('Error adding metric:', error);
      return;
    }

    toast.success('Métrica adicionada com sucesso');
    set(state => ({
      metrics: [...state.metrics, {
        id: data.id,
        name: data.name,
        field: data.field,
        isCustom: data.is_custom
      }]
    }));
  }
}));