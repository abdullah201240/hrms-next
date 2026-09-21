"use client"
import { PageHeader } from "@/components/shared/page-header"
import { DataTable, type Column } from "@/components/shared/data-table"
import { StatusBadge } from "@/components/shared/status-badge"
import { shiftRequests, type ShiftRequest } from "@/lib/mock/data-2"
import { fmtDate } from "@/lib/mock/data";

const columns: Column<ShiftRequest>[] = [
  { key: "employee", header: "Employee", sortable: true, cell: (x) => <span className="font-medium">{x.employee}</span> },
  { key: "from", header: "From", sortable: true, cell: (x) => fmtDate(x.from) },
  { key: "to", header: "To", sortable: true, cell: (x) => fmtDate(x.to) },
  { key: "shiftType", header: "Requested Shift" },
  { key: "reason", header: "Reason", className: "hidden lg:table-cell", cell: (x) => <span className="text-muted-foreground">{x.reason}</span> },
  { key: "status", header: "Status", cell: (x) => <StatusBadge status={x.status} /> },
];

export default function ShiftRequestsPage() {
  return (
    <>
      <PageHeader title="Shift Requests" description="Employee requests to change shift." />
      <DataTable columns={columns} rows={shiftRequests} searchKeys={["employee", "reason"]} pageSize={10} />
    </>
  );
}
