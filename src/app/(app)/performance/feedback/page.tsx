"use client"
import { PageHeader } from "@/components/shared/page-header"
import { DataTable, type Column } from "@/components/shared/data-table"
import { StatusBadge } from "@/components/shared/status-badge"
import { performanceFeedbacks, type PerformanceFeedback } from "@/lib/mock/data-3"
import { fmtDate } from "@/lib/mock/data";

const columns: Column<PerformanceFeedback>[] = [
  { key: "employee", header: "Employee", sortable: true, cell: (x) => <span className="font-medium">{x.employee}</span> },
  { key: "reviewer", header: "Reviewer" },
  { key: "reviewedOn", header: "Reviewed On", sortable: true, cell: (x) => fmtDate(x.reviewedOn) },
  { key: "totalScore", header: "Score", sortable: true, align: "center" },
  { key: "status", header: "Status", cell: (x) => <StatusBadge status={x.status} /> },
];

export default function PerformanceFeedbackPage() {
  return (
    <>
      <PageHeader title="Performance Feedback" description="Reviewer feedback on appraisals." />
      <DataTable columns={columns} rows={performanceFeedbacks} searchKeys={["employee", "reviewer"]} pageSize={10} />
    </>
  );
}
