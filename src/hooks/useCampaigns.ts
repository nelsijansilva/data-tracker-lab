import { useQuery } from "@tanstack/react-query";
import { fetchCampaigns } from "@/lib/facebook/api";
import { DateRange } from "react-day-picker";
import type { Metric } from "@/components/facebook/MetricSelector";

export interface Campaign {
  id: string;
  campaign_id: string;
  name: string;
  status: string;
  objective?: string;
  spend?: number;
  impressions?: number;
  clicks?: number;
  [key: string]: any;
}

export const useCampaigns = (
  selectedMetrics: Metric[], 
  dateRange: DateRange,
  selectedAccountId?: string
) => {
  return useQuery({
    queryKey: ['campaigns', selectedMetrics, dateRange?.from, dateRange?.to, selectedAccountId],
    queryFn: () => fetchCampaigns(selectedMetrics, dateRange, selectedAccountId),
    enabled: !!dateRange?.from && !!dateRange?.to && selectedMetrics.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutos
    refetchOnWindowFocus: false,
  });
};