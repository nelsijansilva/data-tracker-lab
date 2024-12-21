import React from "react";
import { DateRange } from "react-day-picker";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Layers } from "lucide-react";
import { useMetricsStore } from "@/stores/metricsStore";
import { useAdSetStore } from "@/stores/adSetStore";
import { useAds } from "@/hooks/useAds";
import { MetricValue } from "@/components/facebook/MetricValue";
import { AdDetails } from "@/components/facebook/AdDetails";

interface AdsListProps {
  dateRange: DateRange;
  selectedAccountId?: string;
}

export const AdsList = ({ dateRange, selectedAccountId }: AdsListProps) => {
  const selectedMetrics = useMetricsStore(state => state.selectedMetrics);
  const { selectedAdSetId } = useAdSetStore();
  const [selectedAdId, setSelectedAdId] = React.useState<string | null>(null);

  const { data: ads, isLoading, error } = useAds(selectedMetrics, dateRange, selectedAccountId, selectedAdSetId);

  const handleRowClick = (ad: any) => {
    setSelectedAdId(ad.id === selectedAdId ? null : ad.id);
  };

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

  // Calcular totais
  const totals = selectedMetrics.reduce((acc, metric) => {
    acc[metric.field] = ads?.reduce((sum, ad) => {
      const value = parseFloat(ad[metric.field]) || 0;
      return sum + value;
    }, 0);
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="table-container">
      <Table>
        <TableHeader className="table-header">
          <TableRow className="border-gray-700">
            {selectedMetrics.map((metric) => (
              <TableHead 
                key={metric.id} 
                className="text-gray-400 border-r border-gray-700 last:border-r-0 whitespace-nowrap px-4 py-3"
              >
                {metric.name}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <div className="table-content">
          <TableBody>
            {ads?.map((ad: any) => (
              <TableRow 
                key={ad.id}
                className={`cursor-pointer transition-colors border-gray-700 ${
                  selectedAdId === ad.id 
                    ? "bg-[#3b82f6]/10" 
                    : "hover:bg-[#2f3850]"
                }`}
                onClick={() => handleRowClick(ad)}
              >
                {selectedMetrics.map((metric) => (
                  <TableCell 
                    key={metric.id} 
                    className="text-gray-400 border-r border-gray-700 last:border-r-0"
                  >
                    <MetricValue value={ad[metric.field]} metric={metric} />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </div>
        <TableRow className="table-footer">
          {selectedMetrics.map((metric) => (
            <TableCell 
              key={metric.id} 
              className="text-gray-300 border-r border-gray-700 last:border-r-0"
            >
              <div className="metric-total-label">{metric.name} Total</div>
              <div className="metric-total-value">
                <MetricValue value={totals[metric.field]} metric={metric} />
              </div>
            </TableCell>
          ))}
        </TableRow>
      </Table>
    </div>
  );
};