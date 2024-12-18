import { useState } from "react";
import { Card } from "@/components/ui/card";
import { CredentialsForm } from "@/components/tracking/CredentialsForm";
import { FunnelSteps } from "@/components/tracking/FunnelSteps";
import { ScriptGenerator } from "@/components/tracking/ScriptGenerator";
import type { FunnelStep } from "@/types/tracking";

const Index = () => {
  const [credentials, setCredentials] = useState({
    pixelId: "",
    apiToken: "",
  });
  const [steps, setSteps] = useState<FunnelStep[]>([]);

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
              onSave={() => {}}
            />

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