import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CredentialsForm } from "@/components/tracking/CredentialsForm";
import { FunnelSteps } from "@/components/tracking/FunnelSteps";
import { ScriptGenerator } from "@/components/tracking/ScriptGenerator";
import { getFunnels } from "@/lib/tracking/supabaseClient";
import type { FunnelStep } from "@/types/tracking";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Pencil, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [credentials, setCredentials] = useState({
    pixelId: "",
    apiToken: "",
  });
  const [steps, setSteps] = useState<FunnelStep[]>([]);
  const [editingFunnelId, setEditingFunnelId] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: funnels } = useQuery({
    queryKey: ['funnels'],
    queryFn: getFunnels
  });

  const deleteMutation = useMutation({
    mutationFn: async (funnelId: string) => {
      // Delete funnel steps first due to foreign key constraint
      await supabase
        .from('funnel_steps')
        .delete()
        .eq('funnel_id', funnelId);
      
      // Then delete the funnel
      await supabase
        .from('funnels')
        .delete()
        .eq('id', funnelId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['funnels'] });
      toast({
        title: "Success",
        description: "Funnel deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete funnel",
        variant: "destructive",
      });
      console.error('Error deleting funnel:', error);
    }
  });

  const handleCredentialsSave = (pixelId: string, apiToken: string) => {
    setCredentials({ pixelId, apiToken });
  };

  const handleEdit = (funnel: { id: string, steps: any[] }) => {
    // Convert database step types to FunnelStep type
    const convertedSteps: FunnelStep[] = funnel.steps.map(step => ({
      id: step.id,
      name: step.name,
      path: step.path,
      event: step.event,
      selector: step.selector || '',
      triggerType: step.trigger_type as 'pageview' | 'click' | 'scroll',
      orderPosition: step.order_position
    }));
    
    setEditingFunnelId(funnel.id);
    setSteps(convertedSteps);
  };

  const handleDelete = (funnelId: string) => {
    if (window.confirm('Are you sure you want to delete this funnel?')) {
      deleteMutation.mutate(funnelId);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold text-gray-900">Facebook Funnel Tracker</h1>
        
        <CredentialsForm onSave={handleCredentialsSave} />

        {credentials.pixelId && credentials.apiToken && (
          <>
            <FunnelSteps 
              steps={steps} 
              onChange={setSteps}
              onSave={() => {
                setSteps([]);
                setEditingFunnelId(null);
              }}
              editingFunnelId={editingFunnelId}
            />

            {funnels && funnels.length > 0 && (
              <Card className="p-6">
                <h2 className="text-2xl font-bold mb-4">Saved Funnels</h2>
                <div className="space-y-4">
                  {funnels.map((funnel) => (
                    <div key={funnel.id} className="border p-4 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="text-xl font-semibold">{funnel.name}</h3>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleEdit(funnel)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="icon"
                            onClick={() => handleDelete(funnel.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        {funnel.steps.map((step, index) => (
                          <div key={step.id} className="flex items-center gap-2">
                            <span className="font-medium">{index + 1}.</span>
                            <span>{step.name}</span>
                            <span className="text-gray-500">({step.trigger_type})</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {steps.length > 0 && (
              <ScriptGenerator
                pixelId={credentials.pixelId}
                apiToken={credentials.apiToken}
                steps={steps}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Index;