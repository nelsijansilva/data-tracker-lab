import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DateRange } from "react-day-picker";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, DollarSign, ShoppingCart, TrendingUp } from "lucide-react";
import { useMetricsStore } from "@/stores/metricsStore";
import { useCampaigns } from "@/hooks/useCampaigns";

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
      return data;
    },
    enabled: !!dateRange?.from && !!dateRange?.to
  });

  // Calculate metrics
  const totalSpent = campaigns?.reduce((acc, campaign) => acc + (campaign.spend || 0), 0) || 0;
  const totalSales = sales?.length || 0;
  const totalRevenue = sales?.reduce((acc, sale) => acc + (sale.total_amount || 0), 0) || 0;
  const roas = totalSpent > 0 ? (totalRevenue / totalSpent) : 0;

  if (isLoadingCampaigns || isLoadingSales) {
    return <div className="text-gray-400">Carregando métricas...</div>;
  }

  return (
    <div className="space-y-6">
      <Alert className="bg-[#2a2f3d] border-gray-700">
        <AlertTriangle className="h-4 w-4 text-blue-400" />
        <AlertDescription className="text-gray-300">
          Este dashboard combina dados do Facebook Ads com as vendas reais registradas via webhook para calcular o ROAS real.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-[#2a2f3d] border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Gasto Total (Facebook)</CardTitle>
            <DollarSign className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">R$ {totalSpent.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card className="bg-[#2a2f3d] border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Vendas Reais</CardTitle>
            <ShoppingCart className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {totalSales} vendas
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Receita Total: R$ {totalRevenue.toFixed(2)}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[#2a2f3d] border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">ROAS Real</CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {roas.toFixed(2)}x
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Para cada R$ 1 gasto, R$ {roas.toFixed(2)} em vendas
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};