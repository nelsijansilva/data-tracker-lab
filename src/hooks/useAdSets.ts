import { useQuery } from "@tanstack/react-query";
import { DateRange } from "react-day-picker";
import type { Metric } from "@/components/facebook/MetricSelector";
import { fetchAdSets } from "@/lib/facebook/api";

export const useAdSets = (
  selectedMetrics: Metric[], 
  dateRange: DateRange,
  selectedAccountId?: string
) => {
  return useQuery({
    queryKey: ['adSets', selectedMetrics, dateRange?.from, dateRange?.to, selectedAccountId],
    queryFn: () => fetchAdSets(null, selectedMetrics, dateRange),
    enabled: !!dateRange?.from && !!dateRange?.to && selectedMetrics.length > 0,
  });
};