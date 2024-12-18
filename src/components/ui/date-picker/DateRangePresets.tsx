import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DateRange } from "react-day-picker";
import { addDays, endOfMonth, startOfMonth, startOfDay, endOfDay, subDays } from "date-fns";

interface DateRangePresetsProps {
  value: string;
  onChange: (value: string) => void;
}

export const presets = [
  {
    id: 'today',
    label: 'Hoje',
    getValue: () => ({
      from: startOfDay(new Date()),
      to: endOfDay(new Date())
    }),
  },
  {
    id: 'yesterday',
    label: 'Ontem',
    getValue: () => ({
      from: startOfDay(subDays(new Date(), 1)),
      to: endOfDay(subDays(new Date(), 1))
    }),
  },
  {
    id: 'last7',
    label: 'Últimos 7 dias',
    getValue: () => ({
      from: subDays(new Date(), 6),
      to: new Date()
    }),
  },
  {
    id: 'thisMonth',
    label: 'Esse mês',
    getValue: () => ({
      from: startOfMonth(new Date()),
      to: endOfMonth(new Date())
    }),
  },
  {
    id: 'lastMonth',
    label: 'Mês passado',
    getValue: () => ({
      from: startOfMonth(subDays(new Date(), 30)),
      to: endOfMonth(subDays(new Date(), 30))
    }),
  },
  {
    id: 'custom',
    label: 'Personalizado',
    getValue: () => null,
  },
];

export function DateRangePresets({ value, onChange }: DateRangePresetsProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full bg-[#1a1f2e] text-white border-gray-700 hover:bg-[#2a2f3d]">
        <SelectValue placeholder="Selecione um período predefinido" />
      </SelectTrigger>
      <SelectContent className="bg-[#2a2f3d] border-gray-700">
        {presets.map((preset) => (
          <SelectItem 
            key={preset.id} 
            value={preset.id}
            className="text-white hover:bg-[#3b4252] focus:bg-[#3b4252] focus:text-white"
          >
            {preset.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}