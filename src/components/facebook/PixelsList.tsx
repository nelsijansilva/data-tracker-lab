import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Pencil } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FacebookPixel } from "./PixelConfigForm";
import { injectPixelScript } from "@/lib/facebook/pixelInjector";
import { useToast } from "@/hooks/use-toast";

interface PixelsListProps {
  pixels: FacebookPixel[];
  onEdit: (pixel: FacebookPixel) => void;
  onDelete: (id: string) => Promise<void>;
}

export const PixelsList = ({ pixels, onEdit, onDelete }: PixelsListProps) => {
  const { toast } = useToast();

  const handleGenerateScript = (pixelId: string, eventTestCode: string | null) => {
    const script = injectPixelScript(pixelId, eventTestCode);
    navigator.clipboard.writeText(script);
    toast({
      title: "Script Copiado e Injetado",
      description: "O script foi copiado para sua área de transferência e injetado na página",
    });
  };

  if (!pixels.length) return null;

  return (
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
                      onClick={() => onEdit(pixel)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(pixel.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => handleGenerateScript(pixel.pixel_id, pixel.event_test_code)}
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
  );
};