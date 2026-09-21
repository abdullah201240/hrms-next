"use client"
import { PageHeader } from "@/components/shared/page-header"
import { DataTable, type Column } from "@/components/shared/data-table"
import { StatusBadge } from "@/components/shared/status-badge"
import { trainingFeedback, type TrainingFeedback } from "@/lib/mock/data-4";

const columns: Column<TrainingFeedback>[] = [
  { key: "employee", header: "Employee", sortable: true, cell: (x) => <span className="font-medium">{x.employee}</span> },
  { key: "trainingEvent", header: "Training Event", sortable: true },
  { key: "trainerName", header: "Trainer", sortable: true, className: "hidden lg:table-cell" },
  { key: "rating", header: "Rating", align: "center", cell: (x) => <span className="tabular-nums">{x.rating}%</span> },
  { key: "status", header: "Status", cell: (x) => <StatusBadge status={x.status} /> },
];

export default function TrainingFeedbackPage() {
  return (
    <>
      <PageHeader title="Training Feedback" description="Employee feedback captured against training events." />
      <DataTable columns={columns} rows={trainingFeedback} searchKeys={["employee", "trainingEvent"]} pageSize={10} />
    </>
  );
}
