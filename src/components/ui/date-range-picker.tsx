import * as React from "react";
import { CalendarIcon } from "lucide-react";
import { addDays, endOfMonth, startOfMonth, format, startOfDay, endOfDay, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DateRangePickerProps {
  value: DateRange;
  onChange: (value: DateRange) => void;
  className?: string;
}

export function DateRangePicker({
  value,
  onChange,
  className,
}: DateRangePickerProps) {
  const [open, setOpen] = React.useState(false);

  const presets = [
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
      getValue: () => value,
    },
  ];

  const handlePresetChange = (presetId: string) => {
    const preset = presets.find(p => p.id === presetId);
    if (preset) {
      onChange(preset.getValue());
    }
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <Select onValueChange={handlePresetChange}>
        <SelectTrigger className="w-[240px] bg-[#2a2f3d] border-gray-700 text-white">
          <SelectValue placeholder="Selecione um período" />
        </SelectTrigger>
        <SelectContent>
          {presets.map((preset) => (
            <SelectItem key={preset.id} value={preset.id}>
              {preset.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {value?.from && value?.to && (
        <div className="text-sm text-gray-400">
          {format(value.from, "dd/MM/yyyy", { locale: ptBR })} -{" "}
          {format(value.to, "dd/MM/yyyy", { locale: ptBR })}
        </div>
      )}
    </div>
  );
};