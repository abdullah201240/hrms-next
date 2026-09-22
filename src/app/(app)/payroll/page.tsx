"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable, type Column } from "@/components/shared/data-table";
import { StatCard } from "@/components/shared/stat-card";
import { salaryStructures, fmtMoney, type SalaryStructure } from "@/lib/mock/data";
import { toast } from "sonner";
import { Plus, Wallet, Layers, PiggyBank } from "lucide-react";

const sum = (arr: { amount: number }[]) => arr.reduce((s, c) => s + c.amount, 0);
const grossOf = (s: SalaryStructure) => sum(s.earnings);
const dedOf = (s: SalaryStructure) => sum(s.deductions);

const columns: Column<SalaryStructure>[] = [
  { key: "name", header: "Structure", sortable: true, cell: (s) => <span className="font-semibold text-slate-800 dark:text-slate-100">{s.name}</span> },
  { key: "department", header: "Department", sortable: true },
  { key: "designation", header: "Designation", className: "hidden lg:table-cell" },
  { key: "gross", header: "Gross / mo", sortable: true, align: "right", cell: (s) => <span className="tabular-nums font-medium text-slate-700 dark:text-slate-200">{fmtMoney(grossOf(s))}</span> },
  { key: "ded", header: "Deductions", align: "right", cell: (s) => <span className="tabular-nums text-rose-500 dark:text-rose-400">−{fmtMoney(dedOf(s))}</span> },
  { key: "net", header: "Net / mo", sortable: true, align: "right", cell: (s) => <span className="font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">{fmtMoney(grossOf(s) - dedOf(s))}</span> },
  { key: "actions", header: "", align: "right", cell: (s: SalaryStructure) => <Button size="sm" variant="outline" className="h-8 rounded-lg border-slate-200 text-xs font-medium dark:border-slate-700 dark:hover:bg-slate-800" onClick={() => toast.success(`Opening ${s.name} for configuration`)}>Configure</Button> },
];

export default function SalaryStructuresPage() {
  const avgGross = Math.round(salaryStructures.reduce((s, x) => s + grossOf(x), 0) / salaryStructures.length);
  return (
    <>
      <PageHeader
        title="Salary Structures"
        description="Reusable compensation templates."
        showExport
        exportWhat="salary structures"
      >
        <Button
          render={<Link href="/payroll/new" />}
          className="h-10 rounded-xl bg-blue-600 px-4 font-semibold text-white shadow-sm hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500"
        >
          <Plus className="size-4" /> New Structure
        </Button>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Structures"
          value={salaryStructures.length}
          icon={Layers}
          color="blue"
          hint="+2 this quarter"
          trend="up"
          trendColor="emerald"
          sparkPath="M 2 20 C 18 20, 28 14, 42 16 C 56 18, 66 8, 82 12"
        />
        <StatCard
          label="Avg. Gross / month"
          value={fmtMoney(avgGross)}
          icon={Wallet}
          color="emerald"
          hint="+5.4%"
          trend="up"
          trendColor="emerald"
          sparkPath="M 2 21 C 16 21, 26 14, 38 12 C 50 10, 62 4, 82 2"
        />
        <StatCard
          label="Avg. Net / month"
          value={fmtMoney(avgGross - Math.round(avgGross * 0.07))}
          icon={PiggyBank}
          color="violet"
          hint="+4.8%"
          trend="up"
          trendColor="emerald"
          sparkPath="M 2 20 C 12 20, 20 12, 30 11 C 40 10, 48 20, 58 14 C 66 9, 72 7, 82 10"
        />
      </div>

      <DataTable columns={columns} rows={salaryStructures} searchKeys={["name", "department", "designation"]} pageSize={10} />
    </>
  );
}
