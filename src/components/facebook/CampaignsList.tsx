import { useQuery } from "@tanstack/react-query";
import { fetchCampaigns } from "@/lib/facebook/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { useState } from "react";
import { MetricSelector, type Metric } from "./MetricSelector";

const DEFAULT_METRICS: Metric[] = [
  { id: "name", name: "Nome", field: "name" },
  { id: "status", name: "Status", field: "status" },
  { id: "objective", name: "Objetivo", field: "objective" },
  { id: "spend", name: "Gasto", field: "spend" },
  { id: "impressions", name: "Impressões", field: "impressions" },
  { id: "clicks", name: "Cliques", field: "clicks" },
  { id: "ctr", name: "CTR", field: "ctr", formula: "clicks / impressions * 100" },
];

export const CampaignsList = () => {
  const [selectedMetrics, setSelectedMetrics] = useState<Metric[]>(DEFAULT_METRICS);
  
  const { data: campaigns, isLoading, error } = useQuery({
    queryKey: ['campaigns'],
    queryFn: fetchCampaigns
  });

  if (isLoading) return <div>Carregando campanhas...</div>;
  if (error) return <div>Erro ao carregar campanhas</div>;

  const calculateMetricValue = (campaign: any, metric: Metric) => {
    if (!metric.formula) {
      return campaign[metric.field];
    }

    // Parse and evaluate the formula
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
      if (metric.field === 'spend' || metric.field.includes('cost') || metric.field.includes('cpc') || metric.field.includes('cpm')) {
        return (
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            {value.toFixed(2)}
          </div>
        );
      }
      if (metric.field.includes('rate') || metric.field.includes('ctr')) {
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
      <MetricSelector
        selectedMetrics={selectedMetrics}
        onMetricsChange={setSelectedMetrics}
      />

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