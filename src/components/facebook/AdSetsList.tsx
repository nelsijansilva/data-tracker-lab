import React from "react";
import { DateRange } from "react-day-picker";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Layers } from "lucide-react";
import { useMetricsStore } from "@/stores/metricsStore";
import { useCampaignStore } from "@/stores/campaignStore";
import { useAdSetStore } from "@/stores/adSetStore";
import { useAdSets } from "@/hooks/useAdSets";
import { MetricValue } from "@/components/facebook/MetricValue";
import { cn } from "@/lib/utils";

interface AdSetsListProps {
  dateRange: DateRange;
  selectedAccountId?: string;
  onTabChange?: (value: string) => void;
}

// Métricas que devem usar média ao invés de soma
const AVERAGE_METRICS = ['ctr', 'cpm', 'cpc', 'unique_ctr', 'total_ctr', 'frequency', 'unique_cpc'];

export const AdSetsList = ({ dateRange, selectedAccountId, onTabChange }: AdSetsListProps) => {
  const selectedMetrics = useMetricsStore(state => state.selectedMetrics);
  const { selectedCampaignId } = useCampaignStore();
  const { selectedAdSetId, setSelectedAdSetId } = useAdSetStore();
  const [lastClickTime, setLastClickTime] = React.useState<number>(0);

  const { data: adSets, isLoading, error } = useAdSets(selectedMetrics, dateRange, selectedAccountId, selectedCampaignId);

  const handleRowClick = (adSetId: string) => {
    const currentTime = new Date().getTime();
    const timeDiff = currentTime - lastClickTime;
    
    if (timeDiff < 300) { // Double click detected (within 300ms)
      setSelectedAdSetId(adSetId);
      onTabChange?.('ads'); // Navigate to ads tab
    } else {
      setSelectedAdSetId(adSetId === selectedAdSetId ? null : adSetId);
    }
    
    setLastClickTime(currentTime);
  };

  const calculateTotals = (adSets: any[]) => {
    return selectedMetrics.reduce((acc: any, metric) => {
      if (metric.field === 'name') {
        acc[metric.field] = `Total (${adSets.length})`;
      } else {
        // Verifica se a métrica deve usar média
        const shouldUseAverage = AVERAGE_METRICS.includes(metric.field.toLowerCase());
        
        if (shouldUseAverage) {
          // Calcula a média excluindo valores nulos, undefined ou zero
          const validValues = adSets
            .map(adSet => {
              const value = parseFloat(adSet[metric.field]);
              return !isNaN(value) && value !== 0 ? value : null;
            })
            .filter((value): value is number => value !== null);
            
          acc[metric.field] = validValues.length > 0
            ? validValues.reduce((sum, value) => sum + value, 0) / validValues.length
            : 0;
        } else {
          // Soma normal para outras métricas
          acc[metric.field] = adSets.reduce((sum: number, adSet: any) => {
            const value = parseFloat(adSet[metric.field]) || 0;
            return sum + value;
          }, 0);
        }
      }
      return acc;
    }, {});
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

  const totals = calculateTotals(adSets);

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow className="border-b-2 border-primary/50">
            {selectedMetrics.map((metric, index) => (
              <TableHead 
                key={metric.id} 
                className={cn(
                  "text-gray-400",
                  index !== selectedMetrics.length - 1 && "border-r border-primary/20"
                )}
              >
                {metric.name.toUpperCase()}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {adSets.map((adSet: any) => (
            <TableRow 
              key={adSet.id}
              className={cn(
                "cursor-pointer transition-colors border-b border-primary/20",
                selectedAdSetId === adSet.id 
                  ? "bg-[#3b82f6]/10" 
                  : "hover:bg-[#2f3850]"
              )}
              onClick={() => handleRowClick(adSet.id)}
            >
              {selectedMetrics.map((metric, index) => (
                <TableCell 
                  key={metric.id} 
                  className={cn(
                    "text-gray-400",
                    index !== selectedMetrics.length - 1 && "border-r border-primary/20"
                  )}
                >
                  <MetricValue value={adSet[metric.field]} metric={metric} />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow className="border-t-2 border-primary/50 font-semibold">
            {selectedMetrics.map((metric, index) => (
              <TableCell 
                key={metric.id} 
                className={cn(
                  "text-primary",
                  index !== selectedMetrics.length - 1 && "border-r border-primary/20"
                )}
              >
                <MetricValue value={totals[metric.field]} metric={metric} />
              </TableCell>
            ))}
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
};