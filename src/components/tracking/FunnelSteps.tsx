import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X } from "lucide-react";

interface FunnelStep {
  id: string;
  name: string;
  path: string;
  event: string;
}

interface FunnelStepsProps {
  steps: FunnelStep[];
  onChange: (steps: FunnelStep[]) => void;
}

export const FunnelSteps = ({ steps, onChange }: FunnelStepsProps) => {
  const addStep = () => {
    const newStep: FunnelStep = {
      id: Date.now().toString(),
      name: "",
      path: "",
      event: "",
    };
    onChange([...steps, newStep]);
  };

  const updateStep = (id: string, field: keyof FunnelStep, value: string) => {
    const updatedSteps = steps.map((step) =>
      step.id === id ? { ...step, [field]: value } : step
    );
    onChange(updatedSteps);
  };

  const removeStep = (id: string) => {
    onChange(steps.filter((step) => step.id !== id));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Funnel Steps</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {steps.map((step) => (
          <div key={step.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
            <Input
              placeholder="Step Name"
              value={step.name}
              onChange={(e) => updateStep(step.id, "name", e.target.value)}
            />
            <Input
              placeholder="Page Path (e.g., /checkout)"
              value={step.path}
              onChange={(e) => updateStep(step.id, "path", e.target.value)}
            />
            <Input
              placeholder="Event Name"
              value={step.event}
              onChange={(e) => updateStep(step.id, "event", e.target.value)}
            />
            <Button
              variant="destructive"
              size="icon"
              onClick={() => removeStep(step.id)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <Button onClick={addStep} className="w-full">
          Add Step
        </Button>
      </CardContent>
    </Card>
  );
};