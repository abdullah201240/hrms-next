"use client";

import { PrintButton } from "@/components/shared/print/print-dialog";
import { getDoctype, getRow } from "@/lib/crud/registry";
import { company } from "@/lib/mock/data";
import type { GenericPrint, Printable } from "@/lib/print/print";
import { salarySlipPrint } from "@/lib/print/print";
import { fmtDate } from "@/lib/mock/data";
import type { SalarySlip } from "@/lib/mock/data";

/**
 * Print action for any registry CRUD doctype. Routes whose rows have a typed
 * payload builder (mirroring Frappe's dedicated Print Formats) get the real
 * formats; everything else falls back to the generic "Standard" print that
 * every DocType gets. Takes the doctype ROUTE key — config carries render fns,
 * so it is resolved client-side like the other crud components.
 */

/** Routes with typed printable builders — keyed like the Print Format registry. */
const TYPED: Record<string, (row: Record<string, unknown>) => Printable> = {
  // Frappe HR: Salary Slip has 6 standard print formats.
  "SALARY SLIP": (row) => salarySlipPrint(row as unknown as SalarySlip),
};

export function CrudPrintButton({ doctype, id, variant = "outline", size = "sm", label = "Print" }: { doctype: string; id: string; variant?: "outline" | "ghost" | "default"; size?: "sm" | "default" | "icon"; label?: string | null }) {
  const build = (): Printable => {
    const config = getDoctype(doctype);
    const row = (getRow(doctype, id) ?? {}) as Record<string, unknown>;
    const typed = TYPED[config.label.toUpperCase()];
    if (typed) return typed(row);
    const title = String(row[config.titleKey] ?? config.label);
    const extra: [string, string][] = [];
    for (const s of config.sections) {
      for (const f of s.fields) {
        const val = row[f.key];
        if (val === undefined || val === null || val === "") continue;
        let shown: string;
        if (f.type === "check") shown = val === true || val === "true" || val === 1 || val === "1" || val === "Yes" ? "Yes" : "No";
        else if (f.type === "date" || f.type === "datetime") shown = fmtDate(String(val));
        else shown = String(val);
        extra.push([f.label, shown]);
      }
    }
    // doctype = route key keeps the format-registry lookup disjoint from label
    // collisions (e.g. CRUD "Salary Slip" must not hit the typed formats).
    const payload: GenericPrint = { doctype, name: id, title, row, extra, company: company.name };
    return payload;
  };
  return <PrintButton data={build} variant={variant} size={size} label={label} />;
}
