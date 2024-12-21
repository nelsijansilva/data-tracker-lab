import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { UnifiedSale } from "../types";

interface SalesTableProps {
  sales: UnifiedSale[];
}

export const SalesTable = ({ sales }: SalesTableProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow className="border-gray-700">
          <TableHead className="text-gray-400">ID do Pedido</TableHead>
          <TableHead className="text-gray-400">Plataforma</TableHead>
          <TableHead className="text-gray-400">Cliente</TableHead>
          <TableHead className="text-gray-400">Valor</TableHead>
          <TableHead className="text-gray-400">Status</TableHead>
          <TableHead className="text-gray-400">Pagamento</TableHead>
          <TableHead className="text-gray-400">Data</TableHead>
          <TableHead className="text-gray-400">UTM Source</TableHead>
          <TableHead className="text-gray-400">UTM Medium</TableHead>
          <TableHead className="text-gray-400">UTM Campaign</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sales?.map((sale) => (
          <TableRow key={sale.id} className="border-gray-700">
            <TableCell className="text-gray-400">#{sale.order_id}</TableCell>
            <TableCell className="text-gray-400">
              <span className="capitalize">{sale.platform}</span>
            </TableCell>
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
            <TableCell className="text-gray-400">
              {sale.utm_source || 'N/A'}
            </TableCell>
            <TableCell className="text-gray-400">
              {sale.utm_medium || 'N/A'}
            </TableCell>
            <TableCell className="text-gray-400">
              {sale.utm_campaign || 'N/A'}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};