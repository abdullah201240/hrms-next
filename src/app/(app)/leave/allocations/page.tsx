"use client";

import { PageHeader } from "@/components/shared/page-header";
import { DataTable, type Column } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { leaveAllocations, type LeaveAllocation } from "@/lib/mock/data-2";
import { fmtDate } from "@/lib/mock/data";

const columns: Column<LeaveAllocation>[] = [
  { key: "employee", header: "Employee", sortable: true, cell: (x) => <span className="font-medium">{x.employee}</span> },
  { key: "leaveType", header: "Leave Type" },
  { key: "newLeaves", header: "New", align: "center" },
  { key: "carryForward", header: "P/F", align: "center" },
  { key: "total", header: "Total", sortable: true, align: "center", cell: (x) => <span className="font-medium tabular-nums">{x.total}</span> },
  { key: "from", header: "From", cell: (x) => fmtDate(x.from) },
  { key: "to", header: "To", cell: (x) => fmtDate(x.to) },
  { key: "docStatus", header: "Status", cell: (x) => <StatusBadge status={x.docStatus} /> },
];

export default function LeaveAllocationsPage() {
  return (
    <>
      <PageHeader title="Leave Allocation" description="Opening balances allocated to employees per leave period." />
      <DataTable columns={columns} rows={leaveAllocations} searchKeys={["employee", "leaveType"]} pageSize={10} />
    </>
  );
}
