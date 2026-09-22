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
    cardBorder: string;
    iconBg: string;
    spark: string;
  }
> = {
  emerald: {
    cardBg: "bg-[#f2faf6] dark:bg-[#062c20]/60",
    cardBorder: "border-[#d7f3e4] dark:border-emerald-500/30",
    iconBg: "bg-[#ddf7ea] text-[#10b981] dark:bg-emerald-500/20 dark:text-emerald-400 dark:border dark:border-emerald-500/30",
    spark: "text-[#10b981] dark:text-emerald-400",
  },
  rose: {
    cardBg: "bg-[#fef2f2] dark:bg-[#310c14]/60",
    cardBorder: "border-[#fee2e2] dark:border-rose-500/30",
    iconBg: "bg-[#ffe4e6] text-[#f43f5e] dark:bg-rose-500/20 dark:text-rose-400 dark:border dark:border-rose-500/30",
    spark: "text-[#f43f5e] dark:text-rose-400",
  },
  amber: {
    cardBg: "bg-[#fffbeb] dark:bg-[#2e1d05]/60",
    cardBorder: "border-[#fef3c7] dark:border-amber-500/30",
    iconBg: "bg-[#fef3c7] text-[#f59e0b] dark:bg-amber-500/20 dark:text-amber-400 dark:border dark:border-amber-500/30",
    spark: "text-[#f59e0b] dark:text-amber-400",
  },
  purple: {
    cardBg: "bg-[#faf5ff] dark:bg-[#230d3e]/60",
    cardBorder: "border-[#f3e8ff] dark:border-purple-500/30",
    iconBg: "bg-[#ede9fe] text-[#8b5cf6] dark:bg-purple-500/20 dark:text-purple-400 dark:border dark:border-purple-500/30",
    spark: "text-[#8b5cf6] dark:text-purple-400",
  },
  blue: {
    cardBg: "bg-[#f0f7ff] dark:bg-[#0c224a]/60",
    cardBorder: "border-[#dbeafe] dark:border-blue-500/30",
    iconBg: "bg-[#dbeafe] text-[#2563eb] dark:bg-blue-500/20 dark:text-blue-400 dark:border dark:border-blue-500/30",
    spark: "text-[#2563eb] dark:text-blue-400",
  },
  violet: {
    cardBg: "bg-[#f5f3ff] dark:bg-[#200d44]/60",
    cardBorder: "border-[#ede9fe] dark:border-violet-500/30",
    iconBg: "bg-[#ede9fe] text-[#7c3aed] dark:bg-violet-500/20 dark:text-violet-400 dark:border dark:border-violet-500/30",
    spark: "text-[#7c3aed] dark:text-violet-400",
  },
  indigo: {
    cardBg: "bg-[#eef2ff] dark:bg-[#131b4d]/60",
    cardBorder: "border-[#e0e7ff] dark:border-indigo-500/30",
    iconBg: "bg-[#e0e7ff] text-[#4f46e5] dark:bg-indigo-500/20 dark:text-indigo-400 dark:border dark:border-indigo-500/30",
    spark: "text-[#4f46e5] dark:text-indigo-400",
  },
  teal: {
    cardBg: "bg-[#f0fdfa] dark:bg-[#062d29]/60",
    cardBorder: "border-[#ccfbf1] dark:border-teal-500/30",
    iconBg: "bg-[#ccfbf1] text-[#0d9488] dark:bg-teal-500/20 dark:text-teal-400 dark:border dark:border-teal-500/30",
    spark: "text-[#0d9488] dark:text-teal-400",
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

/** Generates a smooth cubic bezier SVG path across coordinate points */
function getSmoothPath(coords: { x: number; y: number }[]): string {
  if (coords.length === 0) return "";
  if (coords.length === 1) return `M ${coords[0].x} ${coords[0].y}`;
  let d = `M ${coords[0].x.toFixed(1)} ${coords[0].y.toFixed(1)}`;
  for (let i = 0; i < coords.length - 1; i++) {
    const p0 = coords[i === 0 ? 0 : i - 1];
    const p1 = coords[i];
    const p2 = coords[i + 1];
    const p3 = coords[i + 2 < coords.length ? i + 2 : coords.length - 1];

    const cp1x = p1.x + (p2.x - p0.x) / 5;
    const cp1y = p1.y + (p2.y - p0.y) / 5;
    const cp2x = p2.x - (p3.x - p1.x) / 5;
    const cp2y = p2.y - (p3.y - p1.y) / 5;

    d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  return d;
}

/** Inline sparkline rendered as a smooth wave curve. */
function Sparkline({
  data,
  path,
  className,
}: {
  data?: number[];
  path?: string;
  className?: string;
}) {
  const w = 84;
  const h = 26;
  let d = path;
  if (!d && data && data.length >= 2) {
    const min = Math.min(...data);
    const max = Math.max(...data);
    const span = max - min || 1;
    const coords = data.map((v, i) => ({
      x: (i / (data.length - 1)) * (w - 8) + 4,
      y: h - ((v - min) / span) * (h - 8) - 4,
    }));
    d = getSmoothPath(coords);
  }
  if (!d) return null;

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className={`h-4 w-16 shrink-0 ${className ?? ""}`}
      fill="none"
    >
      <path
        d={d}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function StatCard({
  label,
  value,
  icon: Icon,
  hint,
  subtext,
  trend,
  color,
  trendColor,
  spark,
  sparkPath,
}: {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  hint?: string;
  subtext?: string;
  trend?: "up" | "down" | "flat";
  color?: StatColor;
  trendColor?: "emerald" | "rose" | "amber" | "purple" | "neutral";
  spark?: number[];
  sparkPath?: string;
}) {
  const palette = PALETTES[color ?? detectColor(label)];
  const isNeutral =
    trendColor === "neutral" ||
    (!trendColor && (hint === "0%" || hint === "0" || hint === "—"));

  const trendColorClass =
    trendColor === "emerald"
      ? "text-emerald-500 dark:text-emerald-400"
      : trendColor === "rose"
      ? "text-rose-500 dark:text-rose-400"
      : trendColor === "amber"
      ? "text-amber-500 dark:text-amber-400"
      : trendColor === "purple"
      ? "text-purple-500 dark:text-purple-400"
      : isNeutral
      ? "text-slate-800 dark:text-slate-200"
      : trend === "up"
      ? "text-emerald-500 dark:text-emerald-400"
      : trend === "down"
      ? "text-rose-500 dark:text-rose-400"
      : "text-amber-500 dark:text-amber-400";

  return (
    <Card
      className="group relative overflow-hidden rounded-2xl border border-slate-200/70 bg-card shadow-[0_2px_8px_rgba(0,0,0,0.02)] dark:border-border dark:shadow-[0_8px_24px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.06)] transition-all"
    >
      <CardContent className="flex flex-col gap-1.5 p-3">
        <div className="flex items-center gap-2.5">
          {Icon ? (
            <div
              className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${palette.iconBg}`}
            >
              <Icon className="size-4.5 stroke-[2]" />
            </div>
          ) : null}

          <div className="min-w-0 space-y-0.5">
            <p className="truncate text-xs font-medium text-slate-500 dark:text-slate-400">{label}</p>
            <p className="text-4xl font-bold leading-none tracking-tight text-slate-900 dark:text-slate-100">
              {value}
            </p>
            {subtext ? (
              <p className="text-[11px] text-muted-foreground">{subtext}</p>
            ) : null}
          </div>
        </div>

        {(hint || trend || spark || sparkPath) && (
          <div className="flex items-end justify-between pl-11">
            <div className="flex items-center gap-1 text-xs font-semibold">
              {trend === "up" ? (
                <span className={`flex items-center gap-0.5 ${trendColorClass}`}>
                  <ArrowUp className="size-3.5 stroke-[2.5]" />
                  {hint}
                </span>
              ) : trend === "down" ? (
                <span className={`flex items-center gap-0.5 ${trendColorClass}`}>
                  <ArrowDown className="size-3.5 stroke-[2.5]" />
                  {hint}
                </span>
              ) : trend === "flat" ? (
                <span className={`flex items-center gap-0.5 ${trendColorClass}`}>
                  <Minus className="size-3.5 stroke-[2.5]" />
                  {hint}
                </span>
              ) : hint ? (
                <span className="text-muted-foreground">{hint}</span>
              ) : null}
            </div>
            {spark || sparkPath ? (
              <Sparkline data={spark} path={sparkPath} className={palette.spark} />
            ) : null}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
