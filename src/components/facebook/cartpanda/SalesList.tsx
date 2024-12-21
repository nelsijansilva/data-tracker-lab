import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, DollarSign, ShoppingCart, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const SalesList = () => {
  const { data: sales, isLoading, error } = useQuery({
    queryKey: ['cartpanda-sales'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cartpanda_orders')
        .select(`
          id,
          order_id,
          status,
          payment_status,
          total_amount,
          currency,
          customer_name,
          payment_method,
          created_at,
          raw_data
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  // Cálculo de métricas
  const totalSales = sales?.length || 0;
  const totalRevenue = sales?.reduce((acc, sale) => acc + (sale.total_amount || 0), 0) || 0;
  const averageTicket = totalSales > 0 ? totalRevenue / totalSales : 0;

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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Vendas</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSales}</div>
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {averageTicket.toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Table>
        <TableHeader>
          <TableRow className="border-gray-700">
            <TableHead className="text-gray-400">ID do Pedido</TableHead>
            <TableHead className="text-gray-400">Cliente</TableHead>
            <TableHead className="text-gray-400">Valor</TableHead>
            <TableHead className="text-gray-400">Status</TableHead>
            <TableHead className="text-gray-400">Pagamento</TableHead>
            <TableHead className="text-gray-400">Data</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sales?.map((sale) => (
            <TableRow key={sale.id} className="border-gray-700">
              <TableCell className="text-gray-400">#{sale.order_id}</TableCell>
              <TableCell className="text-gray-400">{sale.customer_name || 'N/A'}</TableCell>
              <TableCell className="text-gray-400">
                R$ {sale.total_amount?.toFixed(2) || '0.00'}
              </TableCell>
              <TableCell className="text-gray-400">
                <span className={`px-2 py-1 rounded-full text-xs ${
                  sale.status === 'completed' ? 'bg-green-500/20 text-green-500' :
                  sale.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' :
                  'bg-red-500/20 text-red-500'
                }`}>
                  {sale.status}
                </span>
              </TableCell>
              <TableCell className="text-gray-400">
                <span className={`px-2 py-1 rounded-full text-xs ${
                  sale.payment_status === 'paid' ? 'bg-green-500/20 text-green-500' :
                  sale.payment_status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' :
                  'bg-red-500/20 text-red-500'
                }`}>
                  {sale.payment_status}
                </span>
              </TableCell>
              <TableCell className="text-gray-400">
                {new Date(sale.created_at).toLocaleDateString('pt-BR')}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};