import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import type { FunnelStep as FunnelStepType } from "@/types/tracking";

interface FunnelStepProps {
  step: FunnelStepType;
  onUpdate: (updatedStep: FunnelStepType) => void;
  onDelete: () => void;
  stepNumber: number;
}

export function FunnelStep({ step, onUpdate, onDelete, stepNumber }: FunnelStepProps) {
  return (
    <Card className="bg-[#2a2f3d] border-gray-700">
      <CardContent className="pt-6 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Passo {stepNumber}</h3>
          <Button variant="ghost" size="icon" onClick={onDelete}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-2">
          <Label htmlFor={`step-name-${stepNumber}`}>Nome do Passo</Label>
          <Input
            id={`step-name-${stepNumber}`}
            value={step.name}
            onChange={(e) => onUpdate({ ...step, name: e.target.value })}
            placeholder="Ex: Visualização da Página de Produto"
            className="bg-[#1a1f2e] border-gray-700"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor={`step-path-${stepNumber}`}>Caminho da Página</Label>
          <Input
            id={`step-path-${stepNumber}`}
            value={step.path}
            onChange={(e) => onUpdate({ ...step, path: e.target.value })}
            placeholder="Ex: /produtos/:id"
            className="bg-[#1a1f2e] border-gray-700"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor={`step-event-${stepNumber}`}>Evento</Label>
          <Input
            id={`step-event-${stepNumber}`}
            value={step.event}
            onChange={(e) => onUpdate({ ...step, event: e.target.value })}
            placeholder="Ex: view_item"
            className="bg-[#1a1f2e] border-gray-700"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor={`step-trigger-${stepNumber}`}>Tipo de Gatilho</Label>
          <Select
            value={step.triggerType}
            onValueChange={(value: 'pageview' | 'click' | 'scroll') => 
              onUpdate({ ...step, triggerType: value })
            }
          >
            <SelectTrigger className="bg-[#1a1f2e] border-gray-700">
              <SelectValue placeholder="Selecione o tipo de gatilho" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pageview">Visualização de Página</SelectItem>
              <SelectItem value="click">Clique</SelectItem>
              <SelectItem value="scroll">Scroll</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {step.triggerType === 'click' && (
          <div className="space-y-2">
            <Label htmlFor={`step-selector-${stepNumber}`}>Seletor (ID, Classe ou Nome)</Label>
            <Input
              id={`step-selector-${stepNumber}`}
              value={step.selector || ''}
              onChange={(e) => onUpdate({ ...step, selector: e.target.value })}
              placeholder="Ex: #buy-button, .submit-form, [name='subscribe']"
              className="bg-[#1a1f2e] border-gray-700"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}