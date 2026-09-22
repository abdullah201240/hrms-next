import type { LucideIcon } from "lucide-react";
import { ArrowUp, ArrowDown, Minus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export type StatColor =
  | "blue"
  | "emerald"
  | "violet"
  | "purple"
  | "amber"
  | "rose"
  | "indigo"
  | "teal";

const PALETTES: Record<
  StatColor,
  {
    cardBg: string;
    iconBg: string;
  }
> = {
  blue: {
    cardBg: "bg-[#f0f7ff] dark:bg-sky-950/20",
    iconBg: "bg-[#dbeafe] text-[#2563eb] dark:bg-sky-900/50 dark:text-sky-300",
  },
  emerald: {
    cardBg: "bg-[#f0fdf4] dark:bg-emerald-950/20",
    iconBg: "bg-[#dcfce7] text-[#16a34a] dark:bg-emerald-900/50 dark:text-emerald-300",
  },
  rose: {
    cardBg: "bg-[#fff1f2] dark:bg-rose-950/20",
    iconBg: "bg-[#ffe4e6] text-[#e11d48] dark:bg-rose-900/50 dark:text-rose-300",
  },
  amber: {
    cardBg: "bg-[#fffbeb] dark:bg-amber-950/20",
    iconBg: "bg-[#fef3c7] text-[#d97706] dark:bg-amber-900/50 dark:text-amber-300",
  },
  purple: {
    cardBg: "bg-[#faf5ff] dark:bg-purple-950/20",
    iconBg: "bg-[#f3e8ff] text-[#9333ea] dark:bg-purple-900/50 dark:text-purple-300",
  },
  violet: {
    cardBg: "bg-[#f5f3ff] dark:bg-violet-950/20",
    iconBg: "bg-[#ede9fe] text-[#7c3aed] dark:bg-violet-900/50 dark:text-violet-300",
  },
  indigo: {
    cardBg: "bg-[#eef2ff] dark:bg-indigo-950/20",
    iconBg: "bg-[#e0e7ff] text-[#4f46e5] dark:bg-indigo-900/50 dark:text-indigo-300",
  },
  teal: {
    cardBg: "bg-[#f0fdfa] dark:bg-teal-950/20",
    iconBg: "bg-[#ccfbf1] text-[#0d9488] dark:bg-teal-900/50 dark:text-teal-300",
  },
};

function detectColor(label: string): StatColor {
  const l = label.toLowerCase();
  if (/absent|absence|block|reject|cancel|risk/.test(l)) return "rose";
  if (/late/.test(l)) return "purple";
  if (/present|approved|paid|gross|net|holiday|published/.test(l)) return "emerald";
  if (/leave|half day/.test(l)) return "amber";
  if (/pending|awaiting|approval|vacation/.test(l)) return "violet";
  if (/employee|headcount|user|people|allocation/.test(l)) return "blue";
  if (/hour|timesheet|slip|period|roster|logged/.test(l)) return "indigo";
  if (/policy|structure|type|claim|request/.test(l)) return "teal";

  const FALLBACKS: StatColor[] = ["blue", "emerald", "violet", "amber", "indigo", "teal"];
  let hash = 0;
  for (let i = 0; i < l.length; i++) {
    hash = (hash << 5) - hash + l.charCodeAt(i);
    hash |= 0;
  }
  return FALLBACKS[Math.abs(hash) % FALLBACKS.length];
}

export function StatCard({
  label,
  value,
  icon: Icon,
  hint,
  subtext,
  trend,
  color,
}: {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  hint?: string;
  subtext?: string;
  trend?: "up" | "down" | "flat";
  color?: StatColor;
}) {
  const palette = PALETTES[color ?? detectColor(label)];

  return (
    <Card className={`group relative overflow-hidden transition-colors ${palette.cardBg}`}>
      <CardContent className="flex items-start gap-4 p-4 sm:p-5">
        {Icon ? (
          <div
            className={`flex size-11 shrink-0 items-center justify-center ${palette.iconBg}`}
          >
            <Icon className="size-5 stroke-[2]" />
          </div>
        ) : null}

        <div className="flex min-h-[78px] min-w-0 flex-1 flex-col justify-between self-stretch">
          <div className="space-y-0.5">
            <p className="text-xs font-normal text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {value}
            </p>
            {subtext ? (
              <p className="text-[11px] text-muted-foreground">{subtext}</p>
            ) : null}
          </div>

          {hint || trend ? (
            <div className="flex items-center gap-1 pt-1 text-xs font-semibold">
              {trend === "up" ? (
                <span className="flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400">
                  <ArrowUp className="size-3.5 stroke-[2.5]" />
                  {hint}
                </span>
              ) : trend === "down" ? (
                <span className="flex items-center gap-0.5 text-rose-500 dark:text-rose-400">
                  <ArrowDown className="size-3.5 stroke-[2.5]" />
                  {hint}
                </span>
              ) : trend === "flat" ? (
                <span className="flex items-center gap-0.5 text-amber-600 dark:text-amber-400">
                  <Minus className="size-3.5 stroke-[2.5]" />
                  {hint}
                </span>
              ) : (
                <span className="text-muted-foreground">{hint}</span>
              )}
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
