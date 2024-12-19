import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, X } from "lucide-react";

export type Metric = {
  id: string;
  name: string;
  field: string;
  formula?: string;
  isCustom?: boolean;
};

const DEFAULT_METRICS: Metric[] = [
  { id: "name", name: "Nome", field: "name" },
  { id: "status", name: "Status", field: "status" },
  { id: "objective", name: "Objetivo", field: "objective" },
  { id: "spend", name: "Gasto", field: "spend" },
  { id: "impressions", name: "Impressões", field: "impressions" },
  { id: "clicks", name: "Cliques", field: "clicks" },
  { id: "ctr", name: "CTR", field: "ctr", formula: "clicks / impressions * 100" },
  { id: "cpc", name: "CPC", field: "cpc", formula: "spend / clicks" },
  { id: "cpm", name: "CPM", field: "cpm", formula: "spend / impressions * 1000" },
];

interface MetricSelectorProps {
  selectedMetrics: Metric[];
  onMetricsChange: (metrics: Metric[]) => void;
}

export const MetricSelector = ({ selectedMetrics, onMetricsChange }: MetricSelectorProps) => {
  const [customMetricName, setCustomMetricName] = useState("");
  const [customMetricFormula, setCustomMetricFormula] = useState("");

  const addMetric = (metricId: string) => {
    const metric = DEFAULT_METRICS.find(m => m.id === metricId);
    if (metric && !selectedMetrics.find(m => m.id === metric.id)) {
      onMetricsChange([...selectedMetrics, metric]);
    }
  };

  const removeMetric = (metricId: string) => {
    onMetricsChange(selectedMetrics.filter(m => m.id !== metricId));
  };

  const addCustomMetric = () => {
    if (customMetricName && customMetricFormula) {
      const newMetric: Metric = {
        id: `custom_${Date.now()}`,
        name: customMetricName,
        field: customMetricName.toLowerCase().replace(/\s+/g, '_'),
        formula: customMetricFormula,
        isCustom: true
      };
      onMetricsChange([...selectedMetrics, newMetric]);
      setCustomMetricName("");
      setCustomMetricFormula("");
    }
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <h3 className="text-lg font-semibold">Personalizar Métricas</h3>
      
      <div className="flex gap-2">
        <Select onValueChange={addMetric}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Adicionar métrica" />
          </SelectTrigger>
          <SelectContent>
            {DEFAULT_METRICS.filter(metric => 
              !selectedMetrics.find(m => m.id === metric.id)
            ).map(metric => (
              <SelectItem key={metric.id} value={metric.id}>
                {metric.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <h4 className="text-sm font-medium">Métricas Selecionadas</h4>
        <div className="flex flex-wrap gap-2">
          {selectedMetrics.map(metric => (
            <div key={metric.id} className="flex items-center gap-2 bg-secondary p-2 rounded-md">
              <span>{metric.name}</span>
              <button
                onClick={() => removeMetric(metric.id)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <h4 className="text-sm font-medium">Criar Métrica Personalizada</h4>
        <div className="flex gap-2">
          <Input
            placeholder="Nome da métrica"
            value={customMetricName}
            onChange={(e) => setCustomMetricName(e.target.value)}
          />
          <Input
            placeholder="Fórmula (ex: clicks / impressions * 100)"
            value={customMetricFormula}
            onChange={(e) => setCustomMetricFormula(e.target.value)}
          />
          <Button onClick={addCustomMetric} size="icon">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};