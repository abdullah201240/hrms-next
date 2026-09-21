"use client"
import { PageHeader } from "@/components/shared/page-header"
import { DataTable, type Column } from "@/components/shared/data-table"
import { StatusBadge } from "@/components/shared/status-badge"
import { compensatoryLeaveRequests, type CompensatoryLeaveRequest } from "@/lib/mock/data-2"
import { fmtDate } from "@/lib/mock/data";

const columns: Column<CompensatoryLeaveRequest>[] = [
  { key: "employee", header: "Employee", sortable: true, cell: (x) => <span className="font-medium">{x.employee}</span> },
  { key: "workDate", header: "Worked On", sortable: true, cell: (x) => fmtDate(x.workDate) },
  { key: "from", header: "Leave From", cell: (x) => fmtDate(x.from) },
  { key: "to", header: "Leave To", cell: (x) => fmtDate(x.to) },
  { key: "reason", header: "Reason", className: "hidden lg:table-cell", cell: (x) => <span className="text-muted-foreground">{x.reason}</span> },
  { key: "status", header: "Status", cell: (x) => <StatusBadge status={x.status} /> },
];

export default function CompensatoryLeavePage() {
  return (
    <>
      <PageHeader title="Compensatory Leave Requests" description="Leave earned for working on off days." />
      <DataTable columns={columns} rows={compensatoryLeaveRequests} searchKeys={["employee", "reason"]} pageSize={10} />
    </>
  );
}
