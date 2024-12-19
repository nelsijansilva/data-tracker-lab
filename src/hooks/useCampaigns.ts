import { useQuery } from "@tanstack/react-query";
import { fetchCampaigns } from "@/lib/facebook/api";
import { DateRange } from "react-day-picker";
import type { Metric } from "@/components/facebook/MetricSelector";

export const useCampaigns = (selectedMetrics: Metric[], dateRange: DateRange) => {
  return useQuery({
    queryKey: ['campaigns', selectedMetrics, dateRange?.from, dateRange?.to],
    queryFn: () => fetchCampaigns(selectedMetrics, dateRange),
    enabled: !!dateRange?.from && !!dateRange?.to && selectedMetrics.length > 0,
  });
};