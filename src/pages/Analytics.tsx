import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { EventTimeline } from "@/components/analytics/EventTimeline";
import { EventCounter } from "@/components/analytics/EventCounter";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function Analytics() {
  const { data: events, isLoading, error } = useQuery({
    queryKey: ['tracking_events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tracking_requests')
        .select('*')
        .order('timestamp', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    refetchInterval: 30000, // Atualiza a cada 30 segundos
  });

  if (isLoading) {
    return <div>Loading analytics data...</div>;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Error loading analytics data: {error instanceof Error ? error.message : 'Unknown error'}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold mb-6">Analytics Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <EventCounter events={events} />
        <EventTimeline events={events} />
      </div>
    </div>
  );
}