import { useState } from "react";
import { Card } from "@/components/ui/card";
import { CredentialsForm } from "@/components/tracking/CredentialsForm";
import { FunnelSteps } from "@/components/tracking/FunnelSteps";
import { ScriptGenerator } from "@/components/tracking/ScriptGenerator";
import { getFunnels } from "@/lib/tracking/supabaseClient";
import type { FunnelStep } from "@/types/tracking";
import { useQuery } from "@tanstack/react-query";

const Index = () => {
  const [credentials, setCredentials] = useState({
    pixelId: "",
    apiToken: "",
  });
  const [steps, setSteps] = useState<FunnelStep[]>([]);

  const { data: funnels } = useQuery({
    queryKey: ['funnels'],
    queryFn: getFunnels
  });

  const handleCredentialsSave = (pixelId: string, apiToken: string) => {
    setCredentials({ pixelId, apiToken });
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
              onSave={() => setSteps([])}
            />

            {funnels && funnels.length > 0 && (
              <Card className="p-6">
                <h2 className="text-2xl font-bold mb-4">Saved Funnels</h2>
                <div className="space-y-4">
                  {funnels.map((funnel) => (
                    <div key={funnel.id} className="border p-4 rounded-lg">
                      <h3 className="text-xl font-semibold mb-2">{funnel.name}</h3>
                      <div className="space-y-2">
                        {funnel.steps.map((step, index) => (
                          <div key={step.id} className="flex items-center gap-2">
                            <span className="font-medium">{index + 1}.</span>
                            <span>{step.name}</span>
                            <span className="text-gray-500">({step.triggerType})</span>
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