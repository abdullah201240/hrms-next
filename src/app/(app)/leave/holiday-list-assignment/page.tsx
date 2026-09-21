"use client"
import { PageHeader } from "@/components/shared/page-header"
import { DataTable, type Column } from "@/components/shared/data-table"
import { StatusBadge } from "@/components/shared/status-badge"
import { holidayListAssignments, type HolidayListAssignment } from "@/lib/mock/data-4";

const columns: Column<HolidayListAssignment>[] = [
  { key: "employee", header: "Employee", sortable: true, cell: (x) => <span className="font-medium">{x.employee}</span> },
  { key: "holidayList", header: "Holiday List", sortable: true },
  { key: "company", header: "Company", sortable: true, className: "hidden lg:table-cell" },
  { key: "status", header: "Status", cell: (x) => <StatusBadge status={x.status} /> },
];

export default function HolidayListAssignmentPage() {
  return (
    <>
      <PageHeader title="Holiday List Assignment" description="Assigns a holiday list to specific employees." />
      <DataTable columns={columns} rows={holidayListAssignments} searchKeys={["employee", "holidayList"]} pageSize={10} />
    </>
  );
}
