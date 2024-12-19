import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricSelector, type Metric } from "./MetricSelector";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { addDays } from "date-fns";
import { DateRange } from "react-day-picker";
import { useQuery } from "@tanstack/react-query";
import { fetchCampaigns } from "@/lib/facebook/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, DollarSign, TrendingUp, TrendingDown } from "lucide-react";

export const CustomMetricsDashboard = () => {
  const [selectedMetrics, setSelectedMetrics] = useState<Metric[]>([]);
  const [dateRange, setDateRange] = useState<DateRange>({
    from: addDays(new Date(), -30),
    to: new Date(),
  });

  const { data: campaigns, isLoading, error } = useQuery({
    queryKey: ['campaigns', selectedMetrics, dateRange?.from, dateRange?.to],
    queryFn: () => fetchCampaigns(selectedMetrics, dateRange),
    enabled: !!dateRange?.from && !!dateRange?.to && selectedMetrics.length > 0,
  });

  const formatMetricValue = (value: any, metric: Metric) => {
    if (typeof value === 'number') {
      if (metric.field.includes('cost') || metric.field === 'spend') {
        return (
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            {value.toFixed(2)}
          </div>
        );
      }
      if (metric.field.includes('rate') || metric.field.includes('roas') || metric.field.includes('percentage')) {
        return (
          <div className="flex items-center gap-2">
            {value > 0 ? (
              <TrendingUp className="w-4 h-4 text-green-500" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-500" />
            )}
            {value.toFixed(2)}%
          </div>
        );
      }
      return value.toLocaleString();
    }
    return value;
  };

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Erro ao carregar dados</AlertTitle>
        <AlertDescription>
          {error instanceof Error ? error.message : 'Erro desconhecido ao carregar dados'}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-start gap-4">
        <Card className="w-full">
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

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>Resultados</CardTitle>
          <DateRangePicker
            value={dateRange}
            onChange={setDateRange}
          />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <p>Carregando dados...</p>
            </div>
          ) : campaigns && campaigns.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  {selectedMetrics.map((metric) => (
                    <TableHead key={metric.id}>{metric.name}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {campaigns.map((campaign: any) => (
                  <TableRow key={campaign.id}>
                    {selectedMetrics.map((metric) => (
                      <TableCell key={`${campaign.id}-${metric.id}`}>
                        {formatMetricValue(campaign[metric.field], metric)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex items-center justify-center py-8">
              <p>Selecione métricas para visualizar os dados</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};