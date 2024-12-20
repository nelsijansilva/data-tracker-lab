import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export const IntegrationsList = () => {
  const { data: integrations, isLoading } = useQuery({
    queryKey: ['integrations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('platform_integrations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  if (isLoading) {
    return <div>Carregando integrações...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Integrações</h2>
        <Button className="bg-blue-500 hover:bg-blue-600">
          <Plus className="w-4 h-4 mr-2" />
          Nova Integração
        </Button>
      </div>

      <div className="grid gap-4">
        {integrations?.map((integration) => (
          <div 
            key={integration.id} 
            className="bg-[#1f2937] p-4 rounded-lg border border-gray-700"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-medium">{integration.name}</h3>
                <p className="text-sm text-gray-400">Plataforma: {integration.platform}</p>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded-full text-xs ${
                  integration.is_active 
                    ? 'bg-green-500/20 text-green-500' 
                    : 'bg-red-500/20 text-red-500'
                }`}>
                  {integration.is_active ? 'Ativo' : 'Inativo'}
                </span>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-400">
                URL do Webhook: {integration.webhook_url}
              </p>
            </div>
          </div>
        ))}

        {integrations?.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            Nenhuma integração configurada
          </div>
        )}
      </div>
    </div>
  );
};