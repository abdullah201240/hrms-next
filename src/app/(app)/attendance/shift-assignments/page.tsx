"use client"
import { PageHeader } from "@/components/shared/page-header"
import { DataTable, type Column } from "@/components/shared/data-table"
import { StatusBadge } from "@/components/shared/status-badge"
import { shiftAssignments, type ShiftAssignment } from "@/lib/mock/data-2"
import { fmtDate } from "@/lib/mock/data";

const columns: Column<ShiftAssignment>[] = [
  { key: "employee", header: "Employee", sortable: true, cell: (x) => <span className="font-medium">{x.employee}</span> },
  { key: "shiftType", header: "Shift Type" },
  { key: "fromDate", header: "From", sortable: true, cell: (x) => fmtDate(x.fromDate) },
  { key: "toDate", header: "To", sortable: true, cell: (x) => fmtDate(x.toDate) },
  { key: "status", header: "Status", cell: (x) => <StatusBadge status={x.status} /> },
];

export default function ShiftAssignmentsPage() {
  return (
    <>
      <PageHeader title="Shift Assignments" description="Employees assigned to shift types." />
      <DataTable columns={columns} rows={shiftAssignments} searchKeys={["employee", "shiftType"]} pageSize={10} />
    </>
  );
}
