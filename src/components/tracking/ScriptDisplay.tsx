import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Copy } from "lucide-react";

interface ScriptDisplayProps {
  script: string;
}

export const ScriptDisplay = ({ script }: ScriptDisplayProps) => {
  const { toast } = useToast();

  const copyScript = () => {
    navigator.clipboard.writeText(script);
    toast({
      title: "Script Copiado",
      description: "O script de rastreamento foi copiado para a área de transferência",
    });
  };

  return (
    <div className="space-y-4">
      <Alert>
        <AlertDescription>
          Copie este script e adicione-o à seção &lt;head&gt; do seu site para habilitar o rastreamento do Facebook Pixel.
        </AlertDescription>
      </Alert>
      
      <div className="relative">
        <pre className="bg-[#1a1f2e] p-6 rounded-lg overflow-x-auto border border-gray-700 text-gray-300 font-mono text-sm">
          <code>{script}</code>
        </pre>
        <div className="absolute top-2 right-2">
          <Button
            onClick={copyScript}
            variant="outline"
            size="sm"
            className="bg-[#2a2f3d] hover:bg-[#3a3f4d] text-gray-300"
          >
            <Copy className="h-4 w-4 mr-2" />
            Copiar Script
          </Button>
        </div>
      </div>
    </div>
  );
};