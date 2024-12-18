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
    
    if (timeDiff < 300) { // Double click detected (within 300ms)
      setSelectedAdSetId(adSetId);
      onTabChange?.('ads'); // Navigate to ads tab
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
          {adSets.map((adSet: any) => (
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
                <TableCell key={metric.id} className="text-gray-400">
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