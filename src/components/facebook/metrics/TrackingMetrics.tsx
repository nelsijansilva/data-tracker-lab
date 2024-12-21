import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link2, Globe, Target } from "lucide-react";

interface Sale {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
}

interface TrackingMetricsProps {
  sales: Sale[];
}

export const TrackingMetrics = ({ sales }: TrackingMetricsProps) => {
  // Agrupa vendas por UTM source com tipagem segura
  const utmSourceStats = sales?.reduce((acc: Record<string, number>, sale) => {
    const source = sale.utm_source || 'Não Informado';
    acc[source] = (acc[source] || 0) + 1;
    return acc;
  }, {});

  // Agrupa vendas por UTM medium com tipagem segura
  const utmMediumStats = sales?.reduce((acc: Record<string, number>, sale) => {
    const medium = sale.utm_medium || 'Não Informado';
    acc[medium] = (acc[medium] || 0) + 1;
    return acc;
  }, {});

  // Agrupa vendas por UTM campaign com tipagem segura
  const utmCampaignStats = sales?.reduce((acc: Record<string, number>, sale) => {
    const campaign = sale.utm_campaign || 'Não Informado';
    acc[campaign] = (acc[campaign] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            UTM Source
          </CardTitle>
          <Globe className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {Object.entries(utmSourceStats || {}).map(([source, count]) => (
            <div key={source} className="flex justify-between items-center mt-2">
              <span className="text-sm text-muted-foreground">{source}</span>
              <span className="text-sm font-medium">{String(count)}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            UTM Medium
          </CardTitle>
          <Link2 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {Object.entries(utmMediumStats || {}).map(([medium, count]) => (
            <div key={medium} className="flex justify-between items-center mt-2">
              <span className="text-sm text-muted-foreground">{medium}</span>
              <span className="text-sm font-medium">{String(count)}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            UTM Campaign
          </CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {Object.entries(utmCampaignStats || {}).map(([campaign, count]) => (
            <div key={campaign} className="flex justify-between items-center mt-2">
              <span className="text-sm text-muted-foreground">{campaign}</span>
              <span className="text-sm font-medium">{String(count)}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};