import { useQuery } from "@tanstack/react-query";
import { fetchCampaigns } from "@/lib/facebook/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react";

export const CampaignsList = () => {
  const { data: campaigns, isLoading, error } = useQuery({
    queryKey: ['campaigns'],
    queryFn: fetchCampaigns
  });

  if (isLoading) return <div>Loading campaigns...</div>;
  if (error) return <div>Error loading campaigns</div>;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Objective</TableHead>
          <TableHead>Spend</TableHead>
          <TableHead>Impressions</TableHead>
          <TableHead>Clicks</TableHead>
          <TableHead>CTR</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {campaigns?.map((campaign: any) => {
          const ctr = campaign.clicks && campaign.impressions 
            ? ((campaign.clicks / campaign.impressions) * 100).toFixed(2)
            : '0.00';

          return (
            <TableRow key={campaign.id}>
              <TableCell>{campaign.name}</TableCell>
              <TableCell>{campaign.status}</TableCell>
              <TableCell>{campaign.objective}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  {parseFloat(campaign.spend || 0).toFixed(2)}
                </div>
              </TableCell>
              <TableCell>{campaign.impressions?.toLocaleString()}</TableCell>
              <TableCell>{campaign.clicks?.toLocaleString()}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {parseFloat(ctr) > 1 ? (
                    <TrendingUp className="w-4 h-4 text-green-500" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-500" />
                  )}
                  {ctr}%
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};