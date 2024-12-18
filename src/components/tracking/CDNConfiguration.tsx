import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Trash2, RefreshCw } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface CDNConfig {
  id: string;
  subdomain: string;
  status: string;
}

export const CDNConfiguration = () => {
  const [subdomain, setSubdomain] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: configurations } = useQuery({
    queryKey: ['cdn-configurations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cdn_configurations')
        .select('*');
      
      if (error) throw error;
      return data as CDNConfig[];
    }
  });

  const createMutation = useMutation({
    mutationFn: async (subdomain: string) => {
      const { error } = await supabase
        .from('cdn_configurations')
        .insert([{ subdomain }]);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cdn-configurations'] });
      toast({
        title: "CDN Configuration Saved",
        description: `To complete setup, add a CNAME record in your DNS settings:\n
          Record Type: CNAME\n
          Name: ${subdomain.split('.')[0]}\n
          Value: assets.yourdomain.com\n
          TTL: 3600`,
      });
      setSubdomain("");
    },
    onError: (error) => {
      console.error('Error saving CDN configuration:', error);
      toast({
        title: "Error",
        description: "Failed to save CDN configuration",
        variant: "destructive",
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('cdn_configurations')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cdn-configurations'] });
      toast({
        title: "Configuration Deleted",
        description: "CDN configuration was successfully removed",
      });
    },
    onError: (error) => {
      console.error('Error deleting CDN configuration:', error);
      toast({
        title: "Error",
        description: "Failed to delete CDN configuration",
        variant: "destructive",
      });
    }
  });

  const verifyMutation = useMutation({
    mutationFn: async (subdomain: string) => {
      try {
        const response = await fetch(`https://${subdomain}/health-check`);
        return response.ok;
      } catch (error) {
        return false;
      }
    },
    onSuccess: (isValid, subdomain) => {
      toast({
        title: isValid ? "Connection Verified" : "Verification Failed",
        description: isValid 
          ? `The CNAME record for ${subdomain} is correctly configured`
          : `Could not verify the CNAME record for ${subdomain}. Please check your DNS settings`,
        variant: isValid ? "default" : "destructive",
      });
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(subdomain);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this configuration?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleVerify = (subdomain: string) => {
    verifyMutation.mutate(subdomain);
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

        {configurations && configurations.length > 0 && (
          <div className="mt-6 space-y-4">
            <h3 className="font-semibold">Existing Configurations</h3>
            {configurations.map((config) => (
              <div key={config.id} className="flex items-center justify-between p-3 border rounded">
                <span>{config.subdomain}</span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleVerify(config.subdomain)}
                  >
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Verify
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(config.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};