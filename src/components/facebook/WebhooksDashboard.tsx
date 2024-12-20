import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";

export const WebhooksDashboard = () => {
  const { data: webhookEvents } = useQuery({
    queryKey: ['webhookEvents'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('webhook_events')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const { data: webhookLogs } = useQuery({
    queryKey: ['webhookLogs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('webhook_logs')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Webhooks & Logs</h2>
      </div>

      <Tabs defaultValue="events">
        <TabsList className="bg-[#1f2937]">
          <TabsTrigger value="events">Eventos</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
          <TabsTrigger value="config">Configuração</TabsTrigger>
        </TabsList>

        <TabsContent value="events" className="mt-4">
          <Card className="bg-[#1f2937] border-gray-700">
            <CardHeader>
              <CardTitle>Eventos Recebidos</CardTitle>
              <CardDescription>Lista de eventos webhooks recebidos</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px] pr-4">
                <div className="space-y-4">
                  {webhookEvents?.map((event) => (
                    <Card key={event.id} className="bg-[#2a2f3d] border-gray-700">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">{event.event}</CardTitle>
                            <CardDescription>
                              {format(new Date(event.created_at), 'dd/MM/yyyy HH:mm:ss')}
                            </CardDescription>
                          </div>
                          <Badge variant={event.processed_at ? "success" : "secondary"}>
                            {event.processed_at ? "Processado" : "Pendente"}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <pre className="bg-[#1f2937] p-4 rounded-lg overflow-x-auto">
                          <code>{JSON.stringify(event.value, null, 2)}</code>
                        </pre>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="mt-4">
          <Card className="bg-[#1f2937] border-gray-700">
            <CardHeader>
              <CardTitle>Logs do Sistema</CardTitle>
              <CardDescription>Histórico de requisições e processamento</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px] pr-4">
                <div className="space-y-4">
                  {webhookLogs?.map((log) => (
                    <Card key={log.id} className="bg-[#2a2f3d] border-gray-700">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">{log.source || 'Sistema'}</CardTitle>
                            <CardDescription>
                              {format(new Date(log.created_at), 'dd/MM/yyyy HH:mm:ss')}
                            </CardDescription>
                          </div>
                          <Badge variant={log.status === 'success' ? "success" : "secondary"}>
                            {log.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <h4 className="text-sm font-medium mb-2">Headers</h4>
                            <pre className="bg-[#1f2937] p-4 rounded-lg overflow-x-auto">
                              <code>{JSON.stringify(log.headers, null, 2)}</code>
                            </pre>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium mb-2">Payload</h4>
                            <pre className="bg-[#1f2937] p-4 rounded-lg overflow-x-auto">
                              <code>{JSON.stringify(log.payload, null, 2)}</code>
                            </pre>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="config" className="mt-4">
          <Card className="bg-[#1f2937] border-gray-700">
            <CardHeader>
              <CardTitle>Configuração do Webhook</CardTitle>
              <CardDescription>Informações para configurar seu webhook</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">URL do Webhook</h4>
                  <pre className="bg-[#2a2f3d] p-4 rounded-lg">
                    <code>https://avxgduktxkorwfmccwbs.supabase.co/functions/v1/webhook</code>
                  </pre>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-2">Formato do Payload</h4>
                  <pre className="bg-[#2a2f3d] p-4 rounded-lg">
                    <code>{JSON.stringify({
                      event: "nome_do_evento",
                      value: {
                        // dados do evento
                      }
                    }, null, 2)}</code>
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};