import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { CredentialsForm } from "@/components/tracking/CredentialsForm";
import { FunnelSteps } from "@/components/tracking/FunnelSteps";
import { ScriptGenerator } from "@/components/tracking/ScriptGenerator";

interface FunnelStep {
  id: string;
  name: string;
  path: string;
  event: string;
  selector?: string;
  triggerType: 'pageview' | 'click';
}

const Index = () => {
  const [credentials, setCredentials] = useState({
    pixelId: "",
    apiToken: "",
  });
  const [backendUrl, setBackendUrl] = useState("");
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
            <Card className="p-6">
              <label htmlFor="backendUrl" className="block text-sm font-medium mb-2">
                Backend URL
              </label>
              <Input
                id="backendUrl"
                placeholder="Enter your backend URL (e.g., https://api.example.com)"
                value={backendUrl}
                onChange={(e) => setBackendUrl(e.target.value)}
              />
            </Card>

            <FunnelSteps 
              steps={steps} 
              onChange={setSteps}
              onSave={() => {}}
            />

            {backendUrl && steps.length > 0 && (
              <ScriptGenerator
                pixelId={credentials.pixelId}
                apiToken={credentials.apiToken}
                backendUrl={backendUrl}
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