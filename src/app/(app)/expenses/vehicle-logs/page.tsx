"use client"
import { PageHeader } from "@/components/shared/page-header"
import { DataTable, type Column } from "@/components/shared/data-table"
import { vehicleLogs, type VehicleLog } from "@/lib/mock/data-2";

const columns: Column<VehicleLog>[] = [
  { key: "licensePlate", header: "Vehicle", sortable: true, cell: (x) => <span className="font-medium">{x.licensePlate}</span> },
  { key: "employee", header: "Driver" },
  { key: "type", header: "In/Out", align: "center" },
  { key: "date", header: "When" },
  { key: "logType", header: "Log Type", cell: (x) => <span className="text-muted-foreground">{x.logType}</span> },
];

export default function VehicleLogsPage() {
  return (
    <>
      <PageHeader title="Vehicle Logs" description="Company vehicle in/out logs." />
      <DataTable columns={columns} rows={vehicleLogs} searchKeys={["licensePlate", "employee"]} pageSize={10} />
    </>
  );
}
