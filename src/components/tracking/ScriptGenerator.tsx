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
      return generateCDNScript(pixelId);
    },
    onSuccess: (script) => {
      setTrackingScript(script);
      toast({
        title: "Script Generated",
        description: "Tracking script has been generated successfully",
      });
    },
    onError: (error) => {
      console.error('Error generating script:', error);
      toast({
        title: "Error",
        description: "Failed to generate tracking script",
        variant: "destructive",
      });
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tracking Script</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={() => generateMutation.mutate()} 
          className="w-full"
          disabled={generateMutation.isPending}
        >
          {generateMutation.isPending ? "Generating..." : "Generate Script"}
        </Button>
        
        {trackingScript && <ScriptDisplay script={trackingScript} />}
      </CardContent>
    </Card>
  );
};