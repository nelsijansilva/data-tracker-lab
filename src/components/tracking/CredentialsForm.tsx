import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { savePixelConfiguration, getPixelConfiguration } from "@/lib/tracking/supabaseClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface CredentialsFormProps {
  onSave: (pixelId: string, apiToken: string) => void;
}

export const CredentialsForm = ({ onSave }: CredentialsFormProps) => {
  const [pixelId, setPixelId] = useState('');
  const [apiToken, setApiToken] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: configuration } = useQuery({
    queryKey: ['pixelConfiguration'],
    queryFn: getPixelConfiguration,
    meta: {
      onSuccess: (data) => {
        if (data && !pixelId && !apiToken) {
          setPixelId(data.pixelId);
          setApiToken(data.apiToken);
          onSave(data.pixelId, data.apiToken);
        }
      }
    }
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      await savePixelConfiguration(pixelId, apiToken);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pixelConfiguration'] });
      onSave(pixelId, apiToken);
      toast({
        title: "Sucesso",
        description: "Credenciais salvas com sucesso",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Falha ao salvar credenciais",
        variant: "destructive",
      });
      console.error('Error saving credentials:', error);
    }
  });

  const handleSave = () => {
    if (!pixelId || !apiToken) {
      toast({
        title: "Credenciais Faltando",
        description: "Por favor, insira o Pixel ID e o Token da API",
        variant: "destructive",
      });
      return;
    }

    saveMutation.mutate();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Credenciais do Facebook</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="pixelId" className="text-sm font-medium">
              Pixel ID
            </label>
            <Input
              id="pixelId"
              value={pixelId}
              onChange={(e) => setPixelId(e.target.value)}
              placeholder="Digite seu Facebook Pixel ID"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="apiToken" className="text-sm font-medium">
              API Token
            </label>
            <Input
              id="apiToken"
              type="password"
              value={apiToken}
              onChange={(e) => setApiToken(e.target.value)}
              placeholder="Digite seu Facebook API Token"
            />
          </div>
        </div>
        <Button 
          onClick={handleSave} 
          className="w-full"
          disabled={saveMutation.isPending}
        >
          {saveMutation.isPending ? "Salvando..." : "Salvar Credenciais"}
        </Button>
      </CardContent>
    </Card>
  );
};