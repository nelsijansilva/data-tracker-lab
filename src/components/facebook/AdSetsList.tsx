import React from "react";
import { DateRange } from "react-day-picker";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Layers } from "lucide-react";
import { useMetricsStore } from "@/stores/metricsStore";
import { useCampaignStore } from "@/stores/campaignStore";
import { useAdSetStore } from "@/stores/adSetStore";
import { useAdSets } from "@/hooks/useAdSets";
import { MetricValue } from "@/components/facebook/MetricValue";

interface AdSetsListProps {
  dateRange: DateRange;
  selectedAccountId?: string;
  onTabChange?: (value: string) => void;
}

export const AdSetsList = ({ dateRange, selectedAccountId, onTabChange }: AdSetsListProps) => {
  const selectedMetrics = useMetricsStore(state => state.selectedMetrics);
  const { selectedCampaignId } = useCampaignStore();
  const { selectedAdSetId, setSelectedAdSetId } = useAdSetStore();
  const [lastClickTime, setLastClickTime] = React.useState<number>(0);

  const { data: adSets, isLoading, error } = useAdSets(selectedMetrics, dateRange, selectedAccountId, selectedCampaignId);

  const handleRowClick = (adSetId: string) => {
    const currentTime = new Date().getTime();
    const timeDiff = currentTime - lastClickTime;
    
    if (timeDiff < 300) {
      setSelectedAdSetId(adSetId);
      onTabChange?.('ads');
    } else {
      setSelectedAdSetId(adSetId === selectedAdSetId ? null : adSetId);
    }
    
    setLastClickTime(currentTime);
  };

  if (isLoading) return <div className="text-gray-400">Carregando conjuntos de anúncios...</div>;
  
  if (error) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          {error instanceof Error ? error.message : 'Erro ao carregar conjuntos de anúncios'}
        </AlertDescription>
      </Alert>
    );
  }

  if (!adSets?.length) {
    return (
      <div className="text-center py-8 text-gray-400">
        <Layers className="mx-auto h-12 w-12 mb-4" />
        <p>Nenhum conjunto de anúncios encontrado no período selecionado.</p>
        <p className="text-sm mt-2">Tente ajustar o período de datas ou selecione outra campanha.</p>
      </div>
    );
  }

  // Calcular totais
  const totals = selectedMetrics.reduce((acc, metric) => {
    acc[metric.field] = adSets?.reduce((sum, adSet) => {
      const value = parseFloat(adSet[metric.field]) || 0;
      return sum + value;
    }, 0);
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="relative overflow-hidden border border-gray-700 rounded-lg">
      <div className="max-h-[600px] overflow-auto">
        <Table>
          <TableHeader className="sticky top-0 bg-[#1a1f2e] z-10">
            <TableRow className="border-gray-700">
              {selectedMetrics.map((metric) => (
                <TableHead 
                  key={metric.id} 
                  className="text-gray-400 border-r border-gray-700 last:border-r-0"
                >
                  {metric.name.toUpperCase()}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {adSets?.map((adSet: any) => (
              <TableRow 
                key={adSet.id}
                className={`cursor-pointer transition-colors border-gray-700 ${
                  selectedAdSetId === adSet.id 
                    ? "bg-[#3b82f6]/10" 
                    : "hover:bg-[#2f3850]"
                }`}
                onClick={() => handleRowClick(adSet.id)}
              >
                {selectedMetrics.map((metric) => (
                  <TableCell 
                    key={metric.id} 
                    className="text-gray-400 border-r border-gray-700 last:border-r-0"
                  >
                    <MetricValue value={adSet[metric.field]} metric={metric} />
                  </TableCell>
                ))}
              </TableRow>
            ))}
            {/* Linha de totais dentro da tabela */}
            <TableRow className="bg-[#1a1f2e] border-t-2 border-gray-700 font-medium">
              {selectedMetrics.map((metric) => (
                <TableCell 
                  key={metric.id} 
                  className="text-gray-300 border-r border-gray-700 last:border-r-0"
                >
                  <div className="text-sm text-gray-400 mb-1">{metric.name} Total:</div>
                  <MetricValue value={totals[metric.field]} metric={metric} />
                </TableCell>
              ))}
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
