"use client"
import { PageHeader } from "@/components/shared/page-header"
import { DataTable, type Column } from "@/components/shared/data-table"
import { StatusBadge } from "@/components/shared/status-badge"
import { employeeAdvances, type EmployeeAdvance } from "@/lib/mock/data-2"
import { fmtDate, fmtMoney } from "@/lib/mock/data";

const columns: Column<EmployeeAdvance>[] = [
  { key: "purpose", header: "Advance", sortable: true, cell: (x) => <span className="font-medium">{x.purpose}</span> },
  { key: "employee", header: "Employee" },
  { key: "advanceDate", header: "Date", sortable: true, cell: (x) => fmtDate(x.advanceDate) },
  { key: "amount", header: "Amount", sortable: true, align: "right", cell: (x) => <span className="tabular-nums font-medium">{fmtMoney(x.amount)}</span> },
  { key: "paidAmount", header: "Paid", align: "right", className: "hidden lg:table-cell", cell: (x) => <span className="tabular-nums font-medium">{fmtMoney(x.paidAmount)}</span> },
  { key: "status", header: "Status", cell: (x) => <StatusBadge status={x.status} /> },
];

export default function EmployeeAdvancePage() {
  return (
    <>
      <PageHeader title="Employee Advance" description="Advances paid against future salary." />
      <DataTable columns={columns} rows={employeeAdvances} searchKeys={["employee", "purpose"]} pageSize={10} />
    </>
  );
}
