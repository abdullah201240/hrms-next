"use client";

import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { DataTable, type Column } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Wallet, Banknote, Receipt, TrendingUp } from "lucide-react";
import { salarySlips, type SalarySlip } from "@/lib/mock/data";
import { fmtMoney } from "@/lib/mock/data";

const columns: Column<SalarySlip>[] = [
  { key: "month", header: "Month", sortable: true, cell: (x) => <span className="font-medium">{x.month}</span> },
  { key: "gross", header: "Gross", align: "right", sortable: true, cell: (x) => <span className="tabular-nums">{fmtMoney(x.gross)}</span> },
  { key: "deductions", header: "Deductions", align: "right", cell: (x) => <span className="tabular-nums">{fmtMoney(x.deductions)}</span> },
  { key: "net", header: "Net Pay", align: "right", sortable: true, cell: (x) => <span className="tabular-nums font-medium">{fmtMoney(x.net)}</span> },
  { key: "status", header: "Status", cell: (x) => <StatusBadge status={x.status} /> },
];

export default function MySalaryPage() {
  const paid = salarySlips.filter((s) => s.status === "Paid");
  const ytd = paid.reduce((n, s) => n + s.net, 0);
  const latest = salarySlips[salarySlips.length - 1];

  return (
    <>
      <PageHeader title="My Salary" description="Your payslips and earnings at a glance.">
        <Button render={<Link href="/payroll/slips" />}>
          <Receipt className="size-4" />
          All Payslips
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="YTD Net Pay" value={fmtMoney(ytd)} icon={Banknote} trend="up" hint="Paid slips" />
        <StatCard label="Payslips" value={salarySlips.length} icon={Receipt} />
        <StatCard label="Monthly Gross" value={latest ? fmtMoney(latest.gross) : "—"} icon={Wallet} />
        <StatCard label="Latest Month" value={latest?.month ?? "—"} icon={TrendingUp} />
      </div>

      <div className="mt-6">
        <h2 className="pb-3 text-lg font-semibold tracking-tight">Recent Payslips</h2>
        <DataTable columns={columns} rows={salarySlips} searchKeys={["month"]} pageSize={10} />
      </div>
    </>
  );
}
