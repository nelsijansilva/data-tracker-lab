import React, { useEffect } from "react";
import { DateRange } from "react-day-picker";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, HelpCircle } from "lucide-react";
import { useMetricsStore } from "@/stores/metricsStore";
import { useCampaignStore } from "@/stores/campaignStore";
import { useCampaigns } from "@/hooks/useCampaigns";
import { MetricsTable } from "./MetricsTable";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-pulse text-gray-400">Carregando campanhas...</div>
      </div>
    );
  }
  
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
        <div className="flex items-center justify-center gap-2 mt-2">
          <p className="text-sm">Por que as campanhas não estão aparecendo?</p>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <HelpCircle className="h-4 w-4" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Verifique se:</p>
                <ul className="list-disc ml-4 mt-1">
                  <li>O período selecionado está correto</li>
                  <li>A conta do Facebook está conectada</li>
                  <li>Existem campanhas ativas no período</li>
                </ul>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
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