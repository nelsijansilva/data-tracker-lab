import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link2, Globe, Target } from "lucide-react";

interface TrackingMetricsProps {
  sales: any[];
}

export const TrackingMetrics = ({ sales }: TrackingMetricsProps) => {
  // Agrupa vendas por UTM source
  const utmSourceStats = sales?.reduce((acc: Record<string, number>, sale) => {
    const source = sale.utm_source || 'Não Informado';
    acc[source] = (acc[source] || 0) + 1;
    return acc;
  }, {});

  // Agrupa vendas por UTM medium
  const utmMediumStats = sales?.reduce((acc: Record<string, number>, sale) => {
    const medium = sale.utm_medium || 'Não Informado';
    acc[medium] = (acc[medium] || 0) + 1;
    return acc;
  }, {});

  // Agrupa vendas por UTM campaign
  const utmCampaignStats = sales?.reduce((acc: Record<string, number>, sale) => {
    const campaign = sale.utm_campaign || 'Não Informado';
    acc[campaign] = (acc[campaign] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="bg-[#2a2f3d] border-gray-700">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-300">Origem (UTM Source)</CardTitle>
          <Link2 className="h-4 w-4 text-blue-400" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Object.entries(utmSourceStats || {}).map(([source, count]) => (
              <div key={source} className="flex justify-between items-center">
                <span className="text-gray-300">{source}</span>
                <span className="text-white font-medium">{count}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-[#2a2f3d] border-gray-700">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-300">Meio (UTM Medium)</CardTitle>
          <Globe className="h-4 w-4 text-purple-400" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Object.entries(utmMediumStats || {}).map(([medium, count]) => (
              <div key={medium} className="flex justify-between items-center">
                <span className="text-gray-300">{medium}</span>
                <span className="text-white font-medium">{count}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-[#2a2f3d] border-gray-700">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-300">Campanha (UTM Campaign)</CardTitle>
          <Target className="h-4 w-4 text-green-400" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Object.entries(utmCampaignStats || {}).map(([campaign, count]) => (
              <div key={campaign} className="flex justify-between items-center">
                <span className="text-gray-300">{campaign}</span>
                <span className="text-white font-medium">{count}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};