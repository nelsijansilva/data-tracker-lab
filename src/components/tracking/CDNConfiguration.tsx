import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const CDNConfiguration = () => {
  const [subdomain, setSubdomain] = useState("");
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { error } = await supabase
        .from('cdn_configurations')
        .insert([{ subdomain }]);

      if (error) throw error;

      toast({
        title: "CDN Configuration Saved",
        description: `To complete setup, add a CNAME record pointing ${subdomain} to cdn.yourdomain.com`,
      });

      setSubdomain("");
    } catch (error) {
      console.error('Error saving CDN configuration:', error);
      toast({
        title: "Error",
        description: "Failed to save CDN configuration",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>CDN Configuration</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Input
              type="text"
              placeholder="Enter subdomain (e.g., cdn.example.com)"
              value={subdomain}
              onChange={(e) => setSubdomain(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full">
            Save Configuration
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};