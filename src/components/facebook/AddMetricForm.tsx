import React from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface AddMetricFormProps {
  newMetricName: string;
  newMetricField: string;
  onNameChange: (value: string) => void;
  onFieldChange: (value: string) => void;
  onSubmit: () => void;
}

export const AddMetricForm = ({
  newMetricName,
  newMetricField,
  onNameChange,
  onFieldChange,
  onSubmit,
}: AddMetricFormProps) => {
  return (
    <div className="space-y-4 p-4 rounded-lg border border-gray-700 bg-[#2a2f3d]">
      <Input
        placeholder="Nome da métrica"
        value={newMetricName}
        onChange={(e) => onNameChange(e.target.value)}
        className="bg-[#1a1f2e] border-gray-700 text-white"
      />
      <Input
        placeholder="Campo da métrica"
        value={newMetricField}
        onChange={(e) => onFieldChange(e.target.value)}
        className="bg-[#1a1f2e] border-gray-700 text-white"
      />
      <Button
        onClick={onSubmit}
        disabled={!newMetricName || !newMetricField}
        className="w-full"
      >
        Adicionar
      </Button>
    </div>
  );
};