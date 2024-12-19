import { useQuery } from "@tanstack/react-query";
import { fetchAdSets } from "@/lib/facebook/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DollarSign } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import type { Metric } from "@/components/facebook/MetricSelector";
import type { DateRange } from "react-day-picker";

interface CampaignDetailsProps {
  campaignId: string;
  dateRange: DateRange;
  selectedMetrics: Metric[];
}

export const CampaignDetails = ({ campaignId, dateRange, selectedMetrics }: CampaignDetailsProps) => {
  const { data: adSets, isLoading, error } = useQuery({
    queryKey: ['adSets', campaignId, selectedMetrics, dateRange?.from, dateRange?.to],
    queryFn: () => fetchAdSets(campaignId, selectedMetrics, dateRange),
    enabled: !!campaignId && !!dateRange?.from && !!dateRange?.to && selectedMetrics.length > 0,
  });

  if (isLoading) return <div className="p-4">Carregando conjuntos de anúncios...</div>;
  
  if (error) {
    return (
      <Alert variant="destructive" className="m-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          {error instanceof Error ? error.message : 'Erro ao carregar conjuntos de anúncios'}
        </AlertDescription>
      </Alert>
    );
  }

  const calculateMetricValue = (adSet: any, metric: Metric) => {
    if (!metric.formula) {
      return adSet[metric.field];
    }

    try {
      const formula = metric.formula.replace(/[a-zA-Z_]+/g, (match) => {
        return adSet[match] || 0;
      });
      return eval(formula);
    } catch (error) {
      console.error(`Error calculating metric ${metric.name}:`, error);
      return 0;
    }
  };

  const formatMetricValue = (value: any, metric: Metric) => {
    if (typeof value === 'number') {
      if (metric.field === 'spend' || metric.field.includes('cost') || 
          metric.field === 'budget_remaining' || metric.field === 'daily_budget' || 
          metric.field === 'lifetime_budget') {
        return (
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            {value.toFixed(2)}
          </div>
        );
      }
      return value.toLocaleString();
    }
    return value;
  };

  return (
    <div className="p-4 bg-muted/30 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Conjuntos de Anúncios</h3>
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
                  {formatMetricValue(calculateMetricValue(adSet, metric), metric)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};