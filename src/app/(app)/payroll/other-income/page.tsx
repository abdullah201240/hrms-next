"use client"
import { PageHeader } from "@/components/shared/page-header"
import { DataTable, type Column } from "@/components/shared/data-table"
import { employeeOtherIncomes, type EmployeeOtherIncome } from "@/lib/mock/data-4"
import { fmtMoney } from "@/lib/mock/data";

const columns: Column<EmployeeOtherIncome>[] = [
  { key: "employee", header: "Employee", sortable: true, cell: (x) => <span className="font-medium">{x.employee}</span> },
  { key: "incomeType", header: "Income Type" },
  { key: "payStructureComponent", header: "Component", className: "hidden lg:table-cell", cell: (x) => <span className="text-muted-foreground">{x.payStructureComponent}</span> },
  { key: "amount", header: "Amount", sortable: true, align: "right", cell: (x) => <span className="tabular-nums font-medium">{fmtMoney(x.amount)}</span> },
  { key: "note", header: "Note", cell: (x) => <span className="text-muted-foreground">{x.note}</span> },
];

export default function OtherIncomePage() {
  return (
    <>
      <PageHeader title="Employee Other Income" description="Additional income taxed with salary." />
      <DataTable columns={columns} rows={employeeOtherIncomes} searchKeys={["employee", "incomeType"]} pageSize={10} />
    </>
  );
}
