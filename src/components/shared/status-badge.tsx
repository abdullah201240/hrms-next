import { Badge } from "@/components/ui/badge";

// Square, border+tint based status pills (flat design: no rounding/shadow).
const STYLES: Record<string, string> = {
  // positive
  Active: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
  Present: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
  Approved: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
  Paid: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
  Completed: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
  Achieved: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
  Hired: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
  Open: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
  Offered: "bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-400",
  // neutral / info
  "On Track": "bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-400",
  Applied: "bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-400",
  Screening: "bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-400",
  Interview: "bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-400",
  "In Progress": "bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-400",
  Processing: "bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-400",
  "Half Day": "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
  "On Probation": "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
  // warning
  Pending: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
  "Awaiting Review": "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
  "At Risk": "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
  "On Hold": "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
  Draft: "bg-zinc-50 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400",
  "Not Started": "bg-zinc-50 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400",
  "Week Off": "bg-zinc-50 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400",
  Leave: "bg-zinc-50 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400",
  // danger
  Absent: "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400",
  Rejected: "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400",
  Cancelled: "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400",
  Inactive: "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400",
  "Notice Period": "bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-400",
  Closed: "bg-zinc-50 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <Badge variant="outline" className={STYLES[status] ?? "bg-muted text-muted-foreground"}>
      {status}
    </Badge>
  );
}
