import React from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { MetricValue } from "@/components/facebook/MetricValue";
import type { Metric } from "./MetricSelector";
import { cn } from "@/lib/utils";

interface CampaignRowProps {
  campaign: any;
  metrics: Metric[];
  isSelected: boolean;
  onClick: () => void;
}

export const CampaignRow = ({ campaign, metrics, isSelected, onClick }: CampaignRowProps) => {
  return (
    <TableRow 
      className={cn(
        "cursor-pointer transition-colors border-b border-primary/20",
        isSelected
          ? "bg-[#3b82f6]/10" 
          : "hover:bg-[#2f3850]"
      )}
      onClick={onClick}
    >
      {metrics.map((metric, index) => (
        <TableCell 
          key={metric.id} 
          className={cn(
            "text-gray-400 whitespace-nowrap",
            ['name', 'status', 'objective'].includes(metric.field) ? "text-left" : "text-right pr-4",
            index !== metrics.length - 1 && "border-r border-primary/20"
          )}
        >
          <MetricValue value={campaign[metric.field]} metric={metric} />
        </TableCell>
      ))}
    </TableRow>
  );
};