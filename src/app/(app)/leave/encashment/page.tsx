"use client";

import { PageHeader } from "@/components/shared/page-header";
import { DataTable, type Column } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { leaveEncashments, type LeaveEncashment } from "@/lib/mock/data-2";
import { fmtMoney } from "@/lib/mock/data";

const columns: Column<LeaveEncashment>[] = [
  { key: "employee", header: "Employee", sortable: true, cell: (x) => <span className="font-medium">{x.employee}</span> },
  { key: "leaveType", header: "Leave Type" },
  { key: "days", header: "Days", sortable: true, align: "center" },
  { key: "amount", header: "Amount", sortable: true, align: "right", cell: (x) => <span className="tabular-nums font-medium">{fmtMoney(x.amount)}</span> },
  { key: "status", header: "Status", cell: (x) => <StatusBadge status={x.status} /> },
];

export default function LeaveEncashmentPage() {
  return (
    <>
      <PageHeader title="Leave Encashment" description="Cash-out of unused leave balances." />
      <DataTable columns={columns} rows={leaveEncashments} searchKeys={["employee", "leaveType"]} pageSize={10} />
    </>
  );
}
