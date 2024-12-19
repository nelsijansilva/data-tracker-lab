import { Input } from "@/components/ui/input";

interface TimeInputsProps {
  fromTime: string;
  toTime: string;
  onFromTimeChange: (time: string) => void;
  onToTimeChange: (time: string) => void;
}

export function TimeInputs({ fromTime, toTime, onFromTimeChange, onToTimeChange }: TimeInputsProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="text-sm text-gray-500 mb-1 block">Horário inicial</label>
        <Input
          type="time"
          value={fromTime}
          onChange={(e) => onFromTimeChange(e.target.value)}
          className="bg-[#2a2f3d] border-gray-700 text-white"
        />
      </div>
      <div>
        <label className="text-sm text-gray-500 mb-1 block">Horário final</label>
        <Input
          type="time"
          value={toTime}
          onChange={(e) => onToTimeChange(e.target.value)}
          className="bg-[#2a2f3d] border-gray-700 text-white"
        />
      </div>
    </div>
  );
}