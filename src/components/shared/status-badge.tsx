import { cn } from "@/lib/utils";

// Fully rounded pill badges with delicate borders and pastel tints matching reference design
const STYLES: Record<string, string> = {
  // positive (emerald)
  Active: "bg-[#e6f9ef] text-[#16a34a] border border-[#bbf7d0]/60 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-500/30",
  Present: "bg-[#e6f9ef] text-[#16a34a] border border-[#bbf7d0]/60 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-500/30",
  Approved: "bg-[#e6f9ef] text-[#16a34a] border border-[#bbf7d0]/60 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-500/30",
  Paid: "bg-[#e6f9ef] text-[#16a34a] border border-[#bbf7d0]/60 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-500/30",
  Completed: "bg-[#e6f9ef] text-[#16a34a] border border-[#bbf7d0]/60 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-500/30",
  Achieved: "bg-[#e6f9ef] text-[#16a34a] border border-[#bbf7d0]/60 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-500/30",
  Hired: "bg-[#e6f9ef] text-[#16a34a] border border-[#bbf7d0]/60 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-500/30",
  Open: "bg-[#e6f9ef] text-[#16a34a] border border-[#bbf7d0]/60 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-500/30",
  Complete: "bg-[#e6f9ef] text-[#16a34a] border border-[#bbf7d0]/60 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-500/30",
  Accepted: "bg-[#e6f9ef] text-[#16a34a] border border-[#bbf7d0]/60 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-500/30",
  Released: "bg-[#e6f9ef] text-[#16a34a] border border-[#bbf7d0]/60 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-500/30",
  Cleared: "bg-[#e6f9ef] text-[#16a34a] border border-[#bbf7d0]/60 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-500/30",
  Resolved: "bg-[#e6f9ef] text-[#16a34a] border border-[#bbf7d0]/60 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-500/30",
  Applicable: "bg-[#e6f9ef] text-[#16a34a] border border-[#bbf7d0]/60 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-500/30",
  Claimed: "bg-[#e6f9ef] text-[#16a34a] border border-[#bbf7d0]/60 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-500/30",

  // neutral / info (slate-blue / sky)
  Leave: "bg-[#eef2f6] text-[#64748b] border border-slate-200/80 dark:bg-slate-800/90 dark:text-slate-300 dark:border-slate-700/60",
  "On Track": "bg-[#eff6ff] text-[#2563eb] border border-[#bfdbfe]/60 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-500/30",
  Applied: "bg-[#eff6ff] text-[#2563eb] border border-[#bfdbfe]/60 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-500/30",
  Screening: "bg-[#eff6ff] text-[#2563eb] border border-[#bfdbfe]/60 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-500/30",
  Interview: "bg-[#f5f3ff] text-[#7c3aed] border border-[#ddd6fe]/60 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-500/30",
  "In Progress": "bg-[#eff6ff] text-[#2563eb] border border-[#bfdbfe]/60 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-500/30",
  Submitted: "bg-[#eff6ff] text-[#2563eb] border border-[#bfdbfe]/60 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-500/30",
  Scheduled: "bg-[#eff6ff] text-[#2563eb] border border-[#bfdbfe]/60 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-500/30",
  Sent: "bg-[#eff6ff] text-[#2563eb] border border-[#bfdbfe]/60 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-500/30",
  "Under Review": "bg-[#eff6ff] text-[#2563eb] border border-[#bfdbfe]/60 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-500/30",
  "In Process": "bg-[#eff6ff] text-[#2563eb] border border-[#bfdbfe]/60 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-500/30",
  Processing: "bg-[#eff6ff] text-[#2563eb] border border-[#bfdbfe]/60 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-500/30",
  Offered: "bg-[#eff6ff] text-[#2563eb] border border-[#bfdbfe]/60 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-500/30",

  // warning (amber)
  Pending: "bg-[#fef9c3] text-[#d97706] border border-[#fef08a]/80 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-500/30",
  "Half Day": "bg-[#fef9c3] text-[#d97706] border border-[#fef08a]/80 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-500/30",
  "Awaiting Review": "bg-[#fef9c3] text-[#d97706] border border-[#fef08a]/80 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-500/30",
  "At Risk": "bg-[#fef9c3] text-[#d97706] border border-[#fef08a]/80 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-500/30",
  "On Hold": "bg-[#fef9c3] text-[#d97706] border border-[#fef08a]/80 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-500/30",
  "On Probation": "bg-[#fef9c3] text-[#d97706] border border-[#fef08a]/80 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-500/30",
  Withheld: "bg-[#fef9c3] text-[#d97706] border border-[#fef08a]/80 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-500/30",

  // muted / neutral
  Draft: "bg-[#f1f5f9] text-[#64748b] border border-slate-200/80 dark:bg-slate-800/80 dark:text-slate-400 dark:border-slate-700/50",
  "Not Started": "bg-[#f1f5f9] text-[#64748b] border border-slate-200/80 dark:bg-slate-800/80 dark:text-slate-400 dark:border-slate-700/50",
  "Week Off": "bg-[#f1f5f9] text-[#64748b] border border-slate-200/80 dark:bg-slate-800/80 dark:text-slate-400 dark:border-slate-700/50",
  "Not Paid": "bg-[#f1f5f9] text-[#64748b] border border-slate-200/80 dark:bg-slate-800/80 dark:text-slate-400 dark:border-slate-700/50",
  Closed: "bg-[#f1f5f9] text-[#64748b] border border-slate-200/80 dark:bg-slate-800/80 dark:text-slate-400 dark:border-slate-700/50",

  // danger (rose)
  Absent: "bg-[#fef2f2] text-[#ef4444] border border-[#fecdd3]/80 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-500/30",
  Rejected: "bg-[#fef2f2] text-[#ef4444] border border-[#fecdd3]/80 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-500/30",
  Cancelled: "bg-[#fef2f2] text-[#ef4444] border border-[#fecdd3]/80 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-500/30",
  Expired: "bg-[#fef2f2] text-[#ef4444] border border-[#fecdd3]/80 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-500/30",
  Inactive: "bg-[#fef2f2] text-[#ef4444] border border-[#fecdd3]/80 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-500/30",
  "Notice Period": "bg-[#fff7ed] text-[#ea580c] border border-[#fed7aa]/80 dark:bg-orange-950/60 dark:text-orange-300 dark:border-orange-500/30",
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const style = STYLES[status] ?? "bg-[#f1f5f9] text-[#64748b] border border-slate-200/80 dark:bg-slate-800 dark:text-slate-400";
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full px-3 py-0.5 text-xs font-medium tracking-tight whitespace-nowrap",
        style,
        className
      )}
    >
      {status}
    </span>
  );
}
