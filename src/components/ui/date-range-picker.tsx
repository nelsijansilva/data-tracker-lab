import * as React from "react";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DateRangePresets, presets } from "./date-picker/DateRangePresets";
import { TimeInputs } from "./date-picker/TimeInputs";

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

  const handlePresetChange = (presetId: string) => {
    setSelectedPreset(presetId);
    const preset = presets.find(p => p.id === presetId);
    if (preset) {
      const range = preset.getValue();
      if (range) {
        onChange(range);
        if (presetId !== 'custom') {
          setIsOpen(false);
        }
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
              "w-full justify-start text-left font-normal bg-[#1a1f2e] border-gray-700 text-white hover:bg-[#2a2f3d]",
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
        <PopoverContent className="w-auto p-0 bg-[#2a2f3d] border-gray-700" align="start">
          <div className="p-4 space-y-4">
            <DateRangePresets
              value={selectedPreset}
              onChange={handlePresetChange}
            />

            <Calendar
              initialFocus
              mode="range"
              defaultMonth={value?.from}
              selected={value}
              onSelect={handleDateRangeChange}
              numberOfMonths={2}
              locale={ptBR}
              className="bg-[#2a2f3d] text-white rounded-md border-gray-700"
              classNames={{
                day_selected: "bg-[#3b82f6] text-white hover:bg-[#3b82f6] hover:text-white",
                day_today: "bg-accent text-accent-foreground",
                day_range_middle: "bg-[#3b82f6]/20 text-white",
                day_range_start: "bg-[#3b82f6] text-white hover:bg-[#3b82f6] hover:text-white",
                day_range_end: "bg-[#3b82f6] text-white hover:bg-[#3b82f6] hover:text-white",
                day: "text-white hover:bg-[#3b4252] hover:text-white focus:bg-[#3b4252] focus:text-white",
                day_disabled: "text-gray-500",
                nav_button_previous: "text-white hover:bg-[#3b4252]",
                nav_button_next: "text-white hover:bg-[#3b4252]",
                caption: "text-white",
              }}
            />

            <TimeInputs
              fromTime={fromTime}
              toTime={toTime}
              onFromTimeChange={(time) => handleTimeChange(time, 'from')}
              onToTimeChange={(time) => handleTimeChange(time, 'to')}
            />
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
