"use client"
import { PageHeader } from "@/components/shared/page-header"
import { DataTable, type Column } from "@/components/shared/data-table"
import { StatusBadge } from "@/components/shared/status-badge"
import { fullAndFinalStatements, type FullAndFinalStatement } from "@/lib/mock/data-4"
import { fmtDate, fmtMoney } from "@/lib/mock/data";

const columns: Column<FullAndFinalStatement>[] = [
  { key: "employee", header: "Employee", sortable: true, cell: (x) => <span className="font-medium">{x.employee}</span> },
  { key: "payrollDate", header: "Payroll Date", sortable: true, cell: (x) => fmtDate(x.payrollDate) },
  { key: "unsalariedAmount", header: "Unsalaried", align: "right", className: "hidden lg:table-cell", cell: (x) => <span className="tabular-nums font-medium">{fmtMoney(x.unsalariedAmount)}</span> },
  { key: "salaryPayout", header: "Salary", sortable: true, align: "right", cell: (x) => <span className="tabular-nums font-medium">{fmtMoney(x.salaryPayout)}</span> },
  { key: "totalAmount", header: "Total", sortable: true, align: "right", cell: (x) => <span className="tabular-nums font-medium">{fmtMoney(x.totalAmount)}</span> },
  { key: "status", header: "Status", cell: (x) => <StatusBadge status={x.status} /> },
];

export default function FullAndFinalPage() {
  return (
    <>
      <PageHeader title="Full and Final Statement" description="Final settlement for exiting employees." />
      <DataTable columns={columns} rows={fullAndFinalStatements} searchKeys={["employee"]} pageSize={10} />
    </>
  );
}
