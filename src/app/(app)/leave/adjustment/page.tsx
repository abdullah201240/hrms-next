"use client"
import { PageHeader } from "@/components/shared/page-header"
import { DataTable, type Column } from "@/components/shared/data-table"
import { StatusBadge } from "@/components/shared/status-badge"
import { leaveAdjustments, type LeaveAdjustment } from "@/lib/mock/data-4"
import { fmtDate } from "@/lib/mock/data";

const columns: Column<LeaveAdjustment>[] = [
  { key: "employee", header: "Employee", sortable: true, cell: (x) => <span className="font-medium">{x.employee}</span> },
  { key: "leaveType", header: "Leave Type" },
  { key: "adjustmentDate", header: "Date", sortable: true, cell: (x) => fmtDate(x.adjustmentDate) },
  { key: "leavesAdjustded", header: "Leaves", sortable: true, align: "center" },
  { key: "remarks", header: "Remarks", cell: (x) => <span className="text-muted-foreground">{x.remarks}</span> },
  { key: "docStatus", header: "Status", cell: (x) => <StatusBadge status={x.docStatus} /> },
];

export default function LeaveAdjustmentPage() {
  return (
    <>
      <PageHeader title="Leave Adjustment" description="Manual corrections to a leave balance." />
      <DataTable columns={columns} rows={leaveAdjustments} searchKeys={["employee", "remarks"]} pageSize={10} />
    </>
  );
}
