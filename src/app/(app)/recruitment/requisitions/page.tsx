"use client"
import { PageHeader } from "@/components/shared/page-header"
import { DataTable, type Column } from "@/components/shared/data-table"
import { StatusBadge } from "@/components/shared/status-badge"
import { jobRequisitions, type JobRequisition } from "@/lib/mock/data-3"
import { fmtDate } from "@/lib/mock/data";

const columns: Column<JobRequisition>[] = [
  { key: "subject", header: "Requisition", sortable: true, cell: (x) => <span className="font-medium">{x.subject}</span> },
  { key: "department", header: "Department" },
  { key: "noOfPositions", header: "Positions", sortable: true, align: "center" },
  { key: "requestedBy", header: "Requested By", className: "hidden lg:table-cell" },
  { key: "expectedBy", header: "Expected", cell: (x) => fmtDate(x.expectedBy) },
  { key: "status", header: "Status", cell: (x) => <StatusBadge status={x.status} /> },
];

export default function JobRequisitionsPage() {
  return (
    <>
      <PageHeader title="Job Requisitions" description="Departmental hiring requests." />
      <DataTable columns={columns} rows={jobRequisitions} searchKeys={["subject", "department"]} pageSize={10} />
    </>
  );
}
