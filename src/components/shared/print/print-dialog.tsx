"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Printer, X } from "lucide-react";
import type { Printable } from "@/lib/print/print";
import { formatsFor, defaultFormat } from "@/lib/print/formats";

/**
 * PrintDialog + PrintButton — the hrms-next counterpart of Frappe's print
 * page: pick a Print Format (per-doctype formats registered in
 * lib/print/formats.tsx), preview the rendered A4 sheet, then Print/PDF via
 * the browser dialog (window.print + @media print isolation in globals.css).
 */
export function PrintButton({
  data,
  variant = "outline",
  size = "sm",
  label = "Print",
  className,
}: {
  data: Printable | (() => Printable);
  variant?: "default" | "outline" | "ghost" | "secondary";
  size?: "sm" | "default" | "icon";
  label?: string | null;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  // Lazy payload build — cheap for mock data, but keeps row cells pure.
  const payload = typeof data === "function" ? data() : data;
  const formats = formatsFor(payload.doctype);
  const [formatName, setFormatName] = useState(() => defaultFormat(payload.doctype).name);
  const format = formats.find((f) => f.name === formatName) ?? formats[0];

  return (
    <>
      <Button variant={variant} size={size} className={className} onClick={() => setOpen(true)}>
        <Printer />
        {label}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-[92vw] sm:max-w-[860px]">
          <DialogHeader>
            <DialogTitle>Print: {"label" in payload && payload.label ? payload.label : payload.doctype}</DialogTitle>
            <DialogDescription>Choose a print format, then print or save as PDF.</DialogDescription>
          </DialogHeader>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Format</span>
            <Select value={format.name} onValueChange={(v) => v && setFormatName(v)}>
              <SelectTrigger className="w-64">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {formats.map((f) => (
                  <SelectItem key={f.name} value={f.name}>
                    {f.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* A4 preview — screen only. The paper copy is portalled below. */}
          <div className="max-h-[60vh] overflow-y-auto bg-neutral-200 dark:bg-neutral-800">
            <div className="origin-top scale-[0.72] sm:scale-90">
              {format.render(payload)}
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              <X /> Close
            </Button>
            <Button onClick={() => window.print()}>
              <Printer /> Print / Save as PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Print-only A4 copy — a direct child of <body>, outside the dialog
          overlay/transform chain; hidden on screen, isolated by @media print
          (see globals.css PRINT block). */}
      {open &&
        typeof document !== "undefined" &&
        createPortal(
          <div id="print-portal" className="hidden">
            {format.render(payload)}
          </div>,
          document.body,
          "print-portal",
        )}
    </>
  );
}
