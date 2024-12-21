import React from "react";
import { DateRange } from "react-day-picker";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { useMetricsStore } from "@/stores/metricsStore";
import { useCampaignStore } from "@/stores/campaignStore";
import { useCampaigns } from "@/hooks/useCampaigns";
import { MetricValue } from "@/components/facebook/MetricValue";
import { cn } from "@/lib/utils";

interface CampaignsListProps {
  dateRange: DateRange;
  campaignStatus?: 'all' | 'active' | 'paused';
  selectedAccountId?: string;
  onTabChange?: (value: string) => void;
}

export const CampaignsList = ({ dateRange, campaignStatus = 'all', selectedAccountId, onTabChange }: CampaignsListProps) => {
  const selectedMetrics = useMetricsStore(state => state.selectedMetrics);
  const initializeDefaultMetrics = useMetricsStore(state => state.initializeDefaultMetrics);
  const { selectedCampaignId, setSelectedCampaignId } = useCampaignStore();
  const [lastClickTime, setLastClickTime] = React.useState<number>(0);

  React.useEffect(() => {
    initializeDefaultMetrics();
  }, [initializeDefaultMetrics]);

  const { data: campaigns, isLoading, error } = useCampaigns(selectedMetrics, dateRange, selectedAccountId);

  const handleRowClick = (campaignId: string) => {
    const currentTime = new Date().getTime();
    const timeDiff = currentTime - lastClickTime;
    
    if (timeDiff < 300) {
      setSelectedCampaignId(campaignId);
      onTabChange?.('adsets');
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

  // Calcular totais
  const totals = selectedMetrics.reduce((acc, metric) => {
    acc[metric.field] = campaigns?.reduce((sum, campaign) => {
      const value = parseFloat(campaign[metric.field]) || 0;
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
                className="text-gray-400 border-r border-gray-700 last:border-r-0 whitespace-nowrap"
              >
                {metric.name.toUpperCase()}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <div className="table-content">
          <TableBody>
            {campaigns?.map((campaign: any) => (
              <TableRow 
                key={campaign.id}
                className={cn(
                  "cursor-pointer transition-colors border-gray-700",
                  selectedCampaignId === campaign.id 
                    ? "bg-[#3b82f6]/10" 
                    : "hover:bg-[#2f3850]"
                )}
                onClick={() => handleRowClick(campaign.id)}
              >
                {selectedMetrics.map((metric) => (
                  <TableCell 
                    key={metric.id} 
                    className="text-gray-400 border-r border-gray-700 last:border-r-0"
                  >
                    <MetricValue value={campaign[metric.field]} metric={metric} />
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