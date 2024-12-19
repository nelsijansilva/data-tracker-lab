import { useQuery } from "@tanstack/react-query";
import { Settings, ArrowUp, ArrowDown, RefreshCw, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CampaignsList } from "@/components/facebook/CampaignsList";
import { AdSetsList } from "@/components/facebook/AdSetsList";
import { AccountsList } from "@/components/facebook/AccountsList";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { DateRange } from "react-day-picker";

type CampaignStatus = 'all' | 'active' | 'paused';

const Dashboard = () => {
  const [showAlert, setShowAlert] = useState(true);
  const [campaignStatus, setCampaignStatus] = useState<CampaignStatus>('all');
  const [selectedAccountId, setSelectedAccountId] = useState<string>('any');
  const [activeTab, setActiveTab] = useState('campaigns');
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(),
    to: new Date(),
  });

  const { data: accounts } = useQuery({
    queryKey: ['fbAccounts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('facebook_ad_accounts')
        .select('*');
      
      if (error) throw error;
      return data || [];
    }
  });

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const renderFilters = () => (
    <div className="grid grid-cols-4 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">
          Nome
        </label>
        <Input
          placeholder="Filtrar por nome"
          className="bg-[#2a2f3d] border-gray-700 text-white"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">
          Status
        </label>
        <Select value={campaignStatus} onValueChange={(value: CampaignStatus) => setCampaignStatus(value)}>
          <SelectTrigger className={`bg-[#2a2f3d] border-gray-700 text-white ${
            campaignStatus === 'active' ? 'bg-[#3b82f6]/20 border-[#3b82f6]' :
            campaignStatus === 'paused' ? 'bg-gray-600/20 border-gray-600' :
            ''
          }`}>
            <SelectValue>
              {campaignStatus === 'all' && 'Todos'}
              {campaignStatus === 'active' && 'Ativos'}
              {campaignStatus === 'paused' && 'Pausados'}
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="bg-[#2a2f3d] border-gray-700">
            <SelectItem value="all" className="text-white hover:bg-[#3b4252]">
              Todos
            </SelectItem>
            <SelectItem value="active" className="text-white hover:bg-[#3b4252]">
              Ativos
            </SelectItem>
            <SelectItem value="paused" className="text-white hover:bg-[#3b4252]">
              Pausados
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">
          Período de Visualização
        </label>
        <DateRangePicker 
          value={dateRange}
          onChange={setDateRange}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">
          Conta de Anúncio
        </label>
        <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
          <SelectTrigger className="bg-[#2a2f3d] border-gray-700 text-white">
            <SelectValue placeholder="Qualquer">
              {selectedAccountId === 'any' 
                ? 'Qualquer' 
                : accounts?.find(acc => acc.id === selectedAccountId)?.account_name || 'Conta selecionada'}
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="bg-[#2a2f3d] border-gray-700">
            <SelectItem value="any" className="text-white hover:bg-[#3b4252]">
              Qualquer
            </SelectItem>
            {accounts?.map((account) => (
              <SelectItem 
                key={account.id} 
                value={account.id}
                className="text-white hover:bg-[#3b4252]"
              >
                {account.account_name || `Conta ${account.account_id}`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#1a1f2e] text-white">
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <nav className="border-b border-gray-700">
          <div className="container mx-auto">
            <TabsList className="h-16 bg-transparent">
              <TabsTrigger 
                value="accounts"
                className="data-[state=active]:text-[#3b82f6] data-[state=active]:border-b-2 data-[state=active]:border-[#3b82f6] px-4"
              >
                <Settings className="w-4 h-4 mr-2" />
                Contas
              </TabsTrigger>
              <TabsTrigger 
                value="campaigns"
                className="data-[state=active]:text-[#3b82f6] data-[state=active]:border-b-2 data-[state=active]:border-[#3b82f6] px-4"
              >
                <ArrowUp className="w-4 h-4 mr-2" />
                Campanhas
              </TabsTrigger>
              <TabsTrigger 
                value="adsets"
                className="data-[state=active]:text-[#3b82f6] data-[state=active]:border-b-2 data-[state=active]:border-[#3b82f6] px-4"
              >
                <Layers className="w-4 h-4 mr-2" />
                Conjuntos
              </TabsTrigger>
              <TabsTrigger 
                value="ads"
                className="data-[state=active]:text-[#3b82f6] data-[state=active]:border-b-2 data-[state=active]:border-[#3b82f6] px-4"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Anúncios
              </TabsTrigger>
            </TabsList>
          </div>
        </nav>

        <div className="container mx-auto py-6 space-y-6">
          <TabsContent value="accounts">
            <AccountsList />
          </TabsContent>

          <TabsContent value="campaigns">
            {showAlert && (
              <Alert className="bg-[#2a2f3d] border-none text-orange-400 mb-4">
                <AlertDescription className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">Filtro de Período de Visualização</p>
                    <p className="text-sm mt-1">
                      Exibimos apenas campanhas com gastos ou criadas no período selecionado. Se não encontrar alguma campanha, ajuste o intervalo de datas.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowAlert(false)}
                    className="text-orange-400 hover:text-orange-300"
                  >
                    ×
                  </button>
                </AlertDescription>
              </Alert>
            )}

            {renderFilters()}

            <div className="bg-[#2a2f3d] rounded-lg p-4 mt-4">
              <CampaignsList 
                dateRange={dateRange} 
                campaignStatus={campaignStatus}
                selectedAccountId={selectedAccountId === 'any' ? undefined : selectedAccountId}
                onTabChange={handleTabChange}
              />
            </div>
          </TabsContent>

          <TabsContent value="adsets">
            {renderFilters()}
            
            <div className="bg-[#2a2f3d] rounded-lg p-4 mt-4">
              <AdSetsList 
                dateRange={dateRange}
                selectedAccountId={selectedAccountId === 'any' ? undefined : selectedAccountId}
                onTabChange={handleTabChange}
              />
            </div>
          </TabsContent>

          <TabsContent value="ads">
            <div className="text-center py-8 text-gray-400">
              Em desenvolvimento
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default Dashboard;