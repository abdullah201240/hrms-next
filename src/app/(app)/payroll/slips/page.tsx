"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable, type Column } from "@/components/shared/data-table";
import { SearchSelect } from "@/components/shared/search-select";
import { PrintButton } from "@/components/shared/print/print-dialog";
import { PAYROLL_MONTHS, DEFAULT_PAYROLL_MONTH, generatePayroll, fmtMoney, type PaySlip } from "@/lib/mock/payroll";
import { paySlipPrint } from "@/lib/print/print";
import { toast } from "sonner";

export default function SalarySlipsPage() {
  const [month, setMonth] = useState(DEFAULT_PAYROLL_MONTH);
  const [published, setPublished] = useState<Record<string, boolean>>({});

  const slips = useMemo<PaySlip[]>(
    () => generatePayroll(month, { status: "Draft" }).map((s) => ({ ...s, status: published[s.id] ? "Published" : "Draft" })),
    [month, published],
  );

  const columns: Column<PaySlip>[] = [
    { key: "slipNo", header: "Slip No.", sortable: true, cell: (s) => <span className="font-mono text-xs text-slate-500 dark:text-slate-400">{s.slipNo}</span> },
    {
      key: "employee",
      header: "Employee",
      sortable: true,
      cell: (s) => (
        <div>
          <div className="font-semibold text-slate-800 dark:text-slate-100">{s.employee}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400">{s.templateName}</div>
        </div>
      ),
    },
    { key: "gross", header: "Gross", sortable: true, align: "right", cell: (s) => <span className="tabular-nums">{fmtMoney(s.gross)}</span> },
    { key: "totalDeduction", header: "Deductions", align: "right", cell: (s) => <span className="tabular-nums text-rose-500 dark:text-rose-400">−{fmtMoney(s.totalDeduction)}</span> },
    { key: "net", header: "Net Pay", sortable: true, align: "right", cell: (s) => <span className="font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">{fmtMoney(s.net)}</span> },
    {
      key: "status",
      header: "Status",
      align: "center",
      cell: (s) =>
        s.status === "Published" ? (
          <Badge variant="secondary" className="rounded-full bg-emerald-50 font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">Published</Badge>
        ) : (
          <Badge variant="secondary" className="rounded-full bg-amber-50 font-semibold text-amber-700 dark:bg-amber-950/60 dark:text-amber-400">Draft</Badge>
        ),
    },
    {
      key: "actions",
      header: "",
      align: "right",
      cell: (s) => (
        <div className="flex items-center justify-end gap-2">
          {s.status === "Draft" && (
            <Button size="sm" variant="outline" className="h-8 rounded-lg text-xs font-medium" onClick={() => { setPublished((p) => ({ ...p, [s.id]: true })); toast.success(`${s.slipNo} published`); }}>
              Publish
            </Button>
          )}
          <PrintButton data={() => paySlipPrint(s)} size="sm" label="Print" />
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Salary Slips"
        description="Payslips are computed live from each employee's template and basic."
        showExport
        exportWhat="salary slips"
      >
        <div className="w-52">
          <SearchSelect value={month} onChange={setMonth} options={PAYROLL_MONTHS} placeholder="Pay period…" />
        </div>
      </PageHeader>

      <DataTable columns={columns} rows={slips} searchKeys={["employee", "employeeId", "slipNo", "templateName"]} pageSize={12} />
    </>
  );
}
