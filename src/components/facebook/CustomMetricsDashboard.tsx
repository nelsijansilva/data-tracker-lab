import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricSelector } from "./MetricSelector";
import { useMetricsStore } from "@/stores/metricsStore";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export const CustomMetricsDashboard = () => {
  const { selectedMetrics, setSelectedMetrics, fetchMetrics } = useMetricsStore();

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  return (
    <div className="space-y-4">
      <Alert className="bg-[#2a2f3d] border-gray-700">
        <AlertCircle className="h-4 w-4 text-blue-400" />
        <AlertDescription className="text-gray-300">
          As métricas selecionadas aqui serão refletidas em todas as visualizações de campanhas, conjuntos de anúncios e anúncios.
        </AlertDescription>
      </Alert>

      <Card className="bg-[#2a2f3d] border-gray-700">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-white">
            Configurar Métricas Personalizadas
          </CardTitle>
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