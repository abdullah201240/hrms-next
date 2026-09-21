"use client"
import { PageHeader } from "@/components/shared/page-header"
import { DataTable, type Column } from "@/components/shared/data-table"
import { StatusBadge } from "@/components/shared/status-badge"
import { grievances, type EmployeeGrievance } from "@/lib/mock/data-3";

const columns: Column<EmployeeGrievance>[] = [
  { key: "subject", header: "Grievance", sortable: true, cell: (x) => <span className="font-medium">{x.subject}</span> },
  { key: "raisedBy", header: "Raised By" },
  { key: "grievanceAgainst", header: "Against", className: "hidden lg:table-cell" },
  { key: "type", header: "Type" },
  { key: "status", header: "Status", cell: (x) => <StatusBadge status={x.status} /> },
];

export default function GrievancesPage() {
  return (
    <>
      <PageHeader title="Employee Grievances" description="Grievance cases and their status." />
      <DataTable columns={columns} rows={grievances} searchKeys={["subject", "raisedBy"]} pageSize={10} />
    </>
  );
}
