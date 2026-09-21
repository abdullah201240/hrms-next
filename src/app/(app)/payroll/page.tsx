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
  { key: "name", header: "Structure", sortable: true },
  { key: "department", header: "Department", sortable: true },
  { key: "designation", header: "Designation", className: "hidden lg:table-cell" },
  { key: "gross", header: "Gross / mo", sortable: true, align: "right", cell: (s) => <span className="tabular-nums">{fmtMoney(grossOf(s))}</span> },
  { key: "ded", header: "Deductions", align: "right", cell: (s) => <span className="tabular-nums text-muted-foreground">−{fmtMoney(dedOf(s))}</span> },
  { key: "net", header: "Net / mo", sortable: true, align: "right", cell: (s) => <span className="font-medium tabular-nums">{fmtMoney(grossOf(s) - dedOf(s))}</span> },
  { key: "actions", header: "", align: "right", cell: (s: SalaryStructure) => <Button size="sm" variant="outline" onClick={() => toast.success(`Opening ${s.name} for configuration`)}>Configure</Button> },
];

export default function SalaryStructuresPage() {
  const avgGross = Math.round(salaryStructures.reduce((s, x) => s + grossOf(x), 0) / salaryStructures.length);
  return (
    <>
      <PageHeader title="Salary Structures" description="Reusable compensation templates.">
        <Button render={<Link href="/payroll/new" />}><Plus /> New Structure</Button>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Structures" value={salaryStructures.length} icon={Layers} />
        <StatCard label="Avg. Gross / month" value={fmtMoney(avgGross)} icon={Wallet} />
        <StatCard label="Avg. Net / month" value={fmtMoney(avgGross - Math.round(avgGross * 0.07))} icon={PiggyBank} />
      </div>

      <DataTable columns={columns} rows={salaryStructures} searchKeys={["name", "department", "designation"]} pageSize={10} />
    </>
  );
}
