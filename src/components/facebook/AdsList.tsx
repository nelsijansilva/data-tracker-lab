import React from "react";
import { DateRange } from "react-day-picker";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Layers } from "lucide-react";
import { useMetricsStore } from "@/stores/metricsStore";
import { useAdSetStore } from "@/stores/adSetStore";
import { useAds } from "@/hooks/useAds";
import { MetricValue } from "@/components/facebook/MetricValue";

interface AdsListProps {
  dateRange: DateRange;
  selectedAccountId?: string;
}

export const AdsList = ({ dateRange, selectedAccountId }: AdsListProps) => {
  const selectedMetrics = useMetricsStore(state => state.selectedMetrics);
  const { selectedAdSetId } = useAdSetStore();
  const [selectedAdId, setSelectedAdId] = React.useState<string | null>(null);

  const { data: ads, isLoading, error } = useAds(selectedMetrics, dateRange, selectedAccountId, selectedAdSetId);

  if (isLoading) return <div className="text-gray-400">Carregando anúncios...</div>;
  
  if (error) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          {error instanceof Error ? error.message : 'Erro ao carregar anúncios'}
        </AlertDescription>
      </Alert>
    );
  }

  if (!ads?.length) {
    return (
      <div className="text-center py-8 text-gray-400">
        <Layers className="mx-auto h-12 w-12 mb-4" />
        <p>Nenhum anúncio encontrado no período selecionado.</p>
        <p className="text-sm mt-2">Tente ajustar o período de datas ou selecione outro conjunto de anúncios.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
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
          {ads.map((ad: any) => (
            <TableRow 
              key={ad.id}
              className={`cursor-pointer transition-colors border-gray-700 ${
                selectedAdId === ad.id 
                  ? "bg-[#3b82f6]/10" 
                  : "hover:bg-[#2f3850]"
              }`}
              onClick={() => setSelectedAdId(ad.id === selectedAdId ? null : ad.id)}
            >
              {selectedMetrics.map((metric) => (
                <TableCell key={metric.id} className="text-gray-400">
                  <MetricValue value={ad[metric.field]} metric={metric} />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};