import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface CredentialsFormProps {
  onSave: (pixelId: string, apiToken: string) => void;
}

export const CredentialsForm = ({ onSave }: CredentialsFormProps) => {
  const [pixelId, setPixelId] = useState(() => localStorage.getItem('fb_pixel_id') || '');
  const [apiToken, setApiToken] = useState(() => localStorage.getItem('fb_api_token') || '');
  const { toast } = useToast();

  const handleSave = () => {
    if (!pixelId || !apiToken) {
      toast({
        title: "Missing Credentials",
        description: "Please enter both Pixel ID and API Token",
        variant: "destructive",
      });
      return;
    }

    localStorage.setItem('fb_pixel_id', pixelId);
    localStorage.setItem('fb_api_token', apiToken);
    onSave(pixelId, apiToken);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Facebook Credentials</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="pixelId" className="text-sm font-medium">
              Pixel ID
            </label>
            <Input
              id="pixelId"
              value={pixelId}
              onChange={(e) => setPixelId(e.target.value)}
              placeholder="Enter your Facebook Pixel ID"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="apiToken" className="text-sm font-medium">
              API Token
            </label>
            <Input
              id="apiToken"
              type="password"
              value={apiToken}
              onChange={(e) => setApiToken(e.target.value)}
              placeholder="Enter your Facebook API Token"
            />
          </div>
        </div>
        <Button onClick={handleSave} className="w-full">
          Save Credentials
        </Button>
      </CardContent>
    </Card>
  );
};