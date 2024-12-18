import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const CDNConfigurationForm = () => {
  const [subdomain, setSubdomain] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async (subdomain: string) => {
      const { error } = await supabase
        .from('cdn_configurations')
        .insert([{ subdomain, status: 'pending' }]);
      
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
            - TTL: Auto\n
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(subdomain);
  };

  return (
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
  );
};