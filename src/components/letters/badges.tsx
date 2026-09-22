import { cn } from "@/lib/utils";
import { getLetterType, type LetterStatus } from "@/lib/letters";

/** Pastel status pill tuned for the Letters workflow. */
const STATUS: Record<LetterStatus, string> = {
  Draft: "bg-[#f1f5f9] text-[#64748b] border border-slate-200/50 dark:bg-slate-800/80 dark:text-slate-400 dark:border-slate-700/50",
  Sent: "bg-[#eff6ff] text-[#2563eb] border border-[#bfdbfe]/60 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-500/30",
  Signed: "bg-[#e6f9ef] text-[#16a34a] border border-[#bbf7d0]/60 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-500/30",
  Archived: "bg-[#f8fafc] text-[#94a3b8] border border-slate-200/50 dark:bg-slate-800/60 dark:text-slate-500 dark:border-slate-700/50",
};

export function LetterStatusBadge({ status, className }: { status: LetterStatus; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full px-3 py-0.5 text-xs font-medium tracking-tight whitespace-nowrap",
        STATUS[status],
        className,
      )}
    >
      {status}
    </span>
  );
}

/** Icon chip + label for a letter type. */
export function LetterTypeChip({ type, className }: { type: string; className?: string }) {
  const cfg = getLetterType(type);
  if (!cfg) return <span className={className}>{type}</span>;
  const Icon = cfg.icon;
  return (
    <span className={cn("inline-flex items-center gap-2 whitespace-nowrap", className)}>
      <span className={cn("flex size-7 shrink-0 items-center justify-center rounded-lg", cfg.bgColor)}>
        <Icon className={cn("size-4", cfg.color)} />
      </span>
      <span className="font-semibold text-slate-800 dark:text-slate-100">{cfg.name}</span>
    </span>
  );
}
