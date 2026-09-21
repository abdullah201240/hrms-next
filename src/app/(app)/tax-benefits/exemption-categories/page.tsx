"use client"
import { PageHeader } from "@/components/shared/page-header"
import { DataTable, type Column } from "@/components/shared/data-table"
import { exemptionCategories, type ExemptionCategory } from "@/lib/mock/data-3"
import { fmtMoney } from "@/lib/mock/data";

const columns: Column<ExemptionCategory>[] = [
  { key: "name", header: "Category", sortable: true, cell: (x) => <span className="font-medium">{x.name}</span> },
  { key: "maxAmount", header: "Max Amount", sortable: true, align: "right", cell: (x) => <span className="tabular-nums font-medium">{fmtMoney(x.maxAmount)}</span> },
];

export default function ExemptionCategoriesPage() {
  return (
    <>
      <PageHeader title="Tax Exemption Categories" description="Categories employees can declare tax exemptions against." />
      <DataTable columns={columns} rows={exemptionCategories} searchKeys={["name"]} pageSize={10} />
    </>
  );
}
