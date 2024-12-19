import React from 'react';
import { X } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Metric } from './MetricSelector';

interface SortableItemProps {
  metric: Metric;
  onRemove: (id: string) => void;
}

const SortableItem = ({ metric, onRemove }: SortableItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: metric.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="flex items-center justify-between p-3 mb-2 bg-[#1a1f2e] rounded-lg border border-gray-700 cursor-move hover:border-gray-600 transition-colors"
    >
      <span className="text-gray-300">{metric.name}</span>
      <button
        onClick={() => onRemove(metric.id)}
        className="text-gray-500 hover:text-gray-300 transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

interface SelectedMetricsListProps {
  selectedMetrics: Metric[];
  onRemoveMetric: (metricId: string) => void;
  onReorderMetrics?: (metrics: Metric[]) => void;
}

export const SelectedMetricsList = ({
  selectedMetrics,
  onRemoveMetric,
  onReorderMetrics,
}: SelectedMetricsListProps) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = selectedMetrics.findIndex((metric) => metric.id === active.id);
      const newIndex = selectedMetrics.findIndex((metric) => metric.id === over.id);
      
      const newMetrics = arrayMove(selectedMetrics, oldIndex, newIndex);
      onReorderMetrics?.(newMetrics);
    }
  };

  if (!selectedMetrics.length) {
    return (
      <div className="text-center py-8 text-gray-400">
        <p>Nenhuma métrica selecionada</p>
        <p className="text-sm mt-2">Selecione métricas da lista à esquerda</p>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={selectedMetrics.map(metric => metric.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-2">
          {selectedMetrics.map((metric) => (
            <SortableItem
              key={metric.id}
              metric={metric}
              onRemove={onRemoveMetric}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
};