import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function StatCard({
  label,
  value,
  icon: Icon,
  hint,
  trend,
}: {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  hint?: string;
  trend?: "up" | "down" | "flat";
}) {
  const trendColor =
    trend === "up"
      ? "text-emerald-600 dark:text-emerald-400"
      : trend === "down"
        ? "text-red-600 dark:text-red-400"
        : "text-muted-foreground";
  return (
    <Card>
      <CardContent className="flex items-start justify-between gap-4 p-5">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="text-2xl font-semibold tracking-tight">{value}</p>
          {hint ? <p className={`text-xs ${trendColor}`}>{hint}</p> : null}
        </div>
        {Icon ? (
          <div className="flex size-10 shrink-0 items-center justify-center bg-muted text-muted-foreground">
            <Icon className="size-5" />
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
