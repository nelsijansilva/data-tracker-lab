import React, { useState } from 'react';
import { X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCheckboxList } from "./MetricCheckboxList";
import { SelectedMetricsList } from "./SelectedMetricsList";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMetricsStore } from "@/stores/metricsStore";
import { toast } from "sonner";

export type Metric = {
  id: string;
  name: string;
  field: string;
  formula?: string;
  isCustom?: boolean;
};

export const MetricSelector = () => {
  const { 
    metrics,
    selectedMetrics,
    setSelectedMetrics,
    addMetric,
    deleteMetric,
    fetchMetrics
  } = useMetricsStore();

  const [newMetricName, setNewMetricName] = useState('');
  const [newMetricField, setNewMetricField] = useState('');

  React.useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  const handleToggleMetric = (metric: Metric) => {
    const isSelected = selectedMetrics.some((m) => m.id === metric.id);
    if (isSelected) {
      setSelectedMetrics(selectedMetrics.filter((m) => m.id !== metric.id));
    } else {
      setSelectedMetrics([...selectedMetrics, metric]);
    }
  };

  const handleAddMetric = async () => {
    if (!newMetricName || !newMetricField) {
      toast.error('Por favor, preencha todos os campos');
      return;
    }

    try {
      await addMetric({
        name: newMetricName,
        field: newMetricField,
        isCustom: true
      });
      
      setNewMetricName('');
      setNewMetricField('');
      toast.success('Métrica adicionada com sucesso');
    } catch (error) {
      toast.error('Erro ao adicionar métrica');
    }
  };

  return (
    <Card className="bg-[#1a1f2e] border-gray-700">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl font-semibold text-white">
          Personalizar Métricas
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-8">
          <div>
            <div className="mb-6 space-y-4">
              <h3 className="text-sm font-medium text-gray-400">
                Adicionar Nova Métrica
              </h3>
              <div className="space-y-2">
                <Input
                  placeholder="Nome da Métrica"
                  value={newMetricName}
                  onChange={(e) => setNewMetricName(e.target.value)}
                  className="bg-[#2a2f3d] border-gray-700 text-white"
                />
                <Input
                  placeholder="Campo da API (ex: clicks, impressions)"
                  value={newMetricField}
                  onChange={(e) => setNewMetricField(e.target.value)}
                  className="bg-[#2a2f3d] border-gray-700 text-white"
                />
                <Button 
                  onClick={handleAddMetric}
                  className="w-full bg-primary hover:bg-primary-hover text-white"
                >
                  Adicionar Métrica
                </Button>
              </div>
            </div>
            <h3 className="text-sm font-medium text-gray-400 mb-4">
              Métricas Disponíveis
            </h3>
            <MetricCheckboxList
              metrics={metrics}
              selectedMetrics={selectedMetrics}
              onToggleMetric={handleToggleMetric}
              onDeleteMetric={deleteMetric}
            />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-400 mb-4">
              Colunas selecionadas
            </h3>
            <SelectedMetricsList
              selectedMetrics={selectedMetrics}
              onRemoveMetric={(id) => handleToggleMetric(metrics.find(m => m.id === id)!)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};