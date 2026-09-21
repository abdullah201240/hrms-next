"use client"
import { PageHeader } from "@/components/shared/page-header"
import { DataTable, type Column } from "@/components/shared/data-table"
import { Badge } from "@/components/ui/badge"
import { expenseClaimTypes, type ExpenseClaimType } from "@/lib/mock/data-2";

const columns: Column<ExpenseClaimType>[] = [
  { key: "name", header: "Type", sortable: true, cell: (x) => <span className="font-medium">{x.name}</span> },
  { key: "description", header: "Description", cell: (x) => <span className="text-muted-foreground">{x.description}</span> },
  { key: "needsReceipt", header: "Receipt", align: "center", cell: (x) => <Badge variant={x.needsReceipt ? "secondary" : "outline"}>{x.needsReceipt ? "Yes" : "No"}</Badge> },
];

export default function ExpenseClaimTypesPage() {
  return (
    <>
      <PageHeader title="Expense Claim Types" description="Categories of reimbursable expense." />
      <DataTable columns={columns} rows={expenseClaimTypes} searchKeys={["name", "description"]} pageSize={10} />
    </>
  );
}
