import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

interface RevenueMetricsProps {
  totalRevenue: number;
  totalSales: number;
  roas: number;
  profit: number;
  totalSpent: number;
}

export const RevenueMetrics = ({ 
  totalRevenue, 
  totalSales, 
  roas, 
  profit,
  totalSpent 
}: RevenueMetricsProps) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      <Card className="p-4">
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-400">Receita Total</p>
          <p className="text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
        </div>
      </Card>
      <Card className="p-4">
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-400">Total de Vendas</p>
          <p className="text-2xl font-bold">{totalSales}</p>
        </div>
      </Card>
      <Card className="p-4">
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-400">ROAS</p>
          <p className="text-2xl font-bold">
            {roas.toLocaleString('pt-BR', { 
              minimumFractionDigits: 2, 
              maximumFractionDigits: 2 
            })}
          </p>
        </div>
      </Card>
      <Card className="p-4">
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-400">Lucro</p>
          <p className={`text-2xl font-bold ${profit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {formatCurrency(profit)}
          </p>
        </div>
      </Card>
      <Card className="p-4">
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-400">Investimento</p>
          <p className="text-2xl font-bold">{formatCurrency(totalSpent)}</p>
        </div>
      </Card>
    </div>
  );
};