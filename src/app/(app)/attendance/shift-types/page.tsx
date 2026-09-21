"use client"
import { PageHeader } from "@/components/shared/page-header"
import { DataTable, type Column } from "@/components/shared/data-table"
import { shiftTypes, type ShiftType } from "@/lib/mock/data-2";

const columns: Column<ShiftType>[] = [
  { key: "name", header: "Shift Type", sortable: true, cell: (x) => <span className="font-medium">{x.name}</span> },
  { key: "start", header: "Start" },
  { key: "end", header: "End" },
  { key: "hours", header: "Hours", sortable: true, align: "center" },
  { key: "holidayList", header: "Holiday List", cell: (x) => <span className="text-muted-foreground">{x.holidayList}</span> },
];

export default function ShiftTypesPage() {
  return (
    <>
      <PageHeader title="Shift Types" description="Defined working shift patterns." />
      <DataTable columns={columns} rows={shiftTypes} searchKeys={["name"]} pageSize={10} />
    </>
  );
}
