import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, Pencil } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface FacebookPixel {
  id: string;
  pixel_name: string;
  pixel_id: string;
  pixel_token: string;
  event_test_code: string | null;
}

export const PixelConfigForm = () => {
  const [pixelName, setPixelName] = useState("");
  const [pixelId, setPixelId] = useState("");
  const [pixelToken, setPixelToken] = useState("");
  const [eventTestCode, setEventTestCode] = useState("");
  const [editingPixel, setEditingPixel] = useState<FacebookPixel | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: pixels, isLoading } = useQuery({
    queryKey: ['fbPixels'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('facebook_pixels')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as FacebookPixel[];
    }
  });

  const resetForm = () => {
    setPixelName("");
    setPixelId("");
    setPixelToken("");
    setEventTestCode("");
    setEditingPixel(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingPixel) {
        const { error } = await supabase
          .from('facebook_pixels')
          .update({
            pixel_name: pixelName,
            pixel_id: pixelId,
            pixel_token: pixelToken,
            event_test_code: eventTestCode || null,
          })
          .eq('id', editingPixel.id);

        if (error) throw error;

        toast({
          title: "Sucesso",
          description: "Pixel atualizado com sucesso",
        });
      } else {
        const { error } = await supabase
          .from('facebook_pixels')
          .insert([
            {
              pixel_name: pixelName,
              pixel_id: pixelId,
              pixel_token: pixelToken,
              event_test_code: eventTestCode || null,
            }
          ]);

        if (error) throw error;

        toast({
          title: "Sucesso",
          description: "Pixel salvo com sucesso",
        });
      }

      queryClient.invalidateQueries({ queryKey: ['fbPixels'] });
      resetForm();
    } catch (error) {
      console.error('Error saving pixel config:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar configuração do pixel",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (pixel: FacebookPixel) => {
    setEditingPixel(pixel);
    setPixelName(pixel.pixel_name);
    setPixelId(pixel.pixel_id);
    setPixelToken(pixel.pixel_token);
    setEventTestCode(pixel.event_test_code || "");
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('facebook_pixels')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Pixel excluído com sucesso",
      });

      queryClient.invalidateQueries({ queryKey: ['fbPixels'] });
    } catch (error) {
      console.error('Error deleting pixel:', error);
      toast({
        title: "Erro",
        description: "Erro ao excluir o pixel",
        variant: "destructive",
      });
    }
  };

  const generateScript = (pixelId: string, eventTestCode: string | null) => {
    const script = `<script src="https://avxgduktxkorwfmccwbs.supabase.co/functions/v1/serve-tracker?pixel_id=${pixelId}${eventTestCode ? `&event_test_code=${eventTestCode}` : ''}" async></script>`;
    navigator.clipboard.writeText(script);
    toast({
      title: "Script Copiado",
      description: "O script foi copiado para sua área de transferência",
    });
  };

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="space-y-6">
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
                <Button type="button" variant="secondary" onClick={resetForm}>
                  Cancelar
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {pixels && pixels.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Pixels Configurados</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>ID do Pixel</TableHead>
                  <TableHead>Código de Teste</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pixels.map((pixel) => (
                  <TableRow key={pixel.id}>
                    <TableCell>{pixel.pixel_name}</TableCell>
                    <TableCell>{pixel.pixel_id}</TableCell>
                    <TableCell>{pixel.event_test_code || "-"}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(pixel)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(pixel.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="secondary"
                          onClick={() => generateScript(pixel.pixel_id, pixel.event_test_code)}
                        >
                          Gerar Script
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};