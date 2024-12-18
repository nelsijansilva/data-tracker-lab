import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { FunnelStepForm } from "./FunnelStepForm";
import { saveFunnel } from "@/lib/tracking/supabaseClient";
import type { FunnelStep } from "@/types/tracking";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface FunnelStepsProps {
  steps: FunnelStep[];
  onChange: (steps: FunnelStep[]) => void;
  onSave: () => void;
  editingFunnelId?: string | null;
}

export const FunnelSteps = ({ steps, onChange, onSave, editingFunnelId }: FunnelStepsProps) => {
  const [funnelName, setFunnelName] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (editingFunnelId) {
        // Delete existing steps
        await supabase
          .from('funnel_steps')
          .delete()
          .eq('funnel_id', editingFunnelId);
        
        // Update funnel name
        await supabase
          .from('funnels')
          .update({ name: funnelName })
          .eq('id', editingFunnelId);
        
        // Insert new steps
        const stepsWithFunnelId = steps.map((step, index) => ({
          funnel_id: editingFunnelId,
          name: step.name,
          path: step.path,
          event: step.event,
          selector: step.selector,
          trigger_type: step.triggerType,
          order_position: index + 1
        }));

        await supabase
          .from('funnel_steps')
          .insert(stepsWithFunnelId);
      } else {
        const stepsWithoutId = steps.map(({ id, ...step }) => step);
        await saveFunnel(funnelName, stepsWithoutId);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['funnels'] });
      toast({
        title: "Success",
        description: `Funnel ${editingFunnelId ? 'updated' : 'saved'} successfully`,
      });
      onSave();
      setFunnelName("");
      onChange([]);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to ${editingFunnelId ? 'update' : 'save'} funnel`,
        variant: "destructive",
      });
      console.error('Error saving funnel:', error);
    }
  });

  const addStep = () => {
    const newStep: FunnelStep = {
      id: Date.now().toString(),
      name: "",
      path: "",
      event: "",
      selector: "",
      triggerType: 'pageview',
      orderPosition: steps.length + 1
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

    saveMutation.mutate();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{editingFunnelId ? 'Edit Funnel' : 'Create New Funnel'}</CardTitle>
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
          <Button 
            onClick={handleSave} 
            className="flex-1"
            disabled={saveMutation.isPending}
          >
            {saveMutation.isPending ? "Saving..." : (editingFunnelId ? "Update Funnel" : "Save Funnel")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};