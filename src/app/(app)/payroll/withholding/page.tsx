"use client"
import { PageHeader } from "@/components/shared/page-header"
import { DataTable, type Column } from "@/components/shared/data-table"
import { StatusBadge } from "@/components/shared/status-badge"
import { salaryWithholdings, type SalaryWithholding } from "@/lib/mock/data-2"
import { fmtDate, fmtMoney } from "@/lib/mock/data";

const columns: Column<SalaryWithholding>[] = [
  { key: "employee", header: "Employee", sortable: true, cell: (x) => <span className="font-medium">{x.employee}</span> },
  { key: "fromDate", header: "From", cell: (x) => fmtDate(x.fromDate) },
  { key: "toDate", header: "To", cell: (x) => fmtDate(x.toDate) },
  { key: "amount", header: "Amount", sortable: true, align: "right", cell: (x) => <span className="tabular-nums font-medium">{fmtMoney(x.amount)}</span> },
  { key: "status", header: "Status", cell: (x) => <StatusBadge status={x.status} /> },
];

export default function SalaryWithholdingPage() {
  return (
    <>
      <PageHeader title="Salary Withholding" description="Amounts withheld from salary." />
      <DataTable columns={columns} rows={salaryWithholdings} searchKeys={["employee"]} pageSize={10} />
    </>
  );
}
