import React from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { DateRange } from "react-day-picker";

interface SalesFiltersProps {
  nameFilter: string;
  setNameFilter: (value: string) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  dateRange: DateRange | undefined;
  setDateRange: (range: DateRange | undefined) => void;
  accountFilter: string;
  setAccountFilter: (value: string) => void;
  accounts: Array<{ id: string; account_name: string; platform: string }>;
}

export const SalesFilters = ({
  nameFilter,
  setNameFilter,
  statusFilter,
  setStatusFilter,
  dateRange,
  setDateRange,
  accountFilter,
  setAccountFilter,
  accounts
}: SalesFiltersProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">
          Nome
        </label>
        <Input
          placeholder="Filtrar por nome"
          value={nameFilter}
          onChange={(e) => setNameFilter(e.target.value)}
          className="bg-[#2a2f3d] border-gray-700 text-white"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">
          Status
        </label>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="bg-[#2a2f3d] border-gray-700 text-white">
            <SelectValue placeholder="Todos">
              {statusFilter === 'all' ? 'Todos' : statusFilter}
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="bg-[#2a2f3d] border-gray-700">
            <SelectItem value="all" className="text-white hover:bg-[#3b4252]">
              Todos
            </SelectItem>
            <SelectItem value="completed" className="text-white hover:bg-[#3b4252]">
              Completed
            </SelectItem>
            <SelectItem value="pending" className="text-white hover:bg-[#3b4252]">
              Pending
            </SelectItem>
            <SelectItem value="waiting_payment" className="text-white hover:bg-[#3b4252]">
              Waiting Payment
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">
          Período
        </label>
        <DateRangePicker 
          value={dateRange}
          onChange={setDateRange}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">
          Conta
        </label>
        <Select value={accountFilter} onValueChange={setAccountFilter}>
          <SelectTrigger className="bg-[#2a2f3d] border-gray-700 text-white">
            <SelectValue placeholder="Qualquer">
              {accountFilter === 'all' ? 'Qualquer' : 
                accounts.find(acc => acc.id === accountFilter)?.account_name || 'Conta selecionada'}
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="bg-[#2a2f3d] border-gray-700">
            <SelectItem value="all" className="text-white hover:bg-[#3b4252]">
              Qualquer
            </SelectItem>
            {accounts.map((account) => (
              <SelectItem 
                key={account.id} 
                value={account.id}
                className="text-white hover:bg-[#3b4252]"
              >
                {account.account_name} ({account.platform})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};