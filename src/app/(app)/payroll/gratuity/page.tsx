"use client"
import { PageHeader } from "@/components/shared/page-header"
import { DataTable, type Column } from "@/components/shared/data-table"
import { StatusBadge } from "@/components/shared/status-badge"
import { gratuities, type Gratuity } from "@/lib/mock/data-2"
import { fmtMoney } from "@/lib/mock/data";

const columns: Column<Gratuity>[] = [
  { key: "employee", header: "Employee", sortable: true, cell: (x) => <span className="font-medium">{x.employee}</span> },
  { key: "gratuityRule", header: "Rule" },
  { key: "currentGratuityAmount", header: "Amount", sortable: true, align: "right", cell: (x) => <span className="tabular-nums font-medium">{fmtMoney(x.currentGratuityAmount)}</span> },
  { key: "status", header: "Status", cell: (x) => <StatusBadge status={x.status} /> },
];

export default function GratuityPage() {
  return (
    <>
      <PageHeader title="Gratuity" description="Accrued gratuity entitlements." />
      <DataTable columns={columns} rows={gratuities} searchKeys={["employee", "gratuityRule"]} pageSize={10} />
    </>
  );
}
