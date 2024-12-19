import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CampaignsList } from "@/components/facebook/CampaignsList";
import { AdSetsList } from "@/components/facebook/AdSetsList";
import { AdsList } from "@/components/facebook/AdsList";
import { AccountsList } from "@/components/facebook/AccountsList";
import { supabase } from "@/integrations/supabase/client";

const Dashboard = () => {
  const { data: hasCredentials } = useQuery({
    queryKey: ['fbCredentials'],
    queryFn: async () => {
      const { data } = await supabase
        .from('facebook_ad_accounts')
        .select('*')
        .limit(1);
      return data && data.length > 0;
    }
  });

  if (!hasCredentials) {
    return (
      <div className="container mx-auto p-8">
        <AccountsList />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Facebook Ads Dashboard</h1>
      
      <Tabs defaultValue="accounts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="accounts">Contas</TabsTrigger>
          <TabsTrigger value="campaigns">Campanhas</TabsTrigger>
          <TabsTrigger value="adsets">Conjuntos de Anúncios</TabsTrigger>
          <TabsTrigger value="ads">Anúncios</TabsTrigger>
        </TabsList>

        <TabsContent value="accounts">
          <Card>
            <CardHeader>
              <CardTitle>Gerenciar Contas</CardTitle>
            </CardHeader>
            <CardContent>
              <AccountsList />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="campaigns">
          <Card>
            <CardHeader>
              <CardTitle>Campanhas</CardTitle>
            </CardHeader>
            <CardContent>
              <CampaignsList />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="adsets">
          <Card>
            <CardHeader>
              <CardTitle>Conjuntos de Anúncios</CardTitle>
            </CardHeader>
            <CardContent>
              <AdSetsList />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ads">
          <Card>
            <CardHeader>
              <CardTitle>Anúncios</CardTitle>
            </CardHeader>
            <CardContent>
              <AdsList />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;