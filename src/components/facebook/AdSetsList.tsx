import { useQuery } from "@tanstack/react-query";
import { fetchAdSets } from "@/lib/facebook/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DollarSign } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { addDays } from "date-fns";
import { useMetricsStore } from "@/stores/metricsStore";

export const AdSetsList = () => {
  const selectedMetrics = useMetricsStore(state => state.selectedMetrics);
  const defaultDateRange = {
    from: addDays(new Date(), -30),
    to: new Date(),
  };

  const { data: adSets, isLoading, error } = useQuery({
    queryKey: ['adSets', selectedMetrics, defaultDateRange?.from, defaultDateRange?.to],
    queryFn: () => fetchAdSets(undefined, selectedMetrics, defaultDateRange),
    enabled: selectedMetrics.length > 0,
  });

  if (isLoading) return <div>Carregando conjuntos de anúncios...</div>;
  
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          {error instanceof Error ? error.message : 'Erro ao carregar conjuntos de anúncios'}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nome</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Campanha</TableHead>
          <TableHead>Orçamento Diário</TableHead>
          <TableHead>Orçamento Total</TableHead>
          <TableHead>Orçamento Restante</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {adSets?.map((adSet: any) => (
          <TableRow key={adSet.id}>
            <TableCell>{adSet.name}</TableCell>
            <TableCell>{adSet.status}</TableCell>
            <TableCell>{adSet.campaign?.name}</TableCell>
            <TableCell>
              {adSet.daily_budget && (
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  {(adSet.daily_budget / 100).toFixed(2)}
                </div>
              )}
            </TableCell>
            <TableCell>
              {adSet.lifetime_budget && (
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  {(adSet.lifetime_budget / 100).toFixed(2)}
                </div>
              )}
            </TableCell>
            <TableCell>
              {adSet.budget_remaining && (
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  {(adSet.budget_remaining / 100).toFixed(2)}
                </div>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};