import React, { useEffect } from "react";
import { DateRange } from "react-day-picker";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from "@/components/ui/table";
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

  useEffect(() => {
    initializeDefaultMetrics();
  }, [initializeDefaultMetrics]);

  const { data: campaigns, isLoading, error } = useCampaigns(selectedMetrics, dateRange, selectedAccountId);

  const handleRowClick = (campaignId: string) => {
    const currentTime = new Date().getTime();
    const timeDiff = currentTime - lastClickTime;
    
    if (timeDiff < 300) { // Double click detected (within 300ms)
      setSelectedCampaignId(campaignId);
      onTabChange?.('adsets'); // Navigate to adsets tab
    } else {
      setSelectedCampaignId(campaignId === selectedCampaignId ? null : campaignId);
    }
    
    setLastClickTime(currentTime);
  };

  const calculateTotals = (campaigns: any[]) => {
    return selectedMetrics.reduce((acc: any, metric) => {
      if (metric.field === 'name') {
        acc[metric.field] = `Total (${campaigns.length})`;
      } else {
        acc[metric.field] = campaigns.reduce((sum: number, campaign: any) => {
          const value = parseFloat(campaign[metric.field]) || 0;
          return sum + value;
        }, 0);
      }
      return acc;
    }, {});
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

  const totals = calculateTotals(filteredCampaigns);

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
          {filteredCampaigns?.map((campaign: any) => (
            <TableRow 
              key={campaign.id}
              className={cn(
                "cursor-pointer transition-colors border-b border-primary/20",
                selectedCampaignId === campaign.id 
                  ? "bg-[#3b82f6]/10" 
                  : "hover:bg-[#2f3850]"
              )}
              onClick={() => handleRowClick(campaign.id)}
            >
              {selectedMetrics.map((metric, index) => (
                <TableCell 
                  key={metric.id} 
                  className={cn(
                    "text-gray-400",
                    index !== selectedMetrics.length - 1 && "border-r border-primary/20"
                  )}
                >
                  <MetricValue value={campaign[metric.field]} metric={metric} />
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