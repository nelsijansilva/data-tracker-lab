import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { FunnelStep } from "./FunnelStep";
import { v4 as uuidv4 } from "uuid";
import type { Funnel, FunnelStep as FunnelStepType } from "@/types/tracking";

interface FunnelBuilderProps {
  funnel: Funnel;
  onUpdate: (updatedFunnel: Funnel) => void;
}

export function FunnelBuilder({ funnel, onUpdate }: FunnelBuilderProps) {
  const addStep = () => {
    const newStep: FunnelStepType = {
      id: uuidv4(),
      name: "",
      path: "",
      event: "",
      triggerType: "pageview",
      orderPosition: funnel.steps.length,
    };

    onUpdate({
      ...funnel,
      steps: [...funnel.steps, newStep],
    });
  };

  const updateStep = (stepId: string, updatedStep: FunnelStepType) => {
    onUpdate({
      ...funnel,
      steps: funnel.steps.map((step) =>
        step.id === stepId ? updatedStep : step
      ),
    });
  };

  const deleteStep = (stepId: string) => {
    onUpdate({
      ...funnel,
      steps: funnel.steps
        .filter((step) => step.id !== stepId)
        .map((step, index) => ({ ...step, orderPosition: index })),
    });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-6">
        {funnel.steps.map((step, index) => (
          <FunnelStep
            key={step.id}
            step={step}
            stepNumber={index + 1}
            onUpdate={(updatedStep) => updateStep(step.id, updatedStep)}
            onDelete={() => deleteStep(step.id)}
          />
        ))}
      </div>

      <Button onClick={addStep} className="w-full">
        <Plus className="w-4 h-4 mr-2" />
        Adicionar Passo
      </Button>
    </div>
  );
}