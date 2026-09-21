"use client"
import { PageHeader } from "@/components/shared/page-header"
import { DataTable, type Column } from "@/components/shared/data-table"
import { StatusBadge } from "@/components/shared/status-badge"
import { Badge } from "@/components/ui/badge"
import { attendanceRequests, type AttendanceRequest } from "@/lib/mock/data-2"
import { fmtDate } from "@/lib/mock/data";

const columns: Column<AttendanceRequest>[] = [
  { key: "employee", header: "Employee", sortable: true, cell: (x) => <span className="font-medium">{x.employee}</span> },
  { key: "from", header: "From", sortable: true, cell: (x) => fmtDate(x.from) },
  { key: "to", header: "To", sortable: true, cell: (x) => fmtDate(x.to) },
  { key: "reason", header: "Reason" },
  { key: "workFromHome", header: "WFH", align: "center", cell: (x) => <Badge variant={x.workFromHome ? "secondary" : "outline"}>{x.workFromHome ? "Yes" : "No"}</Badge> },
  { key: "status", header: "Status", cell: (x) => <StatusBadge status={x.status} /> },
];

export default function AttendanceRequestsPage() {
  return (
    <>
      <PageHeader title="Attendance Requests" description="Work-from-home / on-duty requests." />
      <DataTable columns={columns} rows={attendanceRequests} searchKeys={["employee", "reason"]} pageSize={10} />
    </>
  );
}
