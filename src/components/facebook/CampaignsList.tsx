import { useQuery } from "@tanstack/react-query";
import { fetchCampaigns } from "@/lib/facebook/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { useState } from "react";
import { MetricSelector, type Metric } from "./MetricSelector";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { addDays } from "date-fns";
import { DateRange } from "react-day-picker";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

export const CampaignsList = () => {
  const [selectedMetrics, setSelectedMetrics] = useState<Metric[]>([
    { id: "name", name: "Nome", field: "name" },
    { id: "status", name: "Status", field: "status" },
    { id: "objective", name: "Objetivo", field: "objective" },
    { id: "spend", name: "Gasto", field: "spend" },
  ]);

  const [dateRange, setDateRange] = useState<DateRange>({
    from: addDays(new Date(), -30),
    to: new Date(),
  });
  
  const { data: campaigns, isLoading, error } = useQuery({
    queryKey: ['campaigns', selectedMetrics, dateRange],
    queryFn: () => fetchCampaigns(selectedMetrics, dateRange)
  });

  if (isLoading) return <div>Carregando campanhas...</div>;
  
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          {error instanceof Error ? error.message : 'Erro ao carregar campanhas'}
        </AlertDescription>
      </Alert>
    );
  }

  const calculateMetricValue = (campaign: any, metric: Metric) => {
    if (!metric.formula) {
      if (Array.isArray(campaign[metric.field])) {
        // Handle array responses (like actions, website_purchase_roas)
        return campaign[metric.field][0]?.value || 0;
      }
      return campaign[metric.field];
    }

    try {
      const formula = metric.formula.replace(/[a-zA-Z_]+/g, (match) => {
        return campaign[match] || 0;
      });
      return eval(formula);
    } catch (error) {
      console.error(`Error calculating metric ${metric.name}:`, error);
      return 0;
    }
  };

  const formatMetricValue = (value: any, metric: Metric) => {
    if (typeof value === 'number') {
      if (metric.field === 'spend' || metric.field.includes('cost')) {
        return (
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            {value.toFixed(2)}
          </div>
        );
      }
      if (metric.field.includes('rate') || metric.field === 'ctr' || metric.field === 'website_purchase_roas') {
        return (
          <div className="flex items-center gap-2">
            {value > 1 ? (
              <TrendingUp className="w-4 h-4 text-green-500" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-500" />
            )}
            {value.toFixed(2)}%
          </div>
        );
      }
      return value.toLocaleString();
    }
    return value;
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-start gap-4">
        <MetricSelector
          selectedMetrics={selectedMetrics}
          onMetricsChange={setSelectedMetrics}
        />
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
            <TableRow key={campaign.id}>
              {selectedMetrics.map((metric) => (
                <TableCell key={`${campaign.id}-${metric.id}`}>
                  {formatMetricValue(calculateMetricValue(campaign, metric), metric)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
