import { useQuery } from "@tanstack/react-query";
import { fetchCampaigns } from "@/lib/facebook/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { useState } from "react";
import { MetricSelector, type Metric } from "./MetricSelector";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { addDays } from "date-fns";

const DEFAULT_METRICS: Metric[] = [
  { id: "name", name: "Nome", field: "name" },
  { id: "status", name: "Status", field: "status" },
  { id: "objective", name: "Objetivo", field: "objective" },
  { id: "spend", name: "Gasto", field: "spend" },
  { id: "impressions", name: "Impressões", field: "impressions" },
  { id: "clicks", name: "Cliques", field: "clicks" },
  { id: "ctr", name: "CTR", field: "ctr", formula: "clicks / impressions * 100" },
  { id: "cpc", name: "CPC", field: "cpc", formula: "spend / clicks" },
  { id: "cpm", name: "CPM", field: "cpm", formula: "spend / impressions * 1000" },
  // Métricas de conversão
  { id: "conversions", name: "Conversões", field: "conversions" },
  { id: "cost_per_conversion", name: "Custo por Conversão", field: "cost_per_conversion" },
  { id: "conversion_rate", name: "Taxa de Conversão", field: "conversion_rate", formula: "conversions / clicks * 100" },
  { id: "conversion_value", name: "Valor de Conversão", field: "conversion_value" },
  { id: "roas", name: "ROAS", field: "roas", formula: "conversion_value / spend" },
  // Métricas de engajamento
  { id: "inline_link_clicks", name: "Cliques no Link", field: "inline_link_clicks" },
  { id: "cost_per_inline_link_click", name: "Custo por Clique no Link", field: "cost_per_inline_link_click" },
];

export const CampaignsList = () => {
  const [selectedMetrics, setSelectedMetrics] = useState<Metric[]>(DEFAULT_METRICS);
  const [dateRange, setDateRange] = useState({
    from: addDays(new Date(), -30),
    to: new Date(),
  });
  
  const { data: campaigns, isLoading, error } = useQuery({
    queryKey: ['campaigns', selectedMetrics, dateRange],
    queryFn: () => fetchCampaigns(selectedMetrics, dateRange)
  });

  if (isLoading) return <div>Carregando campanhas...</div>;
  if (error) return <div>Erro ao carregar campanhas</div>;

  const calculateMetricValue = (campaign: any, metric: Metric) => {
    if (!metric.formula) {
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
      if (metric.field === 'spend' || metric.field.includes('cost') || metric.field.includes('value')) {
        return (
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            {value.toFixed(2)}
          </div>
        );
      }
      if (metric.field.includes('rate') || metric.field.includes('ctr') || metric.field === 'roas') {
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