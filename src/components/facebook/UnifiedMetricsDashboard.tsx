import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DateRange } from "react-day-picker";
import { useMetricsStore } from "@/stores/metricsStore";
import { useCampaigns } from "@/hooks/useCampaigns";
import { RevenueMetrics } from "./metrics/RevenueMetrics";

interface UnifiedMetricsDashboardProps {
  dateRange: DateRange;
  selectedAccountId?: string;
}

export const UnifiedMetricsDashboard = ({ dateRange, selectedAccountId }: UnifiedMetricsDashboardProps) => {
  const selectedMetrics = useMetricsStore(state => state.selectedMetrics);
  
  // Fetch Facebook campaign data
  const { data: campaigns, isLoading: isLoadingCampaigns } = useCampaigns(selectedMetrics, dateRange, selectedAccountId);

  // Fetch unified sales data for the same period
  const { data: sales, isLoading: isLoadingSales } = useQuery({
    queryKey: ['unified-sales', dateRange?.from, dateRange?.to],
    queryFn: async () => {
      if (!dateRange?.from || !dateRange?.to) return [];
      
      const { data, error } = await supabase
        .from('unified_sales')
        .select('*')
        .gte('created_at', dateRange.from.toISOString())
        .lte('created_at', dateRange.to.toISOString());

      if (error) throw error;
      return data || [];
    },
    enabled: !!dateRange?.from && !!dateRange?.to
  });

  // Calculate metrics
  const totalSpent = campaigns?.reduce((acc, campaign) => acc + (Number(campaign.spend) || 0), 0) || 0;
  const totalSales = sales?.length || 0;
  const totalRevenue = sales?.reduce((acc, sale) => acc + (Number(sale.total_amount) || 0), 0) || 0;
  const roas = totalSpent > 0 ? (totalRevenue / totalSpent) : 0;
  const profit = totalRevenue - totalSpent;

  if (isLoadingCampaigns || isLoadingSales) {
    return <div className="text-gray-400">Carregando métricas...</div>;
  }

  return (
    <div className="space-y-6">
      <RevenueMetrics 
        totalRevenue={totalRevenue}
        totalSales={totalSales}
        roas={roas}
        profit={profit}
      />
    </div>
  );
};