"use client"
import { PageHeader } from "@/components/shared/page-header"
import { DataTable, type Column } from "@/components/shared/data-table"
import { StatusBadge } from "@/components/shared/status-badge"
import { trainingPrograms, type TrainingProgram } from "@/lib/mock/data-3";

const columns: Column<TrainingProgram>[] = [
  { key: "name", header: "Program", sortable: true, cell: (x) => <span className="font-medium">{x.name}</span> },
  { key: "trainerName", header: "Trainer" },
  { key: "trainerEmail", header: "Email", className: "hidden lg:table-cell", cell: (x) => <span className="text-muted-foreground">{x.trainerEmail}</span> },
  { key: "status", header: "Status", cell: (x) => <StatusBadge status={x.status} /> },
];

export default function TrainingProgramsPage() {
  return (
    <>
      <PageHeader title="Training Programs" description="Reusable training programs." />
      <DataTable columns={columns} rows={trainingPrograms} searchKeys={["name", "trainerName"]} pageSize={10} />
    </>
  );
}
