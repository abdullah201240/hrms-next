"use client"
import { PageHeader } from "@/components/shared/page-header"
import { DataTable, type Column } from "@/components/shared/data-table"
import { Badge } from "@/components/ui/badge"
import { shiftSchedules, type ShiftSchedule } from "@/lib/mock/data-2";

const columns: Column<ShiftSchedule>[] = [
  { key: "name", header: "Schedule", sortable: true, cell: (x) => <span className="font-medium">{x.name}</span> },
  { key: "shiftType", header: "Shift Type" },
  { key: "location", header: "Location" },
  { key: "frequency", header: "Frequency", align: "center" },
  { key: "employeesAssigned", header: "Employees", sortable: true, align: "center" },
  { key: "enabled", header: "Enabled", align: "center", cell: (x) => <Badge variant={x.enabled ? "secondary" : "outline"}>{x.enabled ? "Yes" : "No"}</Badge> },
];

export default function ShiftSchedulesPage() {
  return (
    <>
      <PageHeader title="Shift Schedules" description="Recurring shift assignment plans." />
      <DataTable columns={columns} rows={shiftSchedules} searchKeys={["name", "shiftType"]} pageSize={10} />
    </>
  );
}
