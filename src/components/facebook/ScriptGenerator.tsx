import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, Copy } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export const ScriptGenerator = () => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const scriptContent = `
<script>
  !function(){
    var t = document.createElement("script");
    t.type = "module";
    t.src = "https://cdn.gpteng.co/gptengineer.js";
    document.head.appendChild(t);
  }();
</script>
<script type="module">
  import { tracker } from '@/lib/tracking/tracker';
  
  // Inicializa o rastreamento
  tracker.trackPageView(document.title);
  
  // Exemplo de como rastrear eventos
  document.addEventListener('click', function(e) {
    if (e.target.tagName === 'BUTTON') {
      tracker.trackEvent('click', 'button_click', {
        buttonText: e.target.textContent,
        path: window.location.pathname
      });
    }
  });
  
  // Exemplo de como rastrear conversões
  function trackPurchase(value) {
    tracker.trackConversion('purchase', value, {
      currency: 'BRL',
      timestamp: new Date().toISOString()
    });
  }
</script>`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(scriptContent);
      setCopied(true);
      toast({
        title: "Script copiado!",
        description: "O código foi copiado para sua área de transferência.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar o código. Tente copiar manualmente.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="p-6 bg-[#2a2f3d] border-none">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-white">Código de Rastreamento</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={copyToClipboard}
          className="flex items-center gap-2"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4" />
              Copiado!
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              Copiar Código
            </>
          )}
        </Button>
      </div>
      <pre className="bg-[#1a1f2e] p-4 rounded-lg overflow-x-auto">
        <code className="text-sm text-white">{scriptContent}</code>
      </pre>
      <p className="mt-4 text-sm text-gray-400">
        Adicione este código ao seu site para começar a rastrear eventos, visualizações de página e conversões.
      </p>
    </Card>
  );
};