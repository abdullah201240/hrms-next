"use client";

import { Button } from "@/components/ui/button";
import { Download, ChevronDown } from "lucide-react";
import { toast } from "sonner";

/** Flat, clean export action. Mock-only: queues a CSV export notice. */
export function ExportButton({
  label = "Export",
  what = "report",
  variant = "outline",
}: {
  label?: string;
  what?: string;
  variant?: "default" | "outline";
}) {
  return (
    <Button
      variant={variant}
      onClick={() => toast.success(`Preparing ${what} export… your download will begin shortly.`)}
      className="h-10 gap-2 rounded-xl border border-slate-200/50 bg-white px-3.5 font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900/90 dark:text-slate-200 dark:hover:bg-slate-800"
    >
      <Download className="size-3.5 text-slate-600 dark:text-slate-400" />
      <span className="text-sm font-medium">{label}</span>
      <ChevronDown className="size-3.5 text-slate-400 dark:text-slate-500" />
    </Button>
  );
}
