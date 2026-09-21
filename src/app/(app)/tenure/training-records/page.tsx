"use client"
import { PageHeader } from "@/components/shared/page-header"
import { DataTable, type Column } from "@/components/shared/data-table"
import { StatusBadge } from "@/components/shared/status-badge"
import { employeeTrainings, type EmployeeTraining } from "@/lib/mock/data-4";

const columns: Column<EmployeeTraining>[] = [
  { key: "employee", header: "Employee", sortable: true, cell: (x) => <span className="font-medium">{x.employee}</span> },
  { key: "trainingProgram", header: "Program" },
  { key: "level", header: "Level", align: "center" },
  { key: "trainerName", header: "Trainer", className: "hidden lg:table-cell", cell: (x) => <span className="text-muted-foreground">{x.trainerName}</span> },
  { key: "score", header: "Score", sortable: true, align: "center" },
  { key: "status", header: "Status", cell: (x) => <StatusBadge status={x.status} /> },
];

export default function EmployeeTrainingPage() {
  return (
    <>
      <PageHeader title="Employee Training" description="Training history per employee." />
      <DataTable columns={columns} rows={employeeTrainings} searchKeys={["employee", "trainingProgram"]} pageSize={10} />
    </>
  );
}
