import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useMetricsStore } from "@/stores/metricsStore";
import { SelectedMetricsList } from "./SelectedMetricsList";
import { ScrollArea } from "@/components/ui/scroll-area";

export type Metric = {
  id: string;
  name: string;
  field: string;
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

  const [searchTerm, setSearchTerm] = useState('');
  const [newMetricName, setNewMetricName] = useState('');
  const [newMetricField, setNewMetricField] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

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

  const handleAddCustomMetric = async () => {
    if (newMetricName && newMetricField) {
      const newMetric = await addMetric({
        name: newMetricName,
        field: newMetricField,
        isCustom: true,
      });

      setNewMetricName('');
      setNewMetricField('');
      setShowAddForm(false);

      if (newMetric) {
        onMetricsChange([...selectedMetrics, newMetric]);
      }
    }
  };

  const handleDeleteMetric = async (metricId: string) => {
    await deleteMetric(metricId);
    onMetricsChange(selectedMetrics.filter((m) => m.id !== metricId));
  };

  const filteredMetrics = metrics.filter((metric) =>
    metric.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    metric.field.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="grid grid-cols-2 gap-6">
      <div>
        <div className="space-y-4">
          <Input
            placeholder="Buscar métricas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-[#2a2f3d] border-gray-700 text-white"
          />

          <ScrollArea className="h-[500px] rounded-md border border-gray-700 bg-[#2a2f3d] p-4">
            <div className="space-y-2">
              {filteredMetrics.map((metric) => {
                const isSelected = selectedMetrics.some((m) => m.id === metric.id);
                return (
                  <div
                    key={metric.id}
                    onClick={() => handleToggleMetric(metric)}
                    className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-[#3b82f6]/10 border-[#3b82f6]'
                        : 'border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    <div>
                      <p className="text-gray-300">{metric.name}</p>
                      <p className="text-sm text-gray-500">{metric.field}</p>
                    </div>
                    {metric.isCustom && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteMetric(metric.id);
                        }}
                        className="text-red-500 hover:text-red-400"
                      >
                        Excluir
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </ScrollArea>

          <Button
            variant="outline"
            className="w-full border-dashed"
            onClick={() => setShowAddForm(!showAddForm)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Adicionar Métrica Personalizada
          </Button>

          {showAddForm && (
            <div className="space-y-4 p-4 rounded-lg border border-gray-700 bg-[#2a2f3d]">
              <Input
                placeholder="Nome da métrica"
                value={newMetricName}
                onChange={(e) => setNewMetricName(e.target.value)}
                className="bg-[#1a1f2e] border-gray-700 text-white"
              />
              <Input
                placeholder="Campo da métrica"
                value={newMetricField}
                onChange={(e) => setNewMetricField(e.target.value)}
                className="bg-[#1a1f2e] border-gray-700 text-white"
              />
              <Button
                onClick={handleAddCustomMetric}
                disabled={!newMetricName || !newMetricField}
                className="w-full"
              >
                Adicionar
              </Button>
            </div>
          )}
        </div>
      </div>

      <div>
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white mb-4">
            Métricas Selecionadas
          </h3>
          <SelectedMetricsList
            selectedMetrics={selectedMetrics}
            onRemoveMetric={(id) => {
              const metricToRemove = metrics.find(m => m.id === id);
              if (metricToRemove) {
                handleToggleMetric(metricToRemove);
              }
            }}
            onReorderMetrics={onMetricsChange}
          />
        </div>
      </div>
    </div>
  );
};