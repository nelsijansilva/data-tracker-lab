import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, Copy } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FunnelBuilder } from "./ScriptGenerator/FunnelBuilder";
import type { Funnel } from "@/types/tracking";
import { v4 as uuidv4 } from "uuid";

export const ScriptGenerator = () => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const [funnel, setFunnel] = useState<Funnel>({
    id: uuidv4(),
    name: "",
    steps: []
  });

  const generateScript = () => {
    const funnelSteps = funnel.steps
      .map((step) => {
        let triggerCode = "";
        
        switch (step.triggerType) {
          case "pageview":
            triggerCode = `
  // ${step.name}
  if (window.location.pathname === "${step.path}") {
    tracker.trackEvent('funnel_step', '${step.event}', {
      step: ${step.orderPosition + 1},
      stepName: "${step.name}",
      path: "${step.path}"
    });
  }`;
            break;
          
          case "click":
            triggerCode = `
  // ${step.name}
  document.querySelectorAll('${step.selector}').forEach(element => {
    element.addEventListener('click', function() {
      tracker.trackEvent('funnel_step', '${step.event}', {
        step: ${step.orderPosition + 1},
        stepName: "${step.name}",
        path: "${step.path}",
        elementSelector: "${step.selector}"
      });
    });
  });`;
            break;
          
          case "scroll":
            triggerCode = `
  // ${step.name}
  let ${step.event}_tracked = false;
  window.addEventListener('scroll', function() {
    if (!${step.event}_tracked && window.location.pathname === "${step.path}") {
      const scrollPercent = (window.scrollY + window.innerHeight) / document.documentElement.scrollHeight * 100;
      if (scrollPercent >= 75) {
        tracker.trackEvent('funnel_step', '${step.event}', {
          step: ${step.orderPosition + 1},
          stepName: "${step.name}",
          path: "${step.path}",
          scrollPercent: Math.round(scrollPercent)
        });
        ${step.event}_tracked = true;
      }
    }
  });`;
            break;
        }
        
        return triggerCode;
      })
      .join("\n");

    return `<script>
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
  
  // Rastreamento do Funil: ${funnel.name}
  ${funnelSteps}
  
  // Exemplo de como rastrear conversões
  function trackPurchase(value) {
    tracker.trackConversion('purchase', value, {
      currency: 'BRL',
      timestamp: new Date().toISOString()
    });
  }
</script>`;
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generateScript());
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
    <div className="space-y-6">
      <Card className="p-6 bg-[#2a2f3d] border-none">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-white">Gerador de Script de Rastreamento</h3>
          </div>

          <div className="space-y-2">
            <Label htmlFor="funnel-name">Nome do Funil</Label>
            <Input
              id="funnel-name"
              value={funnel.name}
              onChange={(e) => setFunnel({ ...funnel, name: e.target.value })}
              placeholder="Ex: Funil de Vendas Principal"
              className="bg-[#1a1f2e] border-gray-700"
            />
          </div>

          <FunnelBuilder funnel={funnel} onUpdate={setFunnel} />
        </div>
      </Card>

      {funnel.steps.length > 0 && (
        <Card className="p-6 bg-[#2a2f3d] border-none">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-white">Script Gerado</h3>
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
            <code className="text-sm text-white">{generateScript()}</code>
          </pre>
          <p className="mt-4 text-sm text-gray-400">
            Adicione este código ao seu site para começar a rastrear o funil definido.
          </p>
        </Card>
      )}
    </div>
  );
};