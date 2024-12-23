import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UnifiedSale } from "@/integrations/supabase/types/sales";
import { ReactNode } from "react";

interface TrackingMetricsProps {
  sales: UnifiedSale[];
}

export const TrackingMetrics = ({ sales }: TrackingMetricsProps) => {
  // Calculate UTM source metrics
  const utmSourceMetrics = sales.reduce((acc: Record<string, number>, sale) => {
    const source = sale.utm_source || 'Não Informado';
    acc[source] = (acc[source] || 0) + 1;
    return acc;
  }, {});

  // Calculate UTM medium metrics
  const utmMediumMetrics = sales.reduce((acc: Record<string, number>, sale) => {
    const medium = sale.utm_medium || 'Não Informado';
    acc[medium] = (acc[medium] || 0) + 1;
    return acc;
  }, {});

  // Calculate UTM campaign metrics
  const utmCampaignMetrics = sales.reduce((acc: Record<string, number>, sale) => {
    const campaign = sale.utm_campaign || 'Não Informado';
    acc[campaign] = (acc[campaign] || 0) + 1;
    return acc;
  }, {});

  const renderMetricItem = (label: string, value: number): ReactNode => (
    <div key={label} className="flex justify-between">
      <span className="text-gray-400">{label}</span>
      <span className="text-gray-400">{value}</span>
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>UTM Source</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Object.entries(utmSourceMetrics).map(([source, count]) => 
              renderMetricItem(source, count)
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>UTM Medium</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Object.entries(utmMediumMetrics).map(([medium, count]) => 
              renderMetricItem(medium, count)
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>UTM Campaign</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Object.entries(utmCampaignMetrics).map(([campaign, count]) => 
              renderMetricItem(campaign, count)
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};