"use client"
import { PageHeader } from "@/components/shared/page-header"
import { DataTable, type Column } from "@/components/shared/data-table"
import { Badge } from "@/components/ui/badge"
import { arrears, type Arrear } from "@/lib/mock/data-4"
import { fmtDate, fmtMoney } from "@/lib/mock/data";

const columns: Column<Arrear>[] = [
  { key: "employee", header: "Employee", sortable: true, cell: (x) => <span className="font-medium">{x.employee}</span> },
  { key: "payrollPeriod", header: "Payroll Period" },
  { key: "fromMonth", header: "From", className: "hidden lg:table-cell", cell: (x) => fmtDate(x.fromMonth) },
  { key: "toMonth", header: "To", className: "hidden lg:table-cell", cell: (x) => fmtDate(x.toMonth) },
  { key: "totalArrearAmount", header: "Amount", sortable: true, align: "right", cell: (x) => <span className="tabular-nums font-medium">{fmtMoney(x.totalArrearAmount)}</span> },
  { key: "submitted", header: "Submitted", align: "center", cell: (x) => <Badge variant={x.submitted ? "secondary" : "outline"}>{x.submitted ? "Yes" : "No"}</Badge> },
];

export default function ArrearsPage() {
  return (
    <>
      <PageHeader title="Arrears" description="Salary arrears paid to employees." />
      <DataTable columns={columns} rows={arrears} searchKeys={["employee", "payrollPeriod"]} pageSize={10} />
    </>
  );
}
