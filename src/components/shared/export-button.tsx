"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { toast } from "sonner";

/** Flat, borderless export action. Mock-only: queues a CSV export notice. */
export function ExportButton({
  label = "Export",
  what = "report",
  variant = "default",
}: {
  label?: string;
  what?: string;
  variant?: "default" | "outline";
}) {
  return (
    <Button
      variant={variant}
      onClick={() => toast.success(`Preparing ${what} export… your download will begin shortly.`)}
    >
      <Download className="size-4" />
      {label}
    </Button>
  );
}
