import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package2 } from "lucide-react";

interface SalesStatusCardProps {
  salesStatus: Record<string, number>;
}

export const SalesStatusCard = ({ salesStatus }: SalesStatusCardProps) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Status das Vendas</CardTitle>
        <Package2 className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          {Object.entries(salesStatus).map(([status, count]) => (
            <div key={status} className="flex justify-between items-center text-sm">
              <span className={`px-2 py-1 rounded-full text-xs ${
                status === 'completed' ? 'bg-green-500/20 text-green-500' :
                status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' :
                'bg-red-500/20 text-red-500'
              }`}>
                {status}
              </span>
              <span className="font-medium">{count}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};