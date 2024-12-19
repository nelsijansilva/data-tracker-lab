import * as React from "react";
import { CalendarIcon, Check } from "lucide-react";
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
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";

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
      label: 'Hoje',
      getValue: () => ({
        from: startOfDay(new Date()),
        to: endOfDay(new Date())
      }),
    },
    {
      label: 'Ontem',
      getValue: () => ({
        from: startOfDay(subDays(new Date(), 1)),
        to: endOfDay(subDays(new Date(), 1))
      }),
    },
    {
      label: 'Últimos 7 dias',
      getValue: () => ({
        from: subDays(new Date(), 6),
        to: new Date()
      }),
    },
    {
      label: 'Últimos 14 dias',
      getValue: () => ({
        from: subDays(new Date(), 13),
        to: new Date()
      }),
    },
    {
      label: 'Últimos 30 dias',
      getValue: () => ({
        from: subDays(new Date(), 29),
        to: new Date()
      }),
    },
    {
      label: 'Este mês',
      getValue: () => ({
        from: startOfMonth(new Date()),
        to: endOfMonth(new Date())
      }),
    },
    {
      label: 'Todo período',
      getValue: () => ({
        from: subDays(new Date(), 365),
        to: new Date()
      }),
    },
  ];

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-[300px] justify-start text-left font-normal",
              !value && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value?.from ? (
              value.to ? (
                <>
                  {format(value.from, "dd/MM/yyyy", { locale: ptBR })} -{" "}
                  {format(value.to, "dd/MM/yyyy", { locale: ptBR })}
                </>
              ) : (
                format(value.from, "dd/MM/yyyy", { locale: ptBR })
              )
            ) : (
              <span>Selecione um período</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="space-y-4 p-4">
            <Command shouldFilter={false}>
              <CommandGroup heading="Períodos predefinidos">
                {presets.map((preset) => (
                  <CommandItem
                    key={preset.label}
                    value={preset.label}
                    onSelect={() => {
                      onChange(preset.getValue());
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        JSON.stringify(value) === JSON.stringify(preset.getValue())
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                    {preset.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
            <div className="border-t pt-4">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={value?.from}
                selected={value}
                onSelect={onChange}
                numberOfMonths={2}
                locale={ptBR}
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}