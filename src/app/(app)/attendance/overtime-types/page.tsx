"use client"
import { PageHeader } from "@/components/shared/page-header"
import { DataTable, type Column } from "@/components/shared/data-table"
import { Badge } from "@/components/ui/badge"
import { overtimeTypes, type OvertimeType } from "@/lib/mock/data-2";

const columns: Column<OvertimeType>[] = [
  { key: "name", header: "Overtime Type", sortable: true, cell: (x) => <span className="font-medium">{x.name}</span> },
  { key: "forDailyWage", header: "Daily Wage", align: "center", cell: (x) => <Badge variant={x.forDailyWage ? "secondary" : "outline"}>{x.forDailyWage ? "Yes" : "No"}</Badge> },
  { key: "maxOvertimeHours", header: "Max Hrs/Day", align: "center" },
  { key: "hoursPerSlip", header: "Hours/Slip", align: "center" },
];

export default function OvertimeTypesPage() {
  return (
    <>
      <PageHeader title="Overtime Types" description="Configured overtime calculation types." />
      <DataTable columns={columns} rows={overtimeTypes} searchKeys={["name"]} pageSize={10} />
    </>
  );
}
