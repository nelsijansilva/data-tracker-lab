import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";

interface PixelConfig {
  id: string;
  pixel_name: string;
  pixel_id: string;
  pixel_token: string;
  event_test_code: string;
}

export const PixelConfigForm = () => {
  const [pixelName, setPixelName] = useState("");
  const [pixelId, setPixelId] = useState("");
  const [pixelToken, setPixelToken] = useState("");
  const [eventTestCode, setEventTestCode] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { error } = await supabase
        .from('facebook_pixels')
        .insert([
          {
            pixel_name: pixelName,
            pixel_id: pixelId,
            pixel_token: pixelToken,
            event_test_code: eventTestCode,
          }
        ]);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Configuração do pixel salva com sucesso",
      });

      queryClient.invalidateQueries({ queryKey: ['fbPixels'] });
      setPixelName("");
      setPixelId("");
      setPixelToken("");
      setEventTestCode("");
    } catch (error) {
      console.error('Error saving pixel config:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar configuração do pixel",
        variant: "destructive",
      });
    }
  };

  const generateScript = () => {
    const script = `<script src="https://avxgduktxkorwfmccwbs.supabase.co/functions/v1/serve-tracker?pixel_id=${pixelId}&event_test_code=${eventTestCode}" async></script>`;
    navigator.clipboard.writeText(script);
    toast({
      title: "Script Copiado",
      description: "O script foi copiado para sua área de transferência",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configurar Pixel do Facebook</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="pixelName" className="block text-sm font-medium mb-1">
              Nome do Pixel
            </label>
            <Input
              id="pixelName"
              placeholder="Digite um nome para identificar este pixel"
              value={pixelName}
              onChange={(e) => setPixelName(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="pixelId" className="block text-sm font-medium mb-1">
              ID do Pixel
            </label>
            <Input
              id="pixelId"
              placeholder="Digite o ID do pixel"
              value={pixelId}
              onChange={(e) => setPixelId(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="pixelToken" className="block text-sm font-medium mb-1">
              Token do Pixel
            </label>
            <Input
              id="pixelToken"
              type="password"
              placeholder="Digite o token do pixel"
              value={pixelToken}
              onChange={(e) => setPixelToken(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="eventTestCode" className="block text-sm font-medium mb-1">
              Código de Teste de Eventos
            </label>
            <Textarea
              id="eventTestCode"
              placeholder="Digite o código de teste de eventos"
              value={eventTestCode}
              onChange={(e) => setEventTestCode(e.target.value)}
              required
            />
          </div>
          <div className="flex gap-4">
            <Button type="submit">
              Salvar Configuração
            </Button>
            <Button type="button" variant="secondary" onClick={generateScript}>
              Gerar Script
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};