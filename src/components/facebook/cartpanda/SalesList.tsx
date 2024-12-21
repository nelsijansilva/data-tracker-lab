import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SalesMetricsGrid } from "./metrics/SalesMetricsGrid";
import { SalesStatusCard } from "./metrics/SalesStatusCard";
import { SalesTable } from "./tables/SalesTable";
import { SalesFilters } from "./filters/SalesFilters";
import { TrackingMetrics } from "../metrics/TrackingMetrics";
import type { UnifiedSale } from "./types";
import { DateRange } from "react-day-picker";
import { startOfDay, endOfDay } from "date-fns";

export const SalesList = () => {
  const [nameFilter, setNameFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [accountFilter, setAccountFilter] = useState("all");

  // Fetch sales data
  const { data: sales, isLoading: isLoadingSales } = useQuery({
    queryKey: ['unified-sales', nameFilter, statusFilter, dateRange, accountFilter],
    queryFn: async () => {
      let query = supabase
        .from('unified_sales')
        .select('*')
        .order('created_at', { ascending: false });

      if (nameFilter) {
        query = query.ilike('customer_name', `%${nameFilter}%`);
      }

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      if (dateRange?.from) {
        query = query.gte('created_at', startOfDay(dateRange.from).toISOString());
      }

      if (dateRange?.to) {
        query = query.lte('created_at', endOfDay(dateRange.to).toISOString());
      }

      if (accountFilter !== 'all') {
        query = query.eq('platform_account_id', accountFilter);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as UnifiedSale[];
    }
  });

  // Fetch accounts data
  const { data: accounts } = useQuery({
    queryKey: ['sales-accounts'],
    queryFn: async () => {
      const cartpandaAccounts = await supabase
        .from('cartpanda_accounts')
        .select('id, account_name')
        .then(({ data }) => data?.map(acc => ({ ...acc, platform: 'cartpanda' })) || []);

      const tictoAccounts = await supabase
        .from('ticto_accounts')
        .select('id, account_name')
        .then(({ data }) => data?.map(acc => ({ ...acc, platform: 'ticto' })) || []);

      return [...cartpandaAccounts, ...tictoAccounts];
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

  if (isLoadingSales) return <div className="text-gray-400">Carregando vendas...</div>;

  return (
    <div className="space-y-6">
      <SalesFilters
        nameFilter={nameFilter}
        setNameFilter={setNameFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        dateRange={dateRange}
        setDateRange={setDateRange}
        accountFilter={accountFilter}
        setAccountFilter={setAccountFilter}
        accounts={accounts || []}
      />

      <SalesMetricsGrid
        totalSales={totalSales}
        totalRevenue={totalRevenue}
        averageTicket={averageTicket}
        salesByPlatform={salesByPlatform}
        paymentMethodStats={paymentMethodStats}
      />

      <TrackingMetrics sales={sales || []} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <SalesStatusCard salesStatus={salesStatus} />
      </div>

      <SalesTable sales={sales || []} />
    </div>
  );
};