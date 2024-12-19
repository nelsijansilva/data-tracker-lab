import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useMetricsStore } from "@/stores/metricsStore";
import { SelectedMetricsList } from "./SelectedMetricsList";
import { MetricList } from "./MetricList";
import { AddMetricForm } from "./AddMetricForm";

export type Metric = {
  id: string;
  name: string;
  field: string;
  isCustom?: boolean;
  formula?: string;
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
    fetchMetrics,
    loadPersistedMetrics
  } = useMetricsStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [newMetricName, setNewMetricName] = useState('');
  const [newMetricField, setNewMetricField] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    const initializeMetrics = async () => {
      await fetchMetrics();
      await loadPersistedMetrics();
    };

    initializeMetrics();
  }, [fetchMetrics, loadPersistedMetrics]);

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
      try {
        await addMetric({
          name: newMetricName,
          field: newMetricField,
          isCustom: true,
        });

        await fetchMetrics();
        setNewMetricName('');
        setNewMetricField('');
        setShowAddForm(false);
      } catch (error) {
        console.error('Error adding custom metric:', error);
      }
    }
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

          <MetricList
            metrics={filteredMetrics}
            selectedMetrics={selectedMetrics}
            onToggleMetric={handleToggleMetric}
            onDeleteMetric={deleteMetric}
          />

          <Button
            variant="outline"
            className="w-full border-dashed"
            onClick={() => setShowAddForm(!showAddForm)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Adicionar Métrica Personalizada
          </Button>

          {showAddForm && (
            <AddMetricForm
              newMetricName={newMetricName}
              newMetricField={newMetricField}
              onNameChange={setNewMetricName}
              onFieldChange={setNewMetricField}
              onSubmit={handleAddCustomMetric}
            />
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