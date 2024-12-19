import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { generateTrackingScript } from "@/lib/tracking/trackingScript";
import { ScriptDisplay } from "./ScriptDisplay";

export const ScriptGenerator = () => {
  const [pixelId, setPixelId] = useState("");
  const [trackingScript, setTrackingScript] = useState("");
  const { toast } = useToast();

  const handleGenerate = () => {
    if (!pixelId) {
      toast({
        title: "Erro",
        description: "Por favor, insira o ID do Pixel",
        variant: "destructive",
      });
      return;
    }

    const script = generateTrackingScript(pixelId);
    setTrackingScript(script);
    toast({
      title: "Sucesso",
      description: "Script gerado com sucesso",
    });
  };

  return (
    <Card className="bg-[#2a2f3d] border-gray-700">
      <CardHeader>
        <CardTitle className="text-gray-200">Gerador de Script do Facebook Pixel</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Input
            placeholder="Digite o ID do seu Pixel do Facebook"
            value={pixelId}
            onChange={(e) => setPixelId(e.target.value)}
            className="bg-[#1a1f2e] border-gray-700 text-gray-200"
          />
          <Button 
            onClick={handleGenerate}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            Gerar Script
          </Button>
        </div>

        {trackingScript && <ScriptDisplay script={trackingScript} />}
      </CardContent>
    </Card>
  );
};