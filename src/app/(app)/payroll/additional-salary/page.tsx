"use client"
import { PageHeader } from "@/components/shared/page-header"
import { DataTable, type Column } from "@/components/shared/data-table"
import { Badge } from "@/components/ui/badge"
import { additionalSalaries, type AdditionalSalary } from "@/lib/mock/data-2"
import { fmtDate, fmtMoney } from "@/lib/mock/data";

const columns: Column<AdditionalSalary>[] = [
  { key: "employee", header: "Employee", sortable: true, cell: (x) => <span className="font-medium">{x.employee}</span> },
  { key: "component", header: "Component" },
  { key: "amount", header: "Amount", sortable: true, align: "right", cell: (x) => <span className="tabular-nums font-medium">{fmtMoney(x.amount)}</span> },
  { key: "from", header: "From", cell: (x) => fmtDate(x.from) },
  { key: "overwrite", header: "Overwrite", align: "center", cell: (x) => <Badge variant={x.overwrite ? "secondary" : "outline"}>{x.overwrite ? "Yes" : "No"}</Badge> },
];

export default function AdditionalSalaryPage() {
  return (
    <>
      <PageHeader title="Additional Salary" description="One-off bonuses & allowances into payroll." />
      <DataTable columns={columns} rows={additionalSalaries} searchKeys={["employee", "component"]} pageSize={10} />
    </>
  );
}
