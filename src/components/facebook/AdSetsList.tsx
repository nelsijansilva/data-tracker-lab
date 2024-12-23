import React from "react";
import { DateRange } from "react-day-picker";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Layers } from "lucide-react";
import { useMetricsStore } from "@/stores/metricsStore";
import { useAdSetStore } from "@/stores/adSetStore";
import { useCampaignStore } from "@/stores/campaignStore";
import { useAdSets } from "@/hooks/useAdSets";
import { MetricsTable } from "./MetricsTable";

interface AdSetsListProps {
  dateRange: DateRange;
  selectedAccountId?: string;
  onTabChange?: (value: string) => void;
}

export const AdSetsList = ({ 
  dateRange, 
  selectedAccountId, 
  onTabChange 
}: AdSetsListProps) => {
  const selectedMetrics = useMetricsStore(state => state.selectedMetrics);
  const { selectedAdSetId, setSelectedAdSetId } = useAdSetStore();
  const { selectedCampaignId } = useCampaignStore();
  const [lastClickTime, setLastClickTime] = React.useState<number>(0);

  const { data: adSets, isLoading, error } = useAdSets(selectedMetrics, dateRange, selectedAccountId);

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

  if (!selectedCampaignId) {
    return (
      <div className="text-center py-8 text-gray-400">
        <Layers className="mx-auto h-12 w-12 mb-4" />
        <p>Selecione uma campanha para ver seus conjuntos de anúncios.</p>
      </div>
    );
  }

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
        <p>Nenhum conjunto de anúncios encontrado para esta campanha no período selecionado.</p>
        <p className="text-sm mt-2">Tente ajustar o período de datas ou selecione outra campanha.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <MetricsTable
        data={adSets}
        metrics={selectedMetrics}
        onRowClick={handleRowClick}
        selectedId={selectedAdSetId}
        getRowId={(adSet) => adSet.id}
      />
    </div>
  );
};