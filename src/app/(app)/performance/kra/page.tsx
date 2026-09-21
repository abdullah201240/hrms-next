"use client"
import { PageHeader } from "@/components/shared/page-header"
import { DataTable, type Column } from "@/components/shared/data-table"
import { Badge } from "@/components/ui/badge"
import { kras, type KRA } from "@/lib/mock/data-3";

const columns: Column<KRA>[] = [
  { key: "name", header: "KRA", sortable: true, cell: (x) => <span className="font-medium">{x.name}</span> },
  { key: "description", header: "Description", cell: (x) => <span className="text-muted-foreground">{x.description}</span> },
  { key: "isCritical", header: "Critical", align: "center", cell: (x) => <Badge variant={x.isCritical ? "secondary" : "outline"}>{x.isCritical ? "Yes" : "No"}</Badge> },
];

export default function KraPage() {
  return (
    <>
      <PageHeader title="Key Result Areas" description="KRAs used in appraisals." />
      <DataTable columns={columns} rows={kras} searchKeys={["name", "description"]} pageSize={10} />
    </>
  );
}
