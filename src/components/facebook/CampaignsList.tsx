import React, { useEffect } from "react";
import { DateRange } from "react-day-picker";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { useMetricsStore } from "@/stores/metricsStore";
import { useCampaignStore } from "@/stores/campaignStore";
import { useCampaigns } from "@/hooks/useCampaigns";
import { MetricsTable } from "./MetricsTable";

interface CampaignsListProps {
  dateRange: DateRange;
  campaignStatus?: 'all' | 'active' | 'paused';
  selectedAccountId?: string;
  onTabChange?: (value: string) => void;
}

export const CampaignsList = ({ 
  dateRange, 
  campaignStatus = 'all', 
  selectedAccountId, 
  onTabChange 
}: CampaignsListProps) => {
  const selectedMetrics = useMetricsStore(state => state.selectedMetrics);
  const initializeDefaultMetrics = useMetricsStore(state => state.initializeDefaultMetrics);
  const { selectedCampaignId, setSelectedCampaignId } = useCampaignStore();
  const [lastClickTime, setLastClickTime] = React.useState<number>(0);

  useEffect(() => {
    initializeDefaultMetrics();
  }, [initializeDefaultMetrics]);

  const { data: campaigns, isLoading, error } = useCampaigns(selectedMetrics, dateRange, selectedAccountId);

  const handleRowClick = (campaignId: string) => {
    const currentTime = new Date().getTime();
    const timeDiff = currentTime - lastClickTime;
    
    if (timeDiff < 300) {
      // Encontrar a campanha selecionada para pegar o campaign_id correto
      const selectedCampaign = campaigns?.find(campaign => campaign.id === campaignId);
      if (selectedCampaign) {
        setSelectedCampaignId(selectedCampaign.campaign_id);
        onTabChange?.('adsets');
      }
    } else {
      setSelectedCampaignId(campaignId === selectedCampaignId ? null : campaignId);
    }
    
    setLastClickTime(currentTime);
  };

  if (isLoading) return <div className="text-gray-400">Carregando campanhas...</div>;
  
  if (error) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          {error instanceof Error ? error.message : 'Erro ao carregar campanhas'}
        </AlertDescription>
      </Alert>
    );
  }

  const filteredCampaigns = campaigns?.filter(campaign => {
    const matchesStatus = campaignStatus === 'all' || campaign.status.toLowerCase() === campaignStatus;
    return matchesStatus;
  });

  if (!filteredCampaigns?.length) {
    return (
      <div className="text-center py-8 text-gray-400">
        <p>Nenhuma campanha encontrada no período selecionado.</p>
        <p className="text-sm mt-2">Por que as campanhas não estão aparecendo?</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <MetricsTable
        data={filteredCampaigns}
        metrics={selectedMetrics}
        onRowClick={handleRowClick}
        selectedId={selectedCampaignId}
        getRowId={(campaign) => campaign.id}
      />
    </div>
  );
};