import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricSelector } from "./MetricSelector";
import { useMetricsStore } from "@/stores/metricsStore";

export const CustomMetricsDashboard = () => {
  const { selectedMetrics, setSelectedMetrics } = useMetricsStore();

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Configurar Métricas Personalizadas</CardTitle>
        </CardHeader>
        <CardContent>
          <MetricSelector
            selectedMetrics={selectedMetrics}
            onMetricsChange={setSelectedMetrics}
          />
        </CardContent>
      </Card>
    </div>
  );
};