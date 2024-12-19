import { useQuery } from "@tanstack/react-query";
import { Settings, ArrowUp, ArrowDown, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CampaignsList } from "@/components/facebook/CampaignsList";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { DateRange } from "react-day-picker";

type CampaignStatus = 'all' | 'active' | 'paused';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("campaigns");
  const [showAlert, setShowAlert] = useState(true);
  const [campaignStatus, setCampaignStatus] = useState<CampaignStatus>('all');
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(),
    to: new Date(),
  });

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
      <div className="flex items-center justify-center h-screen">
        <p>Carregando...</p>
      </div>
    );
  }

  const tabs = [
    { id: 'accounts', label: 'Contas', icon: <Settings className="w-4 h-4" /> },
    { id: 'campaigns', label: 'Campanhas', icon: <ArrowUp className="w-4 h-4" /> },
    { id: 'adsets', label: 'Conjuntos', icon: <ArrowDown className="w-4 h-4" /> },
    { id: 'ads', label: 'Anúncios', icon: <RefreshCw className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-[#1a1f2e] text-white">
      {/* Navigation */}
      <nav className="border-b border-gray-700">
        <div className="container mx-auto">
          <div className="flex items-center justify-between h-16">
            <div className="flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2 font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'text-[#3b82f6] border-b-2 border-[#3b82f6]'
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto py-6 space-y-6">
        {/* Alert */}
        {showAlert && (
          <Alert className="bg-[#2a2f3d] border-none text-orange-400">
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

        {/* Filters */}
        <div className="grid grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Nome da Campanha
            </label>
            <Input
              placeholder="Filtrar por nome"
              className="bg-[#2a2f3d] border-gray-700 text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Status da Campanha
            </label>
            <Select value={campaignStatus} onValueChange={(value: CampaignStatus) => setCampaignStatus(value)}>
              <SelectTrigger className={`bg-[#2a2f3d] border-gray-700 text-white ${
                campaignStatus === 'active' ? 'bg-[#3b82f6]/20 border-[#3b82f6]' :
                campaignStatus === 'paused' ? 'bg-gray-600/20 border-gray-600' :
                ''
              }`}>
                <SelectValue>
                  {campaignStatus === 'all' && 'Todas as Campanhas'}
                  {campaignStatus === 'active' && 'Campanhas Ativas'}
                  {campaignStatus === 'paused' && 'Campanhas Pausadas'}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-[#2a2f3d] border-gray-700">
                <SelectItem value="all" className="text-white hover:bg-[#3b4252]">
                  Todas as Campanhas
                </SelectItem>
                <SelectItem value="active" className="text-white hover:bg-[#3b4252]">
                  Campanhas Ativas
                </SelectItem>
                <SelectItem value="paused" className="text-white hover:bg-[#3b4252]">
                  Campanhas Pausadas
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
            <Select>
              <SelectTrigger className="bg-[#2a2f3d] border-gray-700 text-white">
                <SelectValue placeholder="Qualquer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Qualquer</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Campaigns List */}
        <div className="bg-[#2a2f3d] rounded-lg p-4">
          <CampaignsList dateRange={dateRange} campaignStatus={campaignStatus} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;