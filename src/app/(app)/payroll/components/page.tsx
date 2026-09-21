"use client"
import { PageHeader } from "@/components/shared/page-header"
import { DataTable, type Column } from "@/components/shared/data-table"
import { Badge } from "@/components/ui/badge"
import { salaryComponents, type SalaryComponent } from "@/lib/mock/data-2";

const columns: Column<SalaryComponent>[] = [
  { key: "name", header: "Component", sortable: true, cell: (x) => <span className="font-medium">{x.name}</span> },
  { key: "type", header: "Type", align: "center" },
  { key: "formula", header: "Formula", cell: (x) => <span className="text-muted-foreground">{x.formula}</span> },
  { key: "basedOn", header: "Based On", className: "hidden lg:table-cell" },
  { key: "dependsOnPaymentDays", header: "Pro-rated", align: "center", cell: (x) => <Badge variant={x.dependsOnPaymentDays ? "secondary" : "outline"}>{x.dependsOnPaymentDays ? "Yes" : "No"}</Badge> },
];

export default function SalaryComponentsPage() {
  return (
    <>
      <PageHeader title="Salary Components" description="Earnings and deductions building a structure." />
      <DataTable columns={columns} rows={salaryComponents} searchKeys={["name"]} pageSize={10} />
    </>
  );
}
