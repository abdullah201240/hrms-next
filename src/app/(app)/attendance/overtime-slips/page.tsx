"use client"
import { PageHeader } from "@/components/shared/page-header"
import { DataTable, type Column } from "@/components/shared/data-table"
import { StatusBadge } from "@/components/shared/status-badge"
import { overtimeSlips, type OvertimeSlip } from "@/lib/mock/data-2"
import { fmtMoney } from "@/lib/mock/data";

const columns: Column<OvertimeSlip>[] = [
  { key: "employee", header: "Employee", sortable: true, cell: (x) => <span className="font-medium">{x.employee}</span> },
  { key: "overtimeType", header: "Overtime Type" },
  { key: "payrollPeriod", header: "Period", className: "hidden lg:table-cell", cell: (x) => <span className="text-muted-foreground">{x.payrollPeriod}</span> },
  { key: "overtimeHours", header: "Hours", sortable: true, align: "center" },
  { key: "amount", header: "Amount", sortable: true, align: "right", cell: (x) => <span className="tabular-nums font-medium">{fmtMoney(x.amount)}</span> },
  { key: "status", header: "Status", cell: (x) => <StatusBadge status={x.status} /> },
];

export default function OvertimeSlipsPage() {
  return (
    <>
      <PageHeader title="Overtime Slips" description="Approved overtime payouts per period." />
      <DataTable columns={columns} rows={overtimeSlips} searchKeys={["employee", "overtimeType"]} pageSize={10} />
    </>
  );
}
