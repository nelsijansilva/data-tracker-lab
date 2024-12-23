import { useQuery } from "@tanstack/react-query";
import { DateRange } from "react-day-picker";
import type { Metric } from "@/components/facebook/MetricSelector";
import { fetchAdSets } from "@/lib/facebook/api";
import { useCampaignStore } from "@/stores/campaignStore";

export const useAdSets = (
  selectedMetrics: Metric[], 
  dateRange: DateRange,
  selectedAccountId?: string,
) => {
  const { selectedCampaignId } = useCampaignStore();

  return useQuery({
    queryKey: ['adSets', selectedMetrics, dateRange?.from, dateRange?.to, selectedAccountId, selectedCampaignId],
    queryFn: () => fetchAdSets(selectedCampaignId, selectedMetrics, dateRange),
    enabled: !!dateRange?.from && !!dateRange?.to && selectedMetrics.length > 0 && !!selectedCampaignId,
  });
};