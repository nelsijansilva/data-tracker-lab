import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus, Copy } from "lucide-react";
import { IntegrationForm } from "./IntegrationForm";
import { toast } from "@/components/ui/use-toast";

export const IntegrationsList = () => {
  const [showForm, setShowForm] = useState(false);
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

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    toast({
      title: "ID Copiado",
      description: "O ID da integração foi copiado para a área de transferência.",
    });
  };

  if (isLoading) {
    return <div>Carregando integrações...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Integrações</h2>
        <Button 
          className="bg-blue-500 hover:bg-blue-600"
          onClick={() => setShowForm(true)}
        >
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
                <div className="flex items-center mt-2">
                  <p className="text-xs text-gray-500 mr-2">ID: {integration.id}</p>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6"
                    onClick={() => handleCopyId(integration.id)}
                  >
                    <Copy className="h-4 w-4 text-gray-400 hover:text-white" />
                  </Button>
                </div>
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

      <IntegrationForm 
        open={showForm} 
        onClose={() => setShowForm(false)} 
      />
    </div>
  );
};