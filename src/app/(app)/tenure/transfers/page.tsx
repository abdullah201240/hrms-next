"use client"
import { PageHeader } from "@/components/shared/page-header"
import { DataTable, type Column } from "@/components/shared/data-table"
import { StatusBadge } from "@/components/shared/status-badge"
import { transfers, type EmployeeTransfer } from "@/lib/mock/data-3"
import { fmtDate } from "@/lib/mock/data";

const columns: Column<EmployeeTransfer>[] = [
  { key: "employee", header: "Employee", sortable: true, cell: (x) => <span className="font-medium">{x.employee}</span> },
  { key: "transactionDate", header: "Date", sortable: true, cell: (x) => fmtDate(x.transactionDate) },
  { key: "fromDepartment", header: "From Dept" },
  { key: "toDepartment", header: "To Dept" },
  { key: "toBranch", header: "To Branch", className: "hidden lg:table-cell", cell: (x) => <span className="text-muted-foreground">{x.toBranch}</span> },
  { key: "status", header: "Status", cell: (x) => <StatusBadge status={x.status} /> },
];

export default function TransfersPage() {
  return (
    <>
      <PageHeader title="Employee Transfers" description="Department / branch transfers." />
      <DataTable columns={columns} rows={transfers} searchKeys={["employee"]} pageSize={10} />
    </>
  );
}
