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

interface MetricSelectorProps {
  selectedMetrics: Metric[];
  onMetricsChange: (metrics: Metric[]) => void;
}

export const MetricSelector = ({ 
  selectedMetrics, 
  onMetricsChange 
}: MetricSelectorProps) => {
  const { 
    metrics,
    addMetric,
    deleteMetric,
    fetchMetrics
  } = useMetricsStore();

  const [newMetricName, setNewMetricName] = useState('');
  const [newMetricField, setNewMetricField] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  React.useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  const handleToggleMetric = (metric: Metric) => {
    const isSelected = selectedMetrics.some((m) => m.id === metric.id);
    if (isSelected) {
      onMetricsChange(selectedMetrics.filter((m) => m.id !== metric.id));
    } else {
      onMetricsChange([...selectedMetrics, metric]);
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

  const filteredMetrics = metrics.filter(metric => 
    metric.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    metric.field.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-400">
                Métricas Disponíveis
              </h3>
              <Input
                placeholder="Buscar métricas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-[#2a2f3d] border-gray-700 text-white mb-4"
              />
              <MetricCheckboxList
                metrics={filteredMetrics}
                selectedMetrics={selectedMetrics}
                onToggleMetric={handleToggleMetric}
                onDeleteMetric={deleteMetric}
              />
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-400 mb-4">
              Colunas selecionadas
            </h3>
            <SelectedMetricsList
              selectedMetrics={selectedMetrics}
              onRemoveMetric={(id) => {
                const metricToRemove = metrics.find(m => m.id === id);
                if (metricToRemove) {
                  handleToggleMetric(metricToRemove);
                }
              }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};