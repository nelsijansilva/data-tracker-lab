import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { SalesMetricsGrid } from "./metrics/SalesMetricsGrid";
import { SalesStatusCard } from "./metrics/SalesStatusCard";
import { SalesTable } from "./tables/SalesTable";
import type { UnifiedSale } from "./types";

export const SalesList = () => {
  const { data: sales, isLoading, error } = useQuery({
    queryKey: ['unified-sales'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('unified_sales')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as UnifiedSale[];
    }
  });

  // Cálculos de métricas básicas
  const totalSales = sales?.length || 0;
  const totalRevenue = sales?.reduce((acc, sale) => acc + (sale.total_amount || 0), 0) || 0;
  const averageTicket = totalSales > 0 ? totalRevenue / totalSales : 0;

  // Métricas por plataforma
  const salesByPlatform = sales?.reduce((acc, sale) => {
    acc[sale.platform] = (acc[sale.platform] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  // Métricas de pagamento
  const paymentMethodStats = sales?.reduce((acc, sale) => {
    acc[sale.payment_method || 'outros'] = (acc[sale.payment_method || 'outros'] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  // Status das vendas
  const salesStatus = sales?.reduce((acc, sale) => {
    acc[sale.status] = (acc[sale.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  if (isLoading) return <div className="text-gray-400">Carregando vendas...</div>;
  
  if (error) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          {error instanceof Error ? error.message : 'Erro ao carregar vendas'}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <SalesMetricsGrid
        totalSales={totalSales}
        totalRevenue={totalRevenue}
        averageTicket={averageTicket}
        salesByPlatform={salesByPlatform}
        paymentMethodStats={paymentMethodStats}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <SalesStatusCard salesStatus={salesStatus} />
      </div>

      <SalesTable sales={sales || []} />
    </div>
  );
};