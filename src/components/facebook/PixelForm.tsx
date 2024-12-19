import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { FacebookPixel } from "./PixelConfigForm";

type PixelFormData = Omit<FacebookPixel, 'id'>;

interface PixelFormProps {
  editingPixel: FacebookPixel | null;
  onSubmit: (data: PixelFormData) => Promise<void>;
  onCancel: () => void;
}

export const PixelForm = ({ editingPixel, onSubmit, onCancel }: PixelFormProps) => {
  const [pixelName, setPixelName] = useState(editingPixel?.pixel_name || "");
  const [pixelId, setPixelId] = useState(editingPixel?.pixel_id || "");
  const [pixelToken, setPixelToken] = useState(editingPixel?.pixel_token || "");
  const [eventTestCode, setEventTestCode] = useState(editingPixel?.event_test_code || "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      pixel_name: pixelName,
      pixel_id: pixelId,
      pixel_token: pixelToken,
      event_test_code: eventTestCode || null,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {editingPixel ? "Editar Pixel do Facebook" : "Configurar Pixel do Facebook"}
        </CardTitle>
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
              Código de Teste de Eventos (opcional)
            </label>
            <Textarea
              id="eventTestCode"
              placeholder="Digite o código de teste de eventos"
              value={eventTestCode}
              onChange={(e) => setEventTestCode(e.target.value)}
            />
          </div>
          <div className="flex gap-4">
            <Button type="submit">
              {editingPixel ? "Atualizar" : "Salvar"} Configuração
            </Button>
            {editingPixel && (
              <Button type="button" variant="secondary" onClick={onCancel}>
                Cancelar
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};