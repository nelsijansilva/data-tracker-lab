import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from "@/components/ui/table";
import { MetricValue } from "@/components/facebook/MetricValue";
import { calculateMetricTotals } from "@/utils/metricCalculations";
import { cn } from "@/lib/utils";
import type { Metric } from "./MetricSelector";

interface MetricsTableProps {
  data: any[];
  metrics: Metric[];
  onRowClick?: (id: string) => void;
  selectedId?: string | null;
  getRowId: (item: any) => string;
}

export const MetricsTable = ({ 
  data, 
  metrics, 
  onRowClick, 
  selectedId,
  getRowId 
}: MetricsTableProps) => {
  const totals = calculateMetricTotals(data, metrics);

  return (
    <Table>
      <TableHeader>
        <TableRow className="border-b-2 border-primary/50">
          {metrics.map((metric, index) => (
            <TableHead 
              key={metric.id} 
              className={cn(
                "text-gray-400",
                index !== metrics.length - 1 && "border-r border-primary/20"
              )}
            >
              {metric.name.toUpperCase()}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((item: any) => (
          <TableRow 
            key={getRowId(item)}
            className={cn(
              "cursor-pointer transition-colors border-b border-primary/20",
              selectedId === getRowId(item)
                ? "bg-[#3b82f6]/10" 
                : "hover:bg-[#2f3850]"
            )}
            onClick={() => onRowClick?.(getRowId(item))}
          >
            {metrics.map((metric, index) => (
              <TableCell 
                key={metric.id} 
                className={cn(
                  "text-gray-400",
                  index !== metrics.length - 1 && "border-r border-primary/20"
                )}
              >
                <MetricValue value={item[metric.field]} metric={metric} />
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow className="border-t-2 border-primary/50 font-semibold">
          {metrics.map((metric, index) => (
            <TableCell 
              key={metric.id} 
              className={cn(
                "text-primary",
                index !== metrics.length - 1 && "border-r border-primary/20"
              )}
            >
              <MetricValue value={totals[metric.field]} metric={metric} />
            </TableCell>
          ))}
        </TableRow>
      </TableFooter>
    </Table>
  );
};