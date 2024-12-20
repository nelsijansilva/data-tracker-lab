import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";

export const LogsTab = () => {
  const { data: logs, isLoading } = useQuery({
    queryKey: ['webhook-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('webhook_logs')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-primary animate-pulse">Carregando logs...</div>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[600px] rounded-md border border-gray-700 p-4">
      {logs?.map((log) => (
        <div
          key={log.id}
          className="mb-4 p-4 bg-[#2a2f3d] rounded-lg border border-gray-700"
        >
          <div className="flex justify-between items-start mb-2">
            <span className="text-sm text-gray-400">
              {format(new Date(log.created_at), "dd/MM/yyyy HH:mm:ss")}
            </span>
            <span className={`px-2 py-1 text-xs rounded-full ${
              log.status >= 200 && log.status < 300
                ? 'bg-green-500/20 text-green-400'
                : 'bg-red-500/20 text-red-400'
            }`}>
              Status: {log.status}
            </span>
          </div>
          <div className="text-sm mb-2">
            <span className="text-blue-400">Método:</span> {log.method}
          </div>
          <div className="text-sm mb-2">
            <span className="text-blue-400">URL:</span> {log.url}
          </div>
          <div className="text-sm">
            <span className="text-blue-400">Payload:</span>
            <pre className="mt-2 p-2 bg-[#1a1f2e] rounded overflow-x-auto">
              {JSON.stringify(log.payload, null, 2)}
            </pre>
          </div>
        </div>
      ))}
    </ScrollArea>
  );
};