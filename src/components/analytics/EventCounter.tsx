import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";

interface EventCounterProps {
  events: any[];
}

export function EventCounter({ events }: EventCounterProps) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    setCount(events.length);
  }, [events]);

  return (
    <Card className="glass-card animate-fade-up">
      <CardHeader>
        <CardTitle className="text-lg font-medium">Total Events</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-4xl font-bold">{count}</div>
      </CardContent>
    </Card>
  );
}