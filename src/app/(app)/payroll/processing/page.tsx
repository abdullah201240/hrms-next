"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SearchSelect } from "@/components/shared/search-select";
import { PrintButton } from "@/components/shared/print/print-dialog";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { DataTable, type Column } from "@/components/shared/data-table";
import { departments } from "@/lib/mock/data";
import {
  PAYROLL_MONTHS,
  DEFAULT_PAYROLL_MONTH,
  generatePayroll,
  fmtMoney,
  type PaySlip,
} from "@/lib/mock/payroll";
import { paySlipPrint } from "@/lib/print/print";
import { toast } from "sonner";
import { Play, Users, Wallet, CircleDollarSign, ArrowRight } from "lucide-react";

const deptOptions = ["All Departments", ...departments.map((d) => d.name)];

const columns: Column<PaySlip>[] = [
  { key: "employee", header: "Employee", sortable: true, cell: (s) => <span className="font-semibold text-slate-800 dark:text-slate-100">{s.employee}</span> },
  { key: "templateName", header: "Template" },
  { key: "gross", header: "Gross", sortable: true, align: "right", cell: (s) => <span className="tabular-nums">{fmtMoney(s.gross)}</span> },
  { key: "totalDeduction", header: "Deductions", align: "right", cell: (s) => <span className="tabular-nums text-rose-500 dark:text-rose-400">−{fmtMoney(s.totalDeduction)}</span> },
  { key: "net", header: "Net Pay", sortable: true, align: "right", cell: (s) => <span className="font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">{fmtMoney(s.net)}</span> },
  { key: "print", header: "", align: "right", cell: (s) => <PrintButton data={() => paySlipPrint(s)} size="sm" label="Print" /> },
];

export default function PayrollRunPage() {
  const [month, setMonth] = useState(DEFAULT_PAYROLL_MONTH);
  const [department, setDepartment] = useState(deptOptions[0]);
  const [generated, setGenerated] = useState(false);

  const slips = useMemo(() => generatePayroll(month, { status: "Published", department }), [month, department]);
  const totalGross = slips.reduce((s, x) => s + x.gross, 0);
  const totalNet = slips.reduce((s, x) => s + x.net, 0);

  const run = () => {
    if (slips.length === 0) {
      toast.error("No active assignments in this selection.");
      return;
    }
    setGenerated(true);
    toast.success(`${slips.length} payslips generated for ${month}`);
  };

  return (
    <>
      <PageHeader title="Payroll Run" description="Pick a period, generate everyone's payslips in one click." />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Employees in period" value={slips.length} icon={Users} color="blue" />
        <StatCard label="Total Gross" value={fmtMoney(totalGross)} icon={Wallet} color="emerald" />
        <StatCard label="Total Net Payable" value={fmtMoney(totalNet)} icon={CircleDollarSign} color="violet" />
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">Run Payroll</CardTitle>
          <CardDescription>Choose a month (and optionally a department) and generate payslips.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="space-y-2">
              <label className="text-sm font-medium">Pay Period</label>
              <SearchSelect value={month} onChange={setMonth} options={PAYROLL_MONTHS} className="w-56" placeholder="Pay period…" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Department</label>
              <SearchSelect value={department} onChange={setDepartment} options={deptOptions} className="w-56" placeholder="Department…" />
            </div>
            <Button onClick={run}>
              <Play /> {generated ? "Re-generate" : "Generate Payslips"}
            </Button>
            <Button variant="outline" render={<Link href="/payroll/slips" />}>
              View Salary Slips <ArrowRight className="size-4" />
            </Button>
          </div>

          <Separator />

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Status</p>
              {generated ? <Badge variant="outline" className="bg-emerald-50 text-emerald-700">Generated</Badge> : <Badge variant="secondary">Draft</Badge>}
            </div>
            <p className="text-sm text-muted-foreground">
              {generated
                ? `${slips.length} payslips generated for ${month}${department !== "All Departments" ? ` (${department})` : ""}, totalling ${fmtMoney(totalNet)} net.`
                : `Ready to run ${slips.length} payslips for ${month}${department !== "All Departments" ? ` (${department})` : ""}, totalling ${fmtMoney(totalNet)} net.`}
            </p>
          </div>
        </CardContent>
      </Card>

      {generated && (
        <div className="mt-6">
          <h2 className="pb-3 text-lg font-semibold tracking-tight">Payslips for {month}</h2>
          <DataTable columns={columns} rows={slips} searchKeys={["employee", "employeeId", "templateName"]} pageSize={12} />
        </div>
      )}
    </>
  );
}
