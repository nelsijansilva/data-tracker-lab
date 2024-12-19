import { useQuery } from "@tanstack/react-query";
import { fetchAdSets } from "@/lib/facebook/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { useMetricsStore } from "@/stores/metricsStore";
import { useCampaignStore } from "@/stores/campaignStore";
import { addDays } from "date-fns";
import type { DateRange } from "react-day-picker";
import type { Metric } from "@/components/facebook/MetricSelector";

export const AdSetsList = () => {
  const selectedMetrics = useMetricsStore(state => state.selectedMetrics);
  const selectedCampaignId = useCampaignStore(state => state.selectedCampaignId);
  
  const defaultDateRange: DateRange = {
    from: addDays(new Date(), -30),
    to: new Date(),
  };

  const { data: adSets, isLoading, error } = useQuery({
    queryKey: ['adSets', selectedCampaignId, selectedMetrics, defaultDateRange?.from, defaultDateRange?.to],
    queryFn: () => fetchAdSets(selectedCampaignId, selectedMetrics, defaultDateRange),
    enabled: selectedMetrics.length > 0,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: (failureCount, error: any) => {
      if (error?.message?.includes('User request limit reached')) {
        return false;
      }
      return failureCount < 3;
    },
  });

  if (isLoading) return <div>Carregando conjuntos de anúncios...</div>;
  
  if (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro ao carregar conjuntos de anúncios';
    const isRateLimit = errorMessage.includes('User request limit reached');
    
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          {isRateLimit 
            ? 'Limite de requisições atingido. Por favor, aguarde alguns minutos e tente novamente.'
            : errorMessage
          }
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            {selectedMetrics.map((metric) => (
              <TableHead key={metric.id}>{metric.name}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {adSets?.map((adSet: any) => (
            <TableRow key={adSet.id}>
              {selectedMetrics.map((metric) => (
                <TableCell key={`${adSet.id}-${metric.id}`}>
                  {adSet[metric.field]}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};