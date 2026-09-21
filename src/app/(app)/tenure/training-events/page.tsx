"use client"
import { PageHeader } from "@/components/shared/page-header"
import { DataTable, type Column } from "@/components/shared/data-table"
import { StatusBadge } from "@/components/shared/status-badge"
import { trainingEvents, type TrainingEvent } from "@/lib/mock/data-3";

const columns: Column<TrainingEvent>[] = [
  { key: "name", header: "Event", sortable: true, cell: (x) => <span className="font-medium">{x.name}</span> },
  { key: "trainingProgram", header: "Program" },
  { key: "startTime", header: "Start" },
  { key: "level", header: "Level", align: "center", className: "hidden lg:table-cell" },
  { key: "attendees", header: "Attendees", sortable: true, align: "center" },
  { key: "status", header: "Status", cell: (x) => <StatusBadge status={x.status} /> },
];

export default function TrainingEventsPage() {
  return (
    <>
      <PageHeader title="Training Events" description="Scheduled training sessions." />
      <DataTable columns={columns} rows={trainingEvents} searchKeys={["name", "trainingProgram"]} pageSize={10} />
    </>
  );
}
