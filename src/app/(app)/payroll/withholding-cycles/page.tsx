"use client"
import { PageHeader } from "@/components/shared/page-header"
import { DataTable, type Column } from "@/components/shared/data-table"
import { StatusBadge } from "@/components/shared/status-badge"
import { salaryWithholdingCycles, type SalaryWithholdingCycle } from "@/lib/mock/data-4"
import { fmtDate, fmtMoney } from "@/lib/mock/data";

const columns: Column<SalaryWithholdingCycle>[] = [
  { key: "employee", header: "Employee", sortable: true, cell: (x) => <span className="font-medium">{x.employee}</span> },
  { key: "fromDate", header: "From", cell: (x) => fmtDate(x.fromDate) },
  { key: "toDate", header: "To", cell: (x) => fmtDate(x.toDate) },
  { key: "withholdingAmount", header: "Withheld", sortable: true, align: "right", cell: (x) => <span className="tabular-nums font-medium">{fmtMoney(x.withholdingAmount)}</span> },
  { key: "receivedAmount", header: "Received", sortable: true, align: "right", cell: (x) => <span className="tabular-nums font-medium">{fmtMoney(x.receivedAmount)}</span> },
  { key: "status", header: "Status", cell: (x) => <StatusBadge status={x.status} /> },
];

export default function WithholdingCyclesPage() {
  return (
    <>
      <PageHeader title="Salary Withholding Cycle" description="Grouped withholding periods." />
      <DataTable columns={columns} rows={salaryWithholdingCycles} searchKeys={["employee"]} pageSize={10} />
    </>
  );
}
