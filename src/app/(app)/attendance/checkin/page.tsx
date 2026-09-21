"use client"
import { PageHeader } from "@/components/shared/page-header"
import { DataTable, type Column } from "@/components/shared/data-table"
import { Badge } from "@/components/ui/badge"
import { employeeCheckins, type EmployeeCheckin } from "@/lib/mock/data-2";

const columns: Column<EmployeeCheckin>[] = [
  { key: "employee", header: "Employee", sortable: true, cell: (x) => <span className="font-medium">{x.employee}</span> },
  { key: "logType", header: "Type", align: "center" },
  { key: "time", header: "Time" },
  { key: "shift", header: "Shift" },
  { key: "device", header: "Device", cell: (x) => <span className="text-muted-foreground">{x.device}</span> },
  { key: "lateEntry", header: "Late", align: "center", cell: (x) => <Badge variant={x.lateEntry ? "secondary" : "outline"}>{x.lateEntry ? "Yes" : "No"}</Badge> },
];

export default function EmployeeCheckinPage() {
  return (
    <>
      <PageHeader title="Employee Checkin" description="Raw check-in / check-out logs." />
      <DataTable columns={columns} rows={employeeCheckins} searchKeys={["employee", "device"]} pageSize={10} />
    </>
  );
}
