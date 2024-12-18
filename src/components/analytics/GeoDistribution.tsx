import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { useMemo } from "react";

interface GeoDistributionProps {
  events: any[];
}

export function GeoDistribution({ events }: GeoDistributionProps) {
  const data = useMemo(() => {
    const countryCount = events.reduce((acc: any, event: any) => {
      const country = event.location.country;
      acc[country] = (acc[country] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(countryCount).map(([country, value]) => ({
      name: country,
      value,
    }));
  }, [events]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <Card className="glass-card animate-fade-up">
      <CardHeader>
        <CardTitle className="text-lg font-medium">Geographic Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}