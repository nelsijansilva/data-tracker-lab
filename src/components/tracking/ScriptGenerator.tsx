import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { generateTrackingScript } from "@/lib/tracking/trackingUtils";
import { ScriptDisplay } from "./ScriptDisplay";
import type { FunnelStep } from "@/types/tracking";

interface ScriptGeneratorProps {
  pixelId: string;
  apiToken: string;
  backendUrl: string;
  steps: FunnelStep[];
}

export const ScriptGenerator = ({ pixelId, apiToken, backendUrl, steps }: ScriptGeneratorProps) => {
  const { toast } = useToast();
  const [trackingScript, setTrackingScript] = useState("");

  const generateScript = () => {
    const script = generateTrackingScript(pixelId, backendUrl, steps);
    setTrackingScript(script);
    toast({
      title: "Script Generated",
      description: "Tracking script has been generated successfully",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tracking Script</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={generateScript} className="w-full">
          Generate Script
        </Button>
        
        {trackingScript && <ScriptDisplay script={trackingScript} />}
      </CardContent>
    </Card>
  );
};