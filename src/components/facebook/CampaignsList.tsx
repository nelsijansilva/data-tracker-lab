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
}

export const CampaignsList = ({ dateRange }: CampaignsListProps) => {
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

  if (!campaigns?.length) {
    return (
      <div className="text-center py-8 text-gray-400">
        <p>Nenhuma campanha encontrada no período selecionado.</p>
        <p className="text-sm mt-2">Por que as campanhas não estão aparecendo?</p>
      </div>
    );
  }

  const metrics = {
    budget: { id: 'budget', name: 'Orçamento', field: 'budget' },
    sales: { id: 'sales', name: 'Vendas', field: 'sales' },
    cpa: { id: 'cpa', name: 'CPA', field: 'cpa' },
    spend: { id: 'spend', name: 'Gastos', field: 'spend' },
    revenue: { id: 'revenue', name: 'Faturamento', field: 'revenue' },
    profit: { id: 'profit', name: 'Lucro', field: 'profit' },
    roas: { id: 'roas', name: 'ROAS', field: 'roas' },
    margin: { id: 'margin', name: 'Margem', field: 'margin' },
    roi: { id: 'roi', name: 'ROI', field: 'roi' },
    ic: { id: 'ic', name: 'IC', field: 'ic' }
  };

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
                  <MetricValue value={campaign.budget} metric={metrics.budget} />
                </TableCell>
                <TableCell className="text-gray-400">
                  <MetricValue value={campaign.sales} metric={metrics.sales} />
                </TableCell>
                <TableCell className="text-gray-400">
                  <MetricValue value={campaign.cpa} metric={metrics.cpa} />
                </TableCell>
                <TableCell className="text-gray-400">
                  <MetricValue value={campaign.spend} metric={metrics.spend} />
                </TableCell>
                <TableCell className="text-gray-400">
                  <MetricValue value={campaign.revenue} metric={metrics.revenue} />
                </TableCell>
                <TableCell className="text-gray-400">
                  <MetricValue value={campaign.profit} metric={metrics.profit} />
                </TableCell>
                <TableCell className="text-gray-400">
                  <MetricValue value={campaign.roas} metric={metrics.roas} />
                </TableCell>
                <TableCell className="text-gray-400">
                  <MetricValue value={campaign.margin} metric={metrics.margin} />
                </TableCell>
                <TableCell className="text-gray-400">
                  <MetricValue value={campaign.roi} metric={metrics.roi} />
                </TableCell>
                <TableCell className="text-gray-400">
                  <MetricValue value={campaign.ic} metric={metrics.ic} />
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