"use client"
import { PageHeader } from "@/components/shared/page-header"
import { DataTable, type Column } from "@/components/shared/data-table"
import { StatusBadge } from "@/components/shared/status-badge"
import { exemptionProofs, type ExemptionProof } from "@/lib/mock/data-3"
import { fmtMoney } from "@/lib/mock/data";

const columns: Column<ExemptionProof>[] = [
  { key: "employee", header: "Employee", sortable: true, cell: (x) => <span className="font-medium">{x.employee}</span> },
  { key: "category", header: "Category" },
  { key: "declared", header: "Declared", align: "right", cell: (x) => <span className="tabular-nums font-medium">{fmtMoney(x.declared)}</span> },
  { key: "submitted", header: "Submitted", align: "right", className: "hidden lg:table-cell", cell: (x) => <span className="tabular-nums font-medium">{fmtMoney(x.submitted)}</span> },
  { key: "approved", header: "Approved", sortable: true, align: "right", cell: (x) => <span className="tabular-nums font-medium">{fmtMoney(x.approved)}</span> },
  { key: "status", header: "Status", cell: (x) => <StatusBadge status={x.status} /> },
];

export default function ExemptionProofsPage() {
  return (
    <>
      <PageHeader title="Exemption Proofs" description="Submitted proof vs approved amounts." />
      <DataTable columns={columns} rows={exemptionProofs} searchKeys={["employee", "category"]} pageSize={10} />
    </>
  );
}
