import { useQuery } from "@tanstack/react-query";
import { fetchAdSets } from "@/lib/facebook/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DollarSign } from "lucide-react";

export const AdSetsList = () => {
  const { data: adSets, isLoading, error } = useQuery({
    queryKey: ['adSets'],
    queryFn: fetchAdSets
  });

  if (isLoading) return <div>Loading ad sets...</div>;
  if (error) return <div>Error loading ad sets</div>;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Campaign</TableHead>
          <TableHead>Daily Budget</TableHead>
          <TableHead>Lifetime Budget</TableHead>
          <TableHead>Budget Remaining</TableHead>
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