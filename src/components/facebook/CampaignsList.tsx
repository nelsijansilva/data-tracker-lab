import { addDays } from "date-fns";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { useMetricsStore } from "@/stores/metricsStore";
import { useState } from "react";
import { useCampaigns } from "@/hooks/useCampaigns";
import { MetricValue } from "@/components/facebook/MetricValue";
import { calculateMetricValue } from "@/utils/metricCalculations";
import { CampaignDetails } from "@/components/facebook/CampaignDetails";
import { cn } from "@/lib/utils";
import type { DateRange } from "react-day-picker";

export const CampaignsList = () => {
  const selectedMetrics = useMetricsStore(state => state.selectedMetrics);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  
  const [dateRange, setDateRange] = useState<DateRange>({
    from: addDays(new Date(), -30),
    to: new Date(),
  });

  const { data: campaigns, isLoading, error } = useCampaigns(selectedMetrics, dateRange);

  const handleRowClick = (campaignId: string) => {
    setSelectedCampaignId(campaignId === selectedCampaignId ? null : campaignId);
  };

  if (isLoading) return <div>Carregando campanhas...</div>;
  
  if (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro ao carregar campanhas';
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Erro ao carregar campanhas</AlertTitle>
        <AlertDescription className="mt-2">
          {errorMessage}
          {errorMessage.includes('permissões') && (
            <div className="mt-2">
              <p className="font-semibold">Como resolver:</p>
              <ol className="list-decimal ml-4 mt-1">
                <li>Acesse as configurações do seu aplicativo no Facebook Developers</li>
                <li>Verifique se as permissões ads_read, ads_management e read_insights estão ativas</li>
                <li>Gere um novo token de acesso com as permissões necessárias</li>
                <li>Atualize o token de acesso nas configurações da conta</li>
              </ol>
            </div>
          )}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end items-center gap-4">
        <DateRangePicker
          value={dateRange}
          onChange={setDateRange}
        />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            {selectedMetrics.map((metric) => (
              <TableHead key={metric.id}>{metric.name}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {campaigns?.map((campaign: any) => (
            <>
              <TableRow 
                key={campaign.id}
                className={cn(
                  "cursor-pointer transition-colors",
                  selectedCampaignId === campaign.id 
                    ? "bg-primary/10 hover:bg-primary/15" 
                    : "hover:bg-muted/50"
                )}
                onClick={() => handleRowClick(campaign.id)}
              >
                {selectedMetrics.map((metric) => (
                  <TableCell key={`${campaign.id}-${metric.id}`}>
                    <MetricValue 
                      value={calculateMetricValue(campaign, metric)} 
                      metric={metric}
                    />
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
            </>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};