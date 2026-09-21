"use client"
import { PageHeader } from "@/components/shared/page-header"
import { DataTable, type Column } from "@/components/shared/data-table"
import { StatusBadge } from "@/components/shared/status-badge"
import { vehicleServices, type VehicleService } from "@/lib/mock/data-4"
import { fmtDate, fmtMoney } from "@/lib/mock/data";

const columns: Column<VehicleService>[] = [
  { key: "licensePlate", header: "Vehicle", sortable: true, cell: (x) => <span className="font-medium">{x.licensePlate}</span> },
  { key: "employee", header: "Requested By" },
  { key: "serviceDate", header: "Service Date", sortable: true, cell: (x) => fmtDate(x.serviceDate) },
  { key: "type", header: "Type" },
  { key: "invoiceNo", header: "Invoice", className: "hidden lg:table-cell", cell: (x) => <span className="text-muted-foreground">{x.invoiceNo}</span> },
  { key: "amount", header: "Amount", sortable: true, align: "right", cell: (x) => <span className="tabular-nums font-medium">{fmtMoney(x.amount)}</span> },
  { key: "status", header: "Status", cell: (x) => <StatusBadge status={x.status} /> },
];

export default function VehicleServicePage() {
  return (
    <>
      <PageHeader title="Vehicle Service" description="Company vehicle service records." />
      <DataTable columns={columns} rows={vehicleServices} searchKeys={["licensePlate", "employee"]} pageSize={10} />
    </>
  );
}
