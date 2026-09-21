"use client"
import { PageHeader } from "@/components/shared/page-header"
import { DataTable, type Column } from "@/components/shared/data-table"
import { StatusBadge } from "@/components/shared/status-badge"
import { exemptionDeclarations, type ExemptionDeclaration } from "@/lib/mock/data-3";

const columns: Column<ExemptionDeclaration>[] = [
  { key: "employee", header: "Employee", sortable: true, cell: (x) => <span className="font-medium">{x.employee}</span> },
  { key: "payrollPeriod", header: "Period", align: "center" },
  { key: "company", header: "Company", className: "hidden lg:table-cell", cell: (x) => <span className="text-muted-foreground">{x.company}</span> },
  { key: "status", header: "Status", cell: (x) => <StatusBadge status={x.status} /> },
];

export default function ExemptionDeclarationsPage() {
  return (
    <>
      <PageHeader title="Exemption Declarations" description="Annual tax-saving declarations." />
      <DataTable columns={columns} rows={exemptionDeclarations} searchKeys={["employee", "payrollPeriod"]} pageSize={10} />
    </>
  );
}
