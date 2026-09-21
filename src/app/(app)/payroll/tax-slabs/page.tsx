"use client"
import { PageHeader } from "@/components/shared/page-header"
import { DataTable, type Column } from "@/components/shared/data-table"
import { incomeTaxSlabs, type IncomeTaxSlab } from "@/lib/mock/data-2"
import { fmtMoney } from "@/lib/mock/data";

const columns: Column<IncomeTaxSlab>[] = [
  { key: "name", header: "Slab", sortable: true, cell: (x) => <span className="font-medium">{x.name}</span> },
  { key: "fromAmount", header: "From", sortable: true, align: "right", cell: (x) => <span className="tabular-nums font-medium">{fmtMoney(x.fromAmount)}</span> },
  { key: "toAmount", header: "To", sortable: true, align: "right", cell: (x) => <span className="tabular-nums font-medium">{fmtMoney(x.toAmount)}</span> },
  { key: "percentDeducted", header: "Rate", align: "center", cell: (x) => <span className="tabular-nums">{x.percentDeducted}%</span> },
  { key: "company", header: "Company", className: "hidden lg:table-cell", cell: (x) => <span className="text-muted-foreground">{x.company}</span> },
];

export default function IncomeTaxSlabsPage() {
  return (
    <>
      <PageHeader title="Income Tax Slabs" description="Tax brackets applied to taxable salary." />
      <DataTable columns={columns} rows={incomeTaxSlabs} searchKeys={["name"]} pageSize={10} />
    </>
  );
}
