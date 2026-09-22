"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable, type Column } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { StatCard } from "@/components/shared/stat-card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { expenseClaims, fmtDate, fmtMoney, type ExpenseClaim } from "@/lib/mock/data";
import { expensePrint } from "@/lib/print/print";
import { PrintButton } from "@/components/shared/print/print-dialog";
import { Plus, Receipt, CheckCircle2, Clock, Wallet } from "lucide-react";

const initials = (n: string) => n.split(" ").map((s) => s[0]).slice(0, 2).join("");

const columns: Column<ExpenseClaim>[] = [
  { key: "claimId", header: "Claim ID", sortable: true, cell: (x) => <span className="font-mono text-xs text-slate-500 dark:text-slate-400">{x.claimId}</span> },
  {
    key: "employeeName",
    header: "Employee",
    sortable: true,
    cell: (x) => (
      <div className="flex items-center gap-2.5">
        <Avatar className="size-8">
          <AvatarFallback className="text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
            {initials(x.employeeName)}
          </AvatarFallback>
        </Avatar>
        <span className="font-semibold text-slate-800 dark:text-slate-100">{x.employeeName}</span>
      </div>
    ),
  },
  { key: "category", header: "Category" },
  { key: "description", header: "Description", className: "hidden lg:table-cell text-slate-500 dark:text-slate-400" },
  { key: "date", header: "Date", sortable: true, cell: (x) => fmtDate(x.date) },
  { key: "amount", header: "Amount", sortable: true, align: "right", cell: (x) => <span className="tabular-nums font-semibold text-slate-800 dark:text-slate-100">৳{x.amount.toLocaleString()}</span> },
  { key: "status", header: "Status", cell: (x) => <StatusBadge status={x.status} /> },
  { key: "print", header: "", align: "right", cell: (x) => <PrintButton data={() => expensePrint(x)} variant="ghost" label="Print" /> },
];

export default function ExpensesPage() {
  const totalAmount = expenseClaims.reduce((s, c) => s + c.amount, 0);
  const approvedClaims = expenseClaims.filter((c) => c.status === "Approved");
  const approvedAmount = approvedClaims.reduce((s, c) => s + c.amount, 0);
  const pendingClaims = expenseClaims.filter((c) => c.status === "Pending");

  return (
    <>
      <PageHeader
        title="Expense Claims"
        description={`${expenseClaims.length} claims submitted across departments.`}
        showExport
        exportWhat="expense claims"
      >
        <Button
          render={<Link href="/expenses/new" />}
          className="h-10 rounded-xl bg-blue-600 px-4 font-semibold text-white shadow-sm hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500"
        >
          <Plus className="size-4" /> New Claim
        </Button>
      </PageHeader>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Claims"
          value={expenseClaims.length}
          icon={Receipt}
          color="blue"
          hint="+5 this week"
          trend="up"
          trendColor="emerald"
          sparkPath="M 2 20 C 18 20, 28 14, 42 16 C 56 18, 66 8, 82 12"
        />
        <StatCard
          label="Approved Amount"
          value={`৳${approvedAmount.toLocaleString()}`}
          icon={CheckCircle2}
          color="emerald"
          hint={`${approvedClaims.length} claims`}
          trend="up"
          trendColor="emerald"
          sparkPath="M 2 21 C 16 21, 26 14, 38 12 C 50 10, 62 4, 82 2"
        />
        <StatCard
          label="Pending Review"
          value={pendingClaims.length}
          icon={Clock}
          color="amber"
          hint="Active"
          trend="up"
          trendColor="amber"
          sparkPath="M 2 20 C 12 20, 20 12, 30 11 C 40 10, 48 20, 58 14 C 66 9, 72 7, 82 10"
        />
        <StatCard
          label="Total Claimed"
          value={`৳${totalAmount.toLocaleString()}`}
          icon={Wallet}
          color="violet"
          hint="All time"
          trend="up"
          trendColor="emerald"
          sparkPath="M 2 20 C 12 20, 20 12, 30 11 C 40 10, 48 20, 58 14 C 66 9, 72 7, 82 10"
        />
      </div>

      <DataTable columns={columns} rows={expenseClaims} searchKeys={["claimId", "employeeName", "category", "description"]} pageSize={10} />
    </>
  );
}
