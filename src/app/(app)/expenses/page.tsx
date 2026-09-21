"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable, type Column } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { expenseClaims, fmtDate, type ExpenseClaim } from "@/lib/mock/data";
import { expensePrint } from "@/lib/print/print";
import { PrintButton } from "@/components/shared/print/print-dialog";
import { Plus } from "lucide-react";

const columns: Column<ExpenseClaim>[] = [
  { key: "claimId", header: "Claim", sortable: true },
  { key: "employeeName", header: "Employee", sortable: true },
  { key: "category", header: "Category" },
  { key: "description", header: "Description", className: "hidden lg:table-cell text-muted-foreground" },
  { key: "date", header: "Date", sortable: true, cell: (x) => fmtDate(x.date) },
  { key: "amount", header: "Amount", sortable: true, align: "right", cell: (x) => <span className="tabular-nums font-medium">৳{x.amount.toLocaleString()}</span> },
  { key: "status", header: "Status", cell: (x) => <StatusBadge status={x.status} /> },
  { key: "print", header: "", align: "right", cell: (x) => <PrintButton data={() => expensePrint(x)} variant="ghost" label="Print" /> },
];

export default function ExpensesPage() {
  return (
    <>
      <PageHeader title="Expense Claims" description={`${expenseClaims.length} claims submitted.`}>
        <Button render={<Link href="/expenses/new" />}><Plus /> New Claim</Button>
      </PageHeader>
      <DataTable columns={columns} rows={expenseClaims} searchKeys={["claimId", "employeeName", "category", "description"]} pageSize={10} />
    </>
  );
}
