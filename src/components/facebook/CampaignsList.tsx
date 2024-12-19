import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchCampaigns } from "@/lib/facebook/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TrendingUp, TrendingDown, DollarSign, AlertTriangle } from "lucide-react";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { addDays } from "date-fns";
import { DateRange } from "react-day-picker";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useMetricsStore } from "@/stores/metricsStore";
import type { Metric } from "@/components/facebook/MetricSelector";

export const CampaignsList = () => {
  const selectedMetrics = useMetricsStore(state => state.selectedMetrics);
  
  const [dateRange, setDateRange] = useState<DateRange>({
    from: addDays(new Date(), -30),
    to: new Date(),
  });
  
  const { data: campaigns, isLoading, error } = useQuery({
    queryKey: ['campaigns', selectedMetrics, dateRange?.from, dateRange?.to],
    queryFn: () => fetchCampaigns(selectedMetrics, dateRange),
    enabled: !!dateRange?.from && !!dateRange?.to,
  });

  if (isLoading) return <div>Carregando campanhas...</div>;
  
  if (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro ao carregar campanhas';
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Erro ao carregar campanhas</AlertTitle>
        <AlertDescription className="mt-2">
          {errorMessage}
          {errorMessage.includes('permissões') && (
            <div className="mt-2">
              <p className="font-semibold">Como resolver:</p>
              <ol className="list-decimal ml-4 mt-1">
                <li>Acesse as configurações do seu aplicativo no Facebook Developers</li>
                <li>Verifique se as permissões ads_read, ads_management e read_insights estão ativas</li>
                <li>Gere um novo token de acesso com as permissões necessárias</li>
                <li>Atualize o token de acesso nas configurações da conta</li>
              </ol>
            </div>
          )}
        </AlertDescription>
      </Alert>
    );
  }

  const calculateMetricValue = (campaign: any, metric: Metric) => {
    if (!metric.formula) {
      if (Array.isArray(campaign[metric.field])) {
        return campaign[metric.field][0]?.value || 0;
      }
      return campaign[metric.field];
    }

    try {
      const formula = metric.formula.replace(/[a-zA-Z_]+/g, (match) => {
        return campaign[match] || 0;
      });
      return eval(formula);
    } catch (error) {
      console.error(`Error calculating metric ${metric.name}:`, error);
      return 0;
    }
  };

  const formatMetricValue = (value: any, metric: Metric) => {
    if (typeof value === 'number') {
      if (metric.field === 'spend' || metric.field.includes('cost')) {
        return (
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            {value.toFixed(2)}
          </div>
        );
      }
      if (metric.field.includes('rate') || metric.field === 'ctr' || metric.field === 'website_purchase_roas') {
        return (
          <div className="flex items-center gap-2">
            {value > 1 ? (
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

  return (
    <div className="space-y-4">
      <div className="flex justify-end items-center gap-4">
        <DateRangePicker
          value={dateRange}
          onChange={setDateRange}
        />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            {selectedMetrics.map((metric) => (
              <TableHead key={metric.id}>{metric.name}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {campaigns?.map((campaign: any) => (
            <TableRow key={campaign.id}>
              {selectedMetrics.map((metric) => (
                <TableCell key={`${campaign.id}-${metric.id}`}>
                  {formatMetricValue(calculateMetricValue(campaign, metric), metric)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};