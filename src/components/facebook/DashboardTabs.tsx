import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, ArrowUp, Layers, RefreshCw, LineChart, List, Link, ShoppingCart } from "lucide-react";
import { AccountsList } from "./AccountsList";
import { CampaignsList } from "./CampaignsList";
import { AdSetsList } from "./AdSetsList";
import { AdsList } from "./AdsList";
import { CustomMetricsDashboard } from "./CustomMetricsDashboard";
import { LogsTab } from "./LogsTab";
import { IntegrationsTab } from "./TictoIntegration";
import { SalesList } from "./cartpanda/SalesList";
import { DateRange } from "react-day-picker";
import { useEffect } from "react";

interface DashboardTabsProps {
  activeTab: string;
  onTabChange: (value: string) => void;
  dateRange: DateRange;
  campaignStatus: 'all' | 'active' | 'paused';
  selectedAccountId?: string;
}

export const DashboardTabs = ({
  activeTab,
  onTabChange,
  dateRange,
  campaignStatus,
  selectedAccountId
}: DashboardTabsProps) => {
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      if (event.message.includes('ResizeObserver')) {
        event.stopImmediatePropagation();
      }
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  return (
    <Tabs 
      value={activeTab} 
      onValueChange={onTabChange} 
      className="w-full"
      defaultValue={activeTab}
    >
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
            <TabsTrigger 
              value="metrics"
              className="data-[state=active]:text-[#3b82f6] data-[state=active]:border-b-2 data-[state=active]:border-[#3b82f6] px-4"
            >
              <LineChart className="w-4 h-4 mr-2" />
              Métricas
            </TabsTrigger>
            <TabsTrigger 
              value="sales"
              className="data-[state=active]:text-[#3b82f6] data-[state=active]:border-b-2 data-[state=active]:border-[#3b82f6] px-4"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Vendas
            </TabsTrigger>
            <TabsTrigger 
              value="logs"
              className="data-[state=active]:text-[#3b82f6] data-[state=active]:border-b-2 data-[state=active]:border-[#3b82f6] px-4"
            >
              <List className="w-4 h-4 mr-2" />
              Logs
            </TabsTrigger>
            <TabsTrigger 
              value="integrations"
              className="data-[state=active]:text-[#3b82f6] data-[state=active]:border-b-2 data-[state=active]:border-[#3b82f6] px-4"
            >
              <Link className="w-4 h-4 mr-2" />
              Integrações
            </TabsTrigger>
          </TabsList>
        </div>
      </nav>

      <div className="container mx-auto py-6 space-y-6">
        <TabsContent value="accounts" className="mt-0">
          <AccountsList />
        </TabsContent>

        <TabsContent value="campaigns" className="mt-0">
          <div className="bg-[#2a2f3d] rounded-lg p-4">
            <CampaignsList 
              dateRange={dateRange} 
              campaignStatus={campaignStatus}
              selectedAccountId={selectedAccountId}
              onTabChange={onTabChange}
            />
          </div>
        </TabsContent>

        <TabsContent value="adsets" className="mt-0">
          <div className="bg-[#2a2f3d] rounded-lg p-4">
            <AdSetsList 
              dateRange={dateRange}
              selectedAccountId={selectedAccountId}
              onTabChange={onTabChange}
            />
          </div>
        </TabsContent>

        <TabsContent value="ads" className="mt-0">
          <div className="bg-[#2a2f3d] rounded-lg p-4">
            <AdsList 
              dateRange={dateRange}
              selectedAccountId={selectedAccountId}
            />
          </div>
        </TabsContent>

        <TabsContent value="metrics" className="mt-0">
          <div className="bg-[#2a2f3d] rounded-lg p-4">
            <CustomMetricsDashboard />
          </div>
        </TabsContent>

        <TabsContent value="sales" className="mt-0">
          <div className="bg-[#2a2f3d] rounded-lg p-4">
            <SalesList />
          </div>
        </TabsContent>

        <TabsContent value="logs" className="mt-0">
          <div className="bg-[#2a2f3d] rounded-lg p-4">
            <LogsTab />
          </div>
        </TabsContent>

        <TabsContent value="integrations" className="mt-0">
          <div className="bg-[#2a2f3d] rounded-lg p-4">
            <IntegrationsTab />
          </div>
        </TabsContent>
      </div>
    </Tabs>
  );
};