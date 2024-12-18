import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { FunnelStepForm } from "./FunnelStepForm";
import type { FunnelStep } from "@/types/tracking";

interface FunnelStepsProps {
  steps: FunnelStep[];
  onChange: (steps: FunnelStep[]) => void;
  onSave: () => void;
}

export const FunnelSteps = ({ steps, onChange, onSave }: FunnelStepsProps) => {
  const [funnelName, setFunnelName] = useState("");
  const { toast } = useToast();

  const addStep = () => {
    const newStep: FunnelStep = {
      id: Date.now().toString(),
      name: "",
      path: "",
      event: "",
      selector: "",
      triggerType: 'pageview'
    };
    onChange([...steps, newStep]);
  };

  const updateStep = (id: string, field: keyof FunnelStep, value: string | 'pageview' | 'click' | 'scroll') => {
    const updatedSteps = steps.map((step) =>
      step.id === id ? { ...step, [field]: value } : step
    );
    onChange(updatedSteps);
  };

  const removeStep = (id: string) => {
    onChange(steps.filter((step) => step.id !== id));
  };

  const handleSave = () => {
    if (!funnelName.trim()) {
      toast({
        title: "Error",
        description: "Please provide a funnel name",
        variant: "destructive",
      });
      return;
    }

    if (steps.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one step to the funnel",
        variant: "destructive",
      });
      return;
    }

    // Save funnel data to localStorage
    const funnels = JSON.parse(localStorage.getItem('tracking_funnels') || '{}');
    const funnelId = Date.now().toString();
    funnels[funnelId] = {
      id: funnelId,
      name: funnelName,
      steps: steps
    };
    localStorage.setItem('tracking_funnels', JSON.stringify(funnels));
    
    toast({
      title: "Success",
      description: "Funnel saved successfully",
    });
    
    onSave();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Funnel Configuration</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="funnelName" className="text-sm font-medium">
            Funnel Name
          </label>
          <Input
            id="funnelName"
            value={funnelName}
            onChange={(e) => setFunnelName(e.target.value)}
            placeholder="Enter funnel name"
          />
        </div>

        {steps.map((step) => (
          <FunnelStepForm
            key={step.id}
            step={step}
            onUpdate={updateStep}
            onRemove={removeStep}
          />
        ))}

        <div className="flex gap-4">
          <Button onClick={addStep} className="flex-1">
            Add Step
          </Button>
          <Button onClick={handleSave} className="flex-1">
            Save Funnel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};