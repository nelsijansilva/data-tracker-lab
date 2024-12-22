import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { EventCounter } from "@/components/analytics/EventCounter";
import { EventTimeline } from "@/components/analytics/EventTimeline";
import { GeoDistribution } from "@/components/analytics/GeoDistribution";

export default function Analytics() {
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    const fetchEvents = async () => {
      const { data, error } = await supabase
        .from('tracking_events')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching events:', error);
        return;
      }

      setEvents(data || []);
    };

    fetchEvents();
  }, []);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold mb-6">Analytics Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <EventCounter events={events} />
        <EventTimeline events={events} />
        <GeoDistribution events={events} />
      </div>
    </div>
  );
}