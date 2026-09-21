"use client"
import { PageHeader } from "@/components/shared/page-header"
import { DataTable, type Column } from "@/components/shared/data-table"
import { Badge } from "@/components/ui/badge"
import { leaveLedgerEntries, type LeaveLedgerEntry } from "@/lib/mock/data-4"
import { fmtDate } from "@/lib/mock/data";

const columns: Column<LeaveLedgerEntry>[] = [
  { key: "employee", header: "Employee", sortable: true, cell: (x) => <span className="font-medium">{x.employee}</span> },
  { key: "leaveType", header: "Leave Type" },
  { key: "transactionType", header: "Transaction" },
  { key: "leaves", header: "Leaves", sortable: true, align: "center" },
  { key: "ledgerFrom", header: "From", className: "hidden lg:table-cell", cell: (x) => fmtDate(x.ledgerFrom) },
  { key: "isCredit", header: "Credit", align: "center", cell: (x) => <Badge variant={x.isCredit ? "secondary" : "outline"}>{x.isCredit ? "Yes" : "No"}</Badge> },
];

export default function LeaveLedgerPage() {
  return (
    <>
      <PageHeader title="Leave Ledger Entry" description="Running record of every leave credit and debit." />
      <DataTable columns={columns} rows={leaveLedgerEntries} searchKeys={["employee", "leaveType"]} pageSize={10} />
    </>
  );
}
