import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, ShoppingCart, TrendingUp, PieChart } from "lucide-react";

interface RevenueMetricsProps {
  totalRevenue: number;
  totalSales: number;
  totalSpent: number;
  roas: number;
  profit: number;
}

export const RevenueMetrics = ({ totalRevenue, totalSales, totalSpent, roas, profit }: RevenueMetricsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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

      <Card className="bg-[#2a2f3d] border-gray-700">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-300">Gastos com Anúncios</CardTitle>
          <ShoppingCart className="h-4 w-4 text-blue-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">R$ {totalSpent.toFixed(2)}</div>
        </CardContent>
      </Card>

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
  );
};