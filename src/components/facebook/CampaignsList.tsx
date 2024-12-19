import React, { useState } from "react";
import { DateRange } from "react-day-picker";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { useMetricsStore } from "@/stores/metricsStore";
import { useCampaigns } from "@/hooks/useCampaigns";
import { MetricValue } from "@/components/facebook/MetricValue";
import { CampaignDetails } from "@/components/facebook/CampaignDetails";
import { cn } from "@/lib/utils";

interface CampaignsListProps {
  dateRange: DateRange;
  campaignStatus?: 'all' | 'active' | 'paused';
  selectedAccountId?: string;
}

export const CampaignsList = ({ dateRange, campaignStatus = 'all', selectedAccountId }: CampaignsListProps) => {
  const selectedMetrics = useMetricsStore(state => state.selectedMetrics);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);

  const { data: campaigns, isLoading, error } = useCampaigns(selectedMetrics, dateRange);

  const handleRowClick = (campaignId: string) => {
    setSelectedCampaignId(campaignId === selectedCampaignId ? null : campaignId);
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
    // Aqui está a correção: comparamos com o ID da conta do Facebook, não com o UUID do banco
    const matchesAccount = !selectedAccountId || campaign.account_id === selectedAccountId;
    return matchesStatus && matchesAccount;
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
          {filteredCampaigns?.map((campaign: any) => (
            <React.Fragment key={campaign.id}>
              <TableRow 
                className={cn(
                  "cursor-pointer transition-colors border-gray-700",
                  selectedCampaignId === campaign.id 
                    ? "bg-[#3b82f6]/10" 
                    : "hover:bg-[#2f3850]"
                )}
                onClick={() => handleRowClick(campaign.id)}
              >
                {selectedMetrics.map((metric) => (
                  <TableCell key={metric.id} className="text-gray-400">
                    <MetricValue value={campaign[metric.field]} metric={metric} />
                  </TableCell>
                ))}
              </TableRow>
              {selectedCampaignId === campaign.id && (
                <TableRow>
                  <TableCell colSpan={selectedMetrics.length}>
                    <CampaignDetails 
                      campaignId={campaign.id}
                      dateRange={dateRange}
                      selectedMetrics={selectedMetrics}
                    />
                  </TableCell>
                </TableRow>
              )}
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};