"use client"
import { PageHeader } from "@/components/shared/page-header"
import { DataTable, type Column } from "@/components/shared/data-table"
import { StatusBadge } from "@/components/shared/status-badge"
import { timesheets, type Timesheet } from "@/lib/mock/data-2"
import { fmtDate } from "@/lib/mock/data";

const columns: Column<Timesheet>[] = [
  { key: "employee", header: "Employee", sortable: true, cell: (x) => <span className="font-medium">{x.employee}</span> },
  { key: "project", header: "Project" },
  { key: "fromDate", header: "From", cell: (x) => fmtDate(x.fromDate) },
  { key: "toDate", header: "To", cell: (x) => fmtDate(x.toDate) },
  { key: "totalHours", header: "Hours", sortable: true, align: "center" },
  { key: "status", header: "Status", cell: (x) => <StatusBadge status={x.status} /> },
];

export default function TimesheetsPage() {
  return (
    <>
      <PageHeader title="Timesheets" description="Project time logged by employees." />
      <DataTable columns={columns} rows={timesheets} searchKeys={["employee", "project"]} pageSize={10} />
    </>
  );
}
