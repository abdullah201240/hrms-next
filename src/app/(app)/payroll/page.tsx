"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable, type Column } from "@/components/shared/data-table";
import { StatCard } from "@/components/shared/stat-card";
import { Badge } from "@/components/ui/badge";
import {
  salaryTemplates,
  previewTemplate,
  fmtMoney,
  type SalaryTemplate,
} from "@/lib/mock/payroll";
import { Plus, Layers, Wallet, PiggyBank } from "lucide-react";

// Sample basic used for the on-list gross/net preview (keeps the column honest).
const SAMPLE_BASIC = 50000;

const columns: Column<SalaryTemplate>[] = [
  {
    key: "name",
    header: "Template",
    sortable: true,
    cell: (t) => (
      <div>
        <div className="font-semibold text-slate-800 dark:text-slate-100">{t.name}</div>
        <div className="max-w-[340px] truncate text-xs text-slate-500 dark:text-slate-400">{t.description}</div>
      </div>
    ),
  },
  {
    key: "earnings",
    header: "Earnings",
    align: "center",
    cell: (t) => <span className="tabular-nums text-slate-600 dark:text-slate-300">{t.earnings.length}</span>,
  },
  {
    key: "deductions",
    header: "Deductions",
    align: "center",
    cell: (t) => <span className="tabular-nums text-slate-600 dark:text-slate-300">{t.deductions.length}</span>,
  },
  {
    key: "gross",
    header: `Gross @ ${fmtMoney(SAMPLE_BASIC)}`,
    align: "right",
    cell: (t) => <span className="tabular-nums font-medium text-slate-700 dark:text-slate-200">{fmtMoney(previewTemplate(t, SAMPLE_BASIC).gross)}</span>,
  },
  {
    key: "net",
    header: "Net / mo",
    sortable: true,
    align: "right",
    cell: (t) => <span className="font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">{fmtMoney(previewTemplate(t, SAMPLE_BASIC).net)}</span>,
  },
  {
    key: "active",
    header: "Status",
    align: "center",
    cell: (t) =>
      t.active ? (
        <Badge variant="secondary" className="rounded-full bg-emerald-50 font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">Active</Badge>
      ) : (
        <Badge variant="secondary" className="rounded-full font-semibold text-slate-500">Inactive</Badge>
      ),
  },
  {
    key: "actions",
    header: "",
    align: "right",
    cell: () => (
      <Button size="sm" variant="outline" render={<Link href="/payroll/new" />} className="h-8 rounded-lg border-slate-200 text-xs font-medium dark:border-slate-700 dark:hover:bg-slate-800">
        Open
      </Button>
    ),
  },
];

export default function SalaryTemplatesPage() {
  const avgGross = Math.round(salaryTemplates.reduce((s, t) => s + previewTemplate(t, SAMPLE_BASIC).gross, 0) / salaryTemplates.length);
  const avgNet = Math.round(salaryTemplates.reduce((s, t) => s + previewTemplate(t, SAMPLE_BASIC).net, 0) / salaryTemplates.length);

  return (
    <>
      <PageHeader
        title="Salary Templates"
        description="Reusable pay recipes — pick earnings & deductions once, assign to anyone."
        showExport
        exportWhat="salary templates"
      >
        <Button
          render={<Link href="/payroll/new" />}
          className="h-10 rounded-xl bg-blue-600 px-4 font-semibold text-white hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500"
        >
          <Plus className="size-4" /> New Template
        </Button>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Templates" value={salaryTemplates.length} icon={Layers} color="blue" hint="Ready to assign" />
        <StatCard label="Avg. Gross / mo" value={fmtMoney(avgGross)} icon={Wallet} color="emerald" hint={`@ ${fmtMoney(SAMPLE_BASIC)} basic`} />
        <StatCard label="Avg. Net / mo" value={fmtMoney(avgNet)} icon={PiggyBank} color="violet" hint="After deductions" />
      </div>

      <div className="mt-6 rounded-xl border border-slate-200/50 bg-white p-4 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300">
        <span className="font-semibold text-slate-800 dark:text-slate-100">How payroll works here:</span>{" "}
        <Link href="/payroll/new" className="font-medium text-blue-600 hover:underline dark:text-blue-400">Build a template</Link> →{" "}
        <Link href="/payroll/assignments" className="font-medium text-blue-600 hover:underline dark:text-blue-400">Assign it to an employee</Link> →{" "}
        <Link href="/payroll/processing" className="font-medium text-blue-600 hover:underline dark:text-blue-400">Run payroll</Link> to generate payslips. Each line is a fixed amount or a % of the employee&apos;s Basic Salary.
      </div>

      <div className="mt-6">
        <DataTable columns={columns} rows={salaryTemplates} searchKeys={["name", "description"]} pageSize={10} />
      </div>
    </>
  );
}
