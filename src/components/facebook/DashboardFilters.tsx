import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { DateRange } from "react-day-picker";

interface DashboardFiltersProps {
  campaignStatus: 'all' | 'active' | 'paused';
  setCampaignStatus: (status: 'all' | 'active' | 'paused') => void;
  dateRange: DateRange;
  setDateRange: (range: DateRange) => void;
  selectedAccountId: string;
  setSelectedAccountId: (id: string) => void;
  accounts: any[];
}

export const DashboardFilters = ({
  campaignStatus,
  setCampaignStatus,
  dateRange,
  setDateRange,
  selectedAccountId,
  setSelectedAccountId,
  accounts
}: DashboardFiltersProps) => {
  return (
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
        <Select value={campaignStatus} onValueChange={(value: 'all' | 'active' | 'paused') => setCampaignStatus(value)}>
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
};