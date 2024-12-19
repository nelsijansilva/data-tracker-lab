import React, { useState } from "react";
import { DateRange } from "react-day-picker";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { useMetricsStore } from "@/stores/metricsStore";
import { useCampaigns } from "@/hooks/useCampaigns";
import { MetricValue } from "@/components/facebook/MetricValue";
import { calculateMetricValue } from "@/utils/metricCalculations";
import { CampaignDetails } from "@/components/facebook/CampaignDetails";
import { cn } from "@/lib/utils";

export const CampaignsList = () => {
  const selectedMetrics = useMetricsStore(state => state.selectedMetrics);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  
  const [dateRange] = useState<DateRange>({
    from: new Date(),
    to: new Date(),
  });

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

  if (!campaigns?.length) {
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
            <TableHead className="text-gray-400">STATUS</TableHead>
            <TableHead className="text-gray-400">CAMPANHA</TableHead>
            <TableHead className="text-gray-400">ORÇAMENTO</TableHead>
            <TableHead className="text-gray-400">VENDAS</TableHead>
            <TableHead className="text-gray-400">CPA</TableHead>
            <TableHead className="text-gray-400">GASTOS</TableHead>
            <TableHead className="text-gray-400">FATURAMENTO</TableHead>
            <TableHead className="text-gray-400">LUCRO</TableHead>
            <TableHead className="text-gray-400">ROAS</TableHead>
            <TableHead className="text-gray-400">MARGEM</TableHead>
            <TableHead className="text-gray-400">ROI</TableHead>
            <TableHead className="text-gray-400">IC</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {campaigns?.map((campaign: any) => (
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
                <TableCell className="text-gray-400">{campaign.status}</TableCell>
                <TableCell className="text-gray-400">{campaign.name}</TableCell>
                <TableCell className="text-gray-400">
                  <MetricValue value={campaign.budget} metric={{ field: 'budget' }} />
                </TableCell>
                <TableCell className="text-gray-400">{campaign.sales || 0}</TableCell>
                <TableCell className="text-gray-400">
                  <MetricValue value={campaign.cpa} metric={{ field: 'cpa' }} />
                </TableCell>
                <TableCell className="text-gray-400">
                  <MetricValue value={campaign.spend} metric={{ field: 'spend' }} />
                </TableCell>
                <TableCell className="text-gray-400">
                  <MetricValue value={campaign.revenue} metric={{ field: 'revenue' }} />
                </TableCell>
                <TableCell className="text-gray-400">
                  <MetricValue value={campaign.profit} metric={{ field: 'profit' }} />
                </TableCell>
                <TableCell className="text-gray-400">
                  <MetricValue value={campaign.roas} metric={{ field: 'roas' }} />
                </TableCell>
                <TableCell className="text-gray-400">
                  <MetricValue value={campaign.margin} metric={{ field: 'margin' }} />
                </TableCell>
                <TableCell className="text-gray-400">
                  <MetricValue value={campaign.roi} metric={{ field: 'roi' }} />
                </TableCell>
                <TableCell className="text-gray-400">
                  <MetricValue value={campaign.ic} metric={{ field: 'ic' }} />
                </TableCell>
              </TableRow>
              {selectedCampaignId === campaign.id && (
                <TableRow>
                  <TableCell colSpan={12}>
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