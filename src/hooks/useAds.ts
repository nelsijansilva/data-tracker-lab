import { useQuery } from "@tanstack/react-query";
import { DateRange } from "react-day-picker";
import type { Metric } from "@/components/facebook/MetricSelector";
import { fetchAds } from "@/lib/facebook/api";

export const useAds = (
  selectedMetrics: Metric[], 
  dateRange: DateRange,
  selectedAccountId?: string,
  adSetId?: string | null
) => {
  return useQuery({
    queryKey: ['ads', selectedMetrics, dateRange?.from, dateRange?.to, selectedAccountId, adSetId],
    queryFn: () => fetchAds(adSetId, selectedMetrics, dateRange),
    enabled: !!dateRange?.from && !!dateRange?.to && selectedMetrics.length > 0,
  });
};