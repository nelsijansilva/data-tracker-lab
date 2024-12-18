import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CDNConfigurationForm } from "./CDNConfigurationForm";
import { CDNConfigurationList } from "./CDNConfigurationList";
import type { CDNConfig } from "@/types/tracking";

export const CDNConfiguration = () => {
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuração do CDN (Cloudflare)</CardTitle>
      </CardHeader>
      <CardContent>
        <CDNConfigurationForm />
        {configurations && configurations.length > 0 && (
          <CDNConfigurationList configurations={configurations} />
        )}
      </CardContent>
    </Card>
  );
};