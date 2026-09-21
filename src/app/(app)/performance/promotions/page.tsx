"use client"
import { PageHeader } from "@/components/shared/page-header"
import { DataTable, type Column } from "@/components/shared/data-table"
import { StatusBadge } from "@/components/shared/status-badge"
import { promotions, type Promotion } from "@/lib/mock/data-3"
import { fmtDate } from "@/lib/mock/data";

const columns: Column<Promotion>[] = [
  { key: "employee", header: "Employee", sortable: true, cell: (x) => <span className="font-medium">{x.employee}</span> },
  { key: "promotionDate", header: "Effective", sortable: true, cell: (x) => fmtDate(x.promotionDate) },
  { key: "fromGrade", header: "From Grade" },
  { key: "toGrade", header: "To Grade" },
  { key: "status", header: "Status", cell: (x) => <StatusBadge status={x.status} /> },
];

export default function PromotionsPage() {
  return (
    <>
      <PageHeader title="Promotions" description="Employee grade promotions." />
      <DataTable columns={columns} rows={promotions} searchKeys={["employee", "batchSize"]} pageSize={10} />
    </>
  );
}
