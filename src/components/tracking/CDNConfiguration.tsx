import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Trash2, RefreshCw } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface CDNConfig {
  id: string;
  subdomain: string;
  status: string;
}

export const CDNConfiguration = () => {
  const [subdomain, setSubdomain] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: configurations } = useQuery({
    queryKey: ['cdn-configurations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cdn_configurations')
        .select('*');
      
      if (error) throw error;
      return data as CDNConfig[];
    }
  });

  const createMutation = useMutation({
    mutationFn: async (subdomain: string) => {
      const { error } = await supabase
        .from('cdn_configurations')
        .insert([{ subdomain }]);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cdn-configurations'] });
      toast({
        title: "CDN Configuration Saved",
        description: `Para completar a configuração no Cloudflare, siga estes passos:\n
          1. Acesse o painel do Cloudflare\n
          2. Vá para a seção DNS\n
          3. Adicione um registro CNAME:\n
            - Tipo: CNAME\n
            - Nome: ${subdomain.split('.')[0]}\n
            - Destino: ${window.location.hostname}\n
            - Proxy status: Proxied (laranja)\n
          4. Em SSL/TLS, certifique-se que está como "Flexible"\n
          5. Em Rules > Page Rules, adicione:\n
            - URL: ${subdomain}/*\n
            - Cache Level: Cache Everything`,
      });
      setSubdomain("");
    },
    onError: (error) => {
      console.error('Error saving CDN configuration:', error);
      toast({
        title: "Error",
        description: "Falha ao salvar configuração do CDN",
        variant: "destructive",
      });
    }
  });

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
      try {
        // Usando um Edge Function para contornar o CORS
        const { data, error } = await supabase.functions.invoke('verify-cdn', {
          body: { url: `https://${subdomain}` }
        });
        
        if (error) throw error;
        return data.isValid;
      } catch (error) {
        console.error('Verification error:', error);
        return false;
      }
    },
    onSuccess: (isValid, subdomain) => {
      toast({
        title: isValid ? "Conexão Verificada" : "Falha na Verificação",
        description: isValid 
          ? `O registro CNAME para ${subdomain} está configurado corretamente`
          : `Não foi possível verificar o registro CNAME para ${subdomain}. Por favor, verifique suas configurações no Cloudflare`,
        variant: isValid ? "default" : "destructive",
      });
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(subdomain);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja deletar esta configuração?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleVerify = (subdomain: string) => {
    verifyMutation.mutate(subdomain);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuração do CDN (Cloudflare)</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Input
              type="text"
              placeholder="Digite o subdomínio (ex: cdn.seudominio.com)"
              value={subdomain}
              onChange={(e) => setSubdomain(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full">
            Salvar Configuração
          </Button>
        </form>

        {configurations && configurations.length > 0 && (
          <div className="mt-6 space-y-4">
            <h3 className="font-semibold">Configurações Existentes</h3>
            {configurations.map((config) => (
              <div key={config.id} className="flex items-center justify-between p-3 border rounded">
                <span>{config.subdomain}</span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleVerify(config.subdomain)}
                  >
                    <RefreshCw className="h-4 w-4 mr-1" />
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
        )}
      </CardContent>
    </Card>
  );
};