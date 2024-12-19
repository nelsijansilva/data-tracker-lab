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
import { Input } from "@/components/ui/input";

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
  const [isOpen, setIsOpen] = React.useState(false);
  const [selectedPreset, setSelectedPreset] = React.useState<string>("");
  const [fromTime, setFromTime] = React.useState("00:00");
  const [toTime, setToTime] = React.useState("23:59");

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
    setSelectedPreset(presetId);
    const preset = presets.find(p => p.id === presetId);
    if (preset) {
      const range = preset.getValue();
      onChange(range);
      if (presetId !== 'custom') {
        setIsOpen(false);
      }
    }
  };

  const handleDateRangeChange = (newRange: DateRange | undefined) => {
    if (newRange?.from && newRange?.to) {
      const [fromHours, fromMinutes] = fromTime.split(':').map(Number);
      const [toHours, toMinutes] = toTime.split(':').map(Number);

      const from = new Date(newRange.from);
      from.setHours(fromHours, fromMinutes);

      const to = new Date(newRange.to);
      to.setHours(toHours, toMinutes);

      onChange({ from, to });
    }
  };

  const handleTimeChange = (time: string, type: 'from' | 'to') => {
    if (type === 'from') {
      setFromTime(time);
    } else {
      setToTime(time);
    }

    if (value.from && value.to) {
      const [hours, minutes] = time.split(':').map(Number);
      const newDate = new Date(type === 'from' ? value.from : value.to);
      newDate.setHours(hours, minutes);

      onChange({
        from: type === 'from' ? newDate : value.from,
        to: type === 'to' ? newDate : value.to,
      });
    }
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal bg-[#2a2f3d] border-gray-700 text-white",
              !value && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value?.from ? (
              value.to ? (
                <>
                  {format(value.from, "dd/MM/yyyy HH:mm", { locale: ptBR })} -{" "}
                  {format(value.to, "dd/MM/yyyy HH:mm", { locale: ptBR })}
                </>
              ) : (
                format(value.from, "dd/MM/yyyy HH:mm", { locale: ptBR })
              )
            ) : (
              <span>Selecione um período</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Select value={selectedPreset} onValueChange={handlePresetChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione um período predefinido" />
            </SelectTrigger>
            <SelectContent>
              {presets.map((preset) => (
                <SelectItem key={preset.id} value={preset.id}>
                  {preset.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="p-4 space-y-4">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={value?.from}
              selected={value}
              onSelect={handleDateRangeChange}
              numberOfMonths={2}
              locale={ptBR}
            />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-500 mb-1 block">Horário inicial</label>
                <Input
                  type="time"
                  value={fromTime}
                  onChange={(e) => handleTimeChange(e.target.value, 'from')}
                  className="bg-[#2a2f3d] border-gray-700 text-white"
                />
              </div>
              <div>
                <label className="text-sm text-gray-500 mb-1 block">Horário final</label>
                <Input
                  type="time"
                  value={toTime}
                  onChange={(e) => handleTimeChange(e.target.value, 'to')}
                  className="bg-[#2a2f3d] border-gray-700 text-white"
                />
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}