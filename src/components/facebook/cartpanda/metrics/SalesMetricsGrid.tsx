import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, ShoppingCart, CreditCard } from "lucide-react";
import type { SalesMetrics } from "../types";

interface SalesMetricsGridProps {
  totalSales: number;
  totalRevenue: number;
  averageTicket: number;
  salesByPlatform: Record<string, number>;
  paymentMethodStats: Record<string, number>;
}

export const SalesMetricsGrid = ({
  totalSales,
  totalRevenue,
  averageTicket,
  salesByPlatform,
  paymentMethodStats,
}: SalesMetricsGridProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Vendas</CardTitle>
          <ShoppingCart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalSales}</div>
          <div className="text-xs text-muted-foreground mt-1">
            {Object.entries(salesByPlatform).map(([platform, count]) => (
              <div key={platform} className="capitalize">{platform}: {count}</div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            R$ {totalRevenue.toFixed(2)}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Ticket Médio: R$ {averageTicket.toFixed(2)}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Métodos de Pagamento</CardTitle>
          <CreditCard className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {Object.entries(paymentMethodStats).map(([method, count]) => (
              <div key={method} className="flex justify-between items-center text-sm">
                <span className="capitalize">{method || 'Outros'}</span>
                <span className="font-medium">{count}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};