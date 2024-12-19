import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { generateCDNScript } from "@/lib/tracking/trackingScript";
import { ScriptDisplay } from "./ScriptDisplay";
import type { FunnelStep } from "@/types/tracking";
import { useMutation } from "@tanstack/react-query";

interface ScriptGeneratorProps {
  pixelId: string;
  apiToken: string;
  steps: FunnelStep[];
}

export const ScriptGenerator = ({ pixelId, apiToken, steps }: ScriptGeneratorProps) => {
  const { toast } = useToast();
  const [trackingScript, setTrackingScript] = useState("");

  const generateMutation = useMutation({
    mutationFn: async () => {
      if (!pixelId) {
        throw new Error("Pixel ID é necessário para gerar o script");
      }
      return generateCDNScript(pixelId);
    },
    onSuccess: (script) => {
      setTrackingScript(script);
      toast({
        title: "Script Gerado",
        description: "O script de rastreamento foi gerado com sucesso",
      });
    },
    onError: (error) => {
      console.error('Error generating script:', error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Falha ao gerar o script de rastreamento",
        variant: "destructive",
      });
    }
  });

  return (
    <Card className="bg-[#2a2f3d] border-gray-700">
      <CardHeader>
        <CardTitle className="text-gray-200">Script de Rastreamento</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {trackingScript ? (
          <ScriptDisplay 
            script={trackingScript} 
            onGenerate={() => generateMutation.mutate()}
          />
        ) : (
          <div className="flex justify-center">
            <Button 
              onClick={() => generateMutation.mutate()} 
              className="w-full max-w-md bg-blue-600 hover:bg-blue-700"
              disabled={generateMutation.isPending}
            >
              {generateMutation.isPending ? "Gerando..." : "Gerar Script"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};