"use client"
import { PageHeader } from "@/components/shared/page-header"
import { DataTable, type Column } from "@/components/shared/data-table"
import { StatusBadge } from "@/components/shared/status-badge"
import { exitInterviews, type ExitInterview } from "@/lib/mock/data-3"
import { fmtDate } from "@/lib/mock/data";

const columns: Column<ExitInterview>[] = [
  { key: "employee", header: "Employee", sortable: true, cell: (x) => <span className="font-medium">{x.employee}</span> },
  { key: "departureDate", header: "Departure", sortable: true, cell: (x) => fmtDate(x.departureDate) },
  { key: "reason", header: "Reason", cell: (x) => <span className="text-muted-foreground">{x.reason}</span> },
  { key: "status", header: "Status", cell: (x) => <StatusBadge status={x.status} /> },
];

export default function ExitInterviewsPage() {
  return (
    <>
      <PageHeader title="Exit Interviews" description="Departure interview records." />
      <DataTable columns={columns} rows={exitInterviews} searchKeys={["employee", "reason"]} pageSize={10} />
    </>
  );
}
