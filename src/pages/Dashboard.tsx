import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CampaignsList } from "@/components/facebook/CampaignsList";
import { AccountsList } from "@/components/facebook/AccountsList";
import { CustomMetricsDashboard } from "@/components/facebook/CustomMetricsDashboard";
import { supabase } from "@/integrations/supabase/client";
import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

const Dashboard = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("campaigns");
  
  useEffect(() => {
    if (location.state?.defaultTab) {
      setActiveTab(location.state.defaultTab);
    }
  }, [location.state]);

  const { data: hasCredentials, isLoading } = useQuery({
    queryKey: ['fbCredentials'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('facebook_ad_accounts')
        .select('*')
        .limit(1);
      
      if (error) {
        console.error('Error fetching credentials:', error);
        return false;
      }
      return data && data.length > 0;
    }
  });

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 flex items-center justify-center">
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <div className="h-screen bg-background">
      <div className="border-b">
        <div className="container mx-auto py-4">
          <h1 className="text-2xl font-bold">Facebook Ads Manager</h1>
        </div>
      </div>

      <div className="container mx-auto py-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <div className="border-b">
            <TabsList className="w-full justify-start gap-4 h-12">
              <TabsTrigger value="accounts" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Contas
              </TabsTrigger>
              {hasCredentials && (
                <>
                  <TabsTrigger value="campaigns" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    Campanhas
                  </TabsTrigger>
                  <TabsTrigger value="custom-metrics" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    Métricas Personalizadas
                  </TabsTrigger>
                </>
              )}
            </TabsList>
          </div>

          <div className="p-4 h-full border rounded-lg">
            <TabsContent value="accounts">
              <AccountsList />
            </TabsContent>

            {hasCredentials && (
              <>
                <TabsContent value="campaigns">
                  <CampaignsList />
                </TabsContent>

                <TabsContent value="custom-metrics">
                  <CustomMetricsDashboard />
                </TabsContent>
              </>
            )}
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;