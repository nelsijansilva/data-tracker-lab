import { useQuery } from "@tanstack/react-query";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { DateRange } from "react-day-picker";
import { DashboardTabs } from "@/components/facebook/DashboardTabs";
import { DashboardFilters } from "@/components/facebook/DashboardFilters";

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

  return (
    <div className="min-h-screen bg-[#1a1f2e] text-white">
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

      <DashboardFilters 
        campaignStatus={campaignStatus}
        setCampaignStatus={setCampaignStatus}
        dateRange={dateRange}
        setDateRange={setDateRange}
        selectedAccountId={selectedAccountId}
        setSelectedAccountId={setSelectedAccountId}
        accounts={accounts || []}
      />

      <DashboardTabs 
        activeTab={activeTab}
        onTabChange={handleTabChange}
        dateRange={dateRange}
        campaignStatus={campaignStatus}
        selectedAccountId={selectedAccountId === 'any' ? undefined : selectedAccountId}
      />
    </div>
  );
};

export default Dashboard;