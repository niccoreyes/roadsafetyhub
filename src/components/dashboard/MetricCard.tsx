import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LucideIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface MetricCardProps {
  title: string;
  value: number;
  unit: string;
  icon: LucideIcon;
  description?: string;
  tooltip?: string;  // New property for tooltip content
  isLoading?: boolean;
  // Rate multiplier dropdown properties
  showMultiplierDropdown?: boolean;
  multiplierOptions?: { value: string; label: string }[];
  multiplierValue?: string;
  onMultiplierChange?: (value: string) => void;
}

export function MetricCard({
  title,
  value,
  unit,
  icon: Icon,
  description,
  tooltip,
  isLoading,
  showMultiplierDropdown = false,
  multiplierOptions = [
    { value: "100", label: "per 100" },
    { value: "1000", label: "per 1k" },
    { value: "10000", label: "per 10k" },
    { value: "100000", label: "per 100k" },
    { value: "1000000", label: "per 1M" },
  ],
  multiplierValue = "100000", // Default to per 100k
  onMultiplierChange
}: MetricCardProps) {
  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {tooltip ? (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger className="cursor-help">
                  {title}
                </TooltipTrigger>
                <TooltipContent>
                  <p>{tooltip}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            <span>{title}</span>
          )}
        </CardTitle>
        {tooltip ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Icon className="h-4 w-4 text-primary cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p>{tooltip}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <Icon className="h-4 w-4 text-primary" />
        )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-8 w-24 bg-muted animate-pulse rounded" />
        ) : (
          <>
            <div className="flex flex-wrap items-baseline justify-between">
              <div className="text-2xl font-bold text-foreground">
                {value.toFixed(2)}
                <span className="text-sm font-normal text-muted-foreground ml-1">
                  {unit}
                </span>
              </div>
              {showMultiplierDropdown && (
                <div className="mt-1">
                  <Select value={multiplierValue} onValueChange={onMultiplierChange}>
                    <SelectTrigger className="h-6 w-[100px] text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {multiplierOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value} className="text-xs">
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            {description && (
              <p className="text-xs text-muted-foreground mt-1">
                {description}
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
