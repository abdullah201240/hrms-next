"use client"
import { PageHeader } from "@/components/shared/page-header"
import { DataTable, type Column } from "@/components/shared/data-table"
import { taxableSalarySlabs, type TaxableSalarySlab } from "@/lib/mock/data-4"
import { fmtMoney } from "@/lib/mock/data";

const columns: Column<TaxableSalarySlab>[] = [
  { key: "salarySlip", header: "Salary Slip", sortable: true, cell: (x) => <span className="font-medium">{x.salarySlip}</span> },
  { key: "employee", header: "Employee" },
  { key: "fromAmount", header: "From", align: "right", cell: (x) => <span className="tabular-nums font-medium">{fmtMoney(x.fromAmount)}</span> },
  { key: "toAmount", header: "To", align: "right", cell: (x) => <span className="tabular-nums font-medium">{fmtMoney(x.toAmount)}</span> },
  { key: "percentDeducted", header: "Rate", align: "center", cell: (x) => <span className="tabular-nums">{x.percentDeducted}%</span> },
];

export default function TaxableSalarySlabsPage() {
  return (
    <>
      <PageHeader title="Taxable Salary Slabs" description="Slab-wise taxable breakdown per slip." />
      <DataTable columns={columns} rows={taxableSalarySlabs} searchKeys={["salarySlip", "employee"]} pageSize={10} />
    </>
  );
}
