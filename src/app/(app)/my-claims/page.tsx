"use client";

import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { DataTable, type Column } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Plus, Receipt, Clock, CheckCircle2 } from "lucide-react";
import { expenseClaims, type ExpenseClaim } from "@/lib/mock/data";
import { fmtDate, fmtMoney } from "@/lib/mock/data";

const columns: Column<ExpenseClaim>[] = [
  { key: "claimId", header: "Claim", sortable: true, cell: (x) => <span className="font-medium">{x.claimId}</span> },
  { key: "category", header: "Category", sortable: true },
  { key: "description", header: "Description", className: "hidden lg:table-cell" },
  { key: "date", header: "Date", sortable: true, cell: (x) => fmtDate(x.date) },
  { key: "amount", header: "Amount", sortable: true, align: "right", cell: (x) => <span className="tabular-nums font-medium">{fmtMoney(x.amount)}</span> },
  { key: "status", header: "Status", cell: (x) => <StatusBadge status={x.status} /> },
];

export default function MyClaimsPage() {
  const pending = expenseClaims.filter((c) => c.status === "Pending" || c.status === "Draft").length;
  const approvedTotal = expenseClaims
    .filter((c) => c.status === "Approved" || c.status === "Paid")
    .reduce((n, c) => n + c.amount, 0);

  return (
    <>
      <PageHeader title="My Expense Claims" description="Submit and track your reimbursement claims.">
        <Button render={<Link href="/expenses/new" />}>
          <Plus className="size-4" />
          New Claim
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total Claims" value={expenseClaims.length} icon={Receipt} />
        <StatCard label="Awaiting Approval" value={pending} icon={Clock} />
        <StatCard label="Approved Amount" value={fmtMoney(approvedTotal)} icon={CheckCircle2} />
      </div>

      <div className="mt-6">
        <DataTable columns={columns} rows={expenseClaims} searchKeys={["claimId", "category"]} pageSize={10} />
      </div>
    </>
  );
}
