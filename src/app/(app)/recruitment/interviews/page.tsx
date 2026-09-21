"use client"
import { PageHeader } from "@/components/shared/page-header"
import { DataTable, type Column } from "@/components/shared/data-table"
import { StatusBadge } from "@/components/shared/status-badge"
import { interviews, type Interview } from "@/lib/mock/data-3";

const columns: Column<Interview>[] = [
  { key: "applicantName", header: "Applicant", sortable: true, cell: (x) => <span className="font-medium">{x.applicantName}</span> },
  { key: "jobTitle", header: "Job Title" },
  { key: "round", header: "Round" },
  { key: "date", header: "Scheduled", sortable: true },
  { key: "interviewers", header: "Interviewers", className: "hidden lg:table-cell", cell: (x) => <span className="text-muted-foreground">{x.interviewers}</span> },
  { key: "status", header: "Status", cell: (x) => <StatusBadge status={x.status} /> },
];

export default function InterviewsPage() {
  return (
    <>
      <PageHeader title="Interviews" description="Scheduled and completed interviews." />
      <DataTable columns={columns} rows={interviews} searchKeys={["applicantName", "jobTitle"]} pageSize={10} />
    </>
  );
}
