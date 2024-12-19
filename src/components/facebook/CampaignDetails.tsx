import { useQuery } from "@tanstack/react-query";
import { fetchAdSets } from "@/lib/facebook/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { MetricValue } from "@/components/facebook/MetricValue";
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

  return (
    <div className="p-4 bg-muted/30 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Conjuntos de Anúncios</h3>
      <Table>
        <TableHeader>
          <TableRow className="border-gray-700">
            {selectedMetrics.map((metric) => (
              <TableHead key={metric.id} className="text-gray-400">
                {metric.name.toUpperCase()}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {adSets?.map((adSet: any) => (
            <TableRow key={adSet.id} className="border-gray-700">
              {selectedMetrics.map((metric) => (
                <TableCell key={`${adSet.id}-${metric.id}`} className="text-gray-400">
                  <MetricValue value={adSet[metric.field]} metric={metric} />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};