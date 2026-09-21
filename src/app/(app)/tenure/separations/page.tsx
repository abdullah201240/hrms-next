"use client"
import { PageHeader } from "@/components/shared/page-header"
import { DataTable, type Column } from "@/components/shared/data-table"
import { StatusBadge } from "@/components/shared/status-badge"
import { separations, type EmployeeSeparation } from "@/lib/mock/data-3"
import { fmtDate } from "@/lib/mock/data";

const columns: Column<EmployeeSeparation>[] = [
  { key: "employee", header: "Employee", sortable: true, cell: (x) => <span className="font-medium">{x.employee}</span> },
  { key: "resignationLetterDate", header: "Resignation", sortable: true, cell: (x) => fmtDate(x.resignationLetterDate) },
  { key: "leavingDate", header: "Leaving", sortable: true, cell: (x) => fmtDate(x.leavingDate) },
  { key: "dateOfJoining", header: "Joined", className: "hidden lg:table-cell", cell: (x) => fmtDate(x.dateOfJoining) },
  { key: "status", header: "Status", cell: (x) => <StatusBadge status={x.status} /> },
];

export default function SeparationsPage() {
  return (
    <>
      <PageHeader title="Employee Separation" description="Resignation and exit records." />
      <DataTable columns={columns} rows={separations} searchKeys={["employee"]} pageSize={10} />
    </>
  );
}
