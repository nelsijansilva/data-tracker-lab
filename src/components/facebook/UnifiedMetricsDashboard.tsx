import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DateRange } from "react-day-picker";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  AlertTriangle, 
  DollarSign, 
  ShoppingCart, 
  TrendingUp,
  CreditCard,
  Clock,
  RefreshCcw,
  PieChart,
  BarChart3,
  Percent
} from "lucide-react";
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
  const totalSpent = campaigns?.reduce((acc, campaign) => acc + (Number(campaign.spend) || 0), 0) || 0;
  const totalSales = sales?.length || 0;
  const totalRevenue = sales?.reduce((acc, sale) => acc + (Number(sale.total_amount) || 0), 0) || 0;
  const roas = totalSpent > 0 ? (totalRevenue / totalSpent) : 0;
  const profit = totalRevenue - totalSpent;
  
  // Calculate payment methods distribution
  const paymentMethods = sales?.reduce((acc: Record<string, number>, sale) => {
    const method = sale.payment_method || 'outros';
    acc[method] = (acc[method] || 0) + 1;
    return acc;
  }, {}) || {};

  // Calculate refund rate
  const refundedSales = sales?.filter(sale => sale.status === 'refunded').length || 0;
  const refundRate = totalSales > 0 ? (refundedSales / totalSales) * 100 : 0;

  // Calculate approval rate
  const approvedSales = sales?.filter(sale => sale.payment_status === 'paid').length || 0;
  const approvalRate = totalSales > 0 ? (approvedSales / totalSales) * 100 : 0;

  if (isLoadingCampaigns || isLoadingSales) {
    return <div className="text-gray-400">Carregando métricas...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Revenue Card */}
        <Card className="bg-[#2a2f3d] border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Faturamento Total</CardTitle>
            <DollarSign className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">R$ {totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-gray-400 mt-1">{totalSales} vendas realizadas</p>
          </CardContent>
        </Card>

        {/* Ad Spend Card */}
        <Card className="bg-[#2a2f3d] border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Gastos com Anúncios</CardTitle>
            <BarChart3 className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">R$ {totalSpent.toFixed(2)}</div>
          </CardContent>
        </Card>

        {/* ROAS Card */}
        <Card className="bg-[#2a2f3d] border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">ROAS</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{roas.toFixed(2)}x</div>
            <p className="text-xs text-gray-400 mt-1">Retorno sobre investimento</p>
          </CardContent>
        </Card>

        {/* Profit Card */}
        <Card className="bg-[#2a2f3d] border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Lucro</CardTitle>
            <PieChart className="h-4 w-4 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              R$ {profit.toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Pending Sales Card */}
        <Card className="bg-[#2a2f3d] border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Vendas Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {sales?.filter(sale => sale.payment_status === 'pending').length || 0}
            </div>
          </CardContent>
        </Card>

        {/* Refund Rate Card */}
        <Card className="bg-[#2a2f3d] border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Taxa de Reembolso</CardTitle>
            <RefreshCcw className="h-4 w-4 text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{refundRate.toFixed(1)}%</div>
            <p className="text-xs text-gray-400 mt-1">{refundedSales} reembolsos</p>
          </CardContent>
        </Card>

        {/* Approval Rate Card */}
        <Card className="bg-[#2a2f3d] border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Taxa de Aprovação</CardTitle>
            <Percent className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{approvalRate.toFixed(1)}%</div>
            <p className="text-xs text-gray-400 mt-1">{approvedSales} aprovadas</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Payment Methods Card */}
        <Card className="bg-[#2a2f3d] border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Vendas por Método de Pagamento</CardTitle>
            <CreditCard className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(paymentMethods).map(([method, count]) => (
                <div key={method} className="flex justify-between items-center">
                  <span className="text-gray-300 capitalize">{method}</span>
                  <span className="text-white font-medium">{count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Sales Status Card */}
        <Card className="bg-[#2a2f3d] border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Status das Vendas</CardTitle>
            <ShoppingCart className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Aprovadas</span>
                <span className="text-green-400 font-medium">{approvedSales}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Pendentes</span>
                <span className="text-yellow-400 font-medium">
                  {sales?.filter(sale => sale.payment_status === 'pending').length || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Reembolsadas</span>
                <span className="text-red-400 font-medium">{refundedSales}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};