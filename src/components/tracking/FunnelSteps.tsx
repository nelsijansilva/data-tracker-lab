import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FunnelStep {
  id: string;
  name: string;
  path: string;
  event: string;
  selector?: string;
  triggerType: 'pageview' | 'click';
}

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

  const updateStep = (id: string, field: keyof FunnelStep, value: string | 'pageview' | 'click') => {
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
          <div key={step.id} className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
            <Input
              placeholder="Step Name"
              value={step.name}
              onChange={(e) => updateStep(step.id, "name", e.target.value)}
              className="md:col-span-1"
            />
            <Input
              placeholder="Page Path (e.g., /checkout)"
              value={step.path}
              onChange={(e) => updateStep(step.id, "path", e.target.value)}
              className="md:col-span-1"
            />
            <Input
              placeholder="Event Name"
              value={step.event}
              onChange={(e) => updateStep(step.id, "event", e.target.value)}
              className="md:col-span-1"
            />
            <select
              value={step.triggerType}
              onChange={(e) => updateStep(step.id, "triggerType", e.target.value as 'pageview' | 'click')}
              className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm md:col-span-1"
            >
              <option value="pageview">Page View</option>
              <option value="click">Click Event</option>
            </select>
            {step.triggerType === 'click' && (
              <Input
                placeholder="CSS Selector (class or ID)"
                value={step.selector || ''}
                onChange={(e) => updateStep(step.id, "selector", e.target.value)}
                className="md:col-span-1"
              />
            )}
            <Button
              variant="destructive"
              size="icon"
              onClick={() => removeStep(step.id)}
              className="md:col-span-1"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
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