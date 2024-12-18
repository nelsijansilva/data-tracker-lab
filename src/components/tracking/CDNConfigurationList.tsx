import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Trash2, RefreshCw } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CDNStatusIndicator } from "./CDNStatusIndicator";
import type { CDNConfig } from "@/types/tracking";

interface CDNConfigurationListProps {
  configurations: CDNConfig[];
}

export const CDNConfigurationList = ({ configurations }: CDNConfigurationListProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('cdn_configurations')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cdn-configurations'] });
      toast({
        title: "Configuração Removida",
        description: "A configuração do CDN foi removida com sucesso",
      });
    },
    onError: (error) => {
      console.error('Error deleting CDN configuration:', error);
      toast({
        title: "Error",
        description: "Falha ao remover configuração do CDN",
        variant: "destructive",
      });
    }
  });

  const verifyMutation = useMutation({
    mutationFn: async (subdomain: string) => {
      const { data, error } = await supabase.functions.invoke('verify-cdn', {
        body: { url: `https://${subdomain}` }
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: async (response, subdomain) => {
      const { isValid, details } = response;
      
      if (isValid) {
        await supabase
          .from('cdn_configurations')
          .update({ status: 'verified' })
          .eq('subdomain', subdomain);
        
        queryClient.invalidateQueries({ queryKey: ['cdn-configurations'] });
        
        toast({
          title: "Conexão Verificada",
          description: `O domínio ${subdomain} está configurado corretamente e passando pelo Cloudflare.
            ${details.cfRay ? `\nCF-Ray: ${details.cfRay}` : ''}
            ${details.cfCache ? `\nCache Status: ${details.cfCache}` : ''}`,
        });
      } else {
        let errorMessage = `Não foi possível verificar a configuração para ${subdomain}.`;
        
        if (!details.isAccessible) {
          errorMessage += "\nO domínio não está acessível. Verifique se o registro CNAME foi propagado.";
        } else if (!details.isCloudflareEnabled) {
          errorMessage += "\nO domínio está acessível mas não está passando pelo Cloudflare. Verifique se o Proxy está ativado (ícone laranja).";
        }
        
        toast({
          title: "Falha na Verificação",
          description: errorMessage,
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      console.error('Error verifying CDN:', error);
      toast({
        title: "Erro na Verificação",
        description: "Ocorreu um erro ao verificar a configuração do CDN. Por favor, tente novamente.",
        variant: "destructive",
      });
    }
  });

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja deletar esta configuração?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleVerify = (subdomain: string) => {
    verifyMutation.mutate(subdomain);
  };

  return (
    <div className="mt-6 space-y-4">
      <h3 className="font-semibold">Configurações Existentes</h3>
      {configurations.map((config) => (
        <div key={config.id} className="flex items-center justify-between p-3 border rounded">
          <div className="flex flex-col gap-1">
            <span>{config.subdomain}</span>
            <CDNStatusIndicator 
              isVerified={config.status === 'verified'} 
              subdomain={config.subdomain}
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleVerify(config.subdomain)}
              disabled={verifyMutation.isPending}
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${verifyMutation.isPending ? 'animate-spin' : ''}`} />
              Verificar
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleDelete(config.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};