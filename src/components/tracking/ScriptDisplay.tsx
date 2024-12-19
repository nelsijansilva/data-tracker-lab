import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { FileCode } from "lucide-react";

interface ScriptDisplayProps {
  script: string;
  onGenerate?: () => void;
}

export const ScriptDisplay = ({ script, onGenerate }: ScriptDisplayProps) => {
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
          Copie este script e adicione-o à seção &lt;head&gt; do seu site para habilitar o rastreamento.
          Este script carregará automaticamente a funcionalidade de rastreamento e tratará todos os eventos com base na sua configuração de funil.
        </AlertDescription>
      </Alert>
      
      <div className="relative">
        <pre className="bg-hacker-darker p-6 rounded-lg overflow-x-auto border border-primary/20 text-foreground">
          <code className="text-sm">{script}</code>
        </pre>
        <div className="absolute top-2 right-2 flex gap-2">
          <Button
            onClick={onGenerate}
            variant="outline"
            className="hover:bg-primary/20"
          >
            <FileCode className="h-4 w-4 mr-2" />
            Gerar Script
          </Button>
          <Button
            onClick={copyScript}
            variant="secondary"
            className="hover:bg-secondary/20"
          >
            Copiar Script
          </Button>
        </div>
      </div>
    </div>
  );
};