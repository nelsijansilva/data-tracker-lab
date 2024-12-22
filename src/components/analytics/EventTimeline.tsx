import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useMemo } from "react";

interface EventTimelineProps {
  events: any[];
}

export function EventTimeline({ events }: EventTimelineProps) {
  const data = useMemo(() => {
    const eventsByDay = events.reduce((acc: any, event: any) => {
      const date = new Date(event.timestamp).toLocaleDateString();
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(eventsByDay).map(([date, count]) => ({
      date,
      count,
    }));
  }, [events]);

  return (
    <Card className="glass-card animate-fade-up">
      <CardHeader>
        <CardTitle className="text-lg font-medium">Event Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="count"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}