"use client"
import { PageHeader } from "@/components/shared/page-header"
import { DataTable, type Column } from "@/components/shared/data-table"
import { payrollPeriods, type PayrollPeriod } from "@/lib/mock/data-2"
import { fmtDate } from "@/lib/mock/data";

const columns: Column<PayrollPeriod>[] = [
  { key: "name", header: "Period", sortable: true, cell: (x) => <span className="font-medium">{x.name}</span> },
  { key: "startDate", header: "Start", sortable: true, cell: (x) => fmtDate(x.startDate) },
  { key: "endDate", header: "End", sortable: true, cell: (x) => fmtDate(x.endDate) },
  { key: "company", header: "Company", cell: (x) => <span className="text-muted-foreground">{x.company}</span> },
];

export default function PayrollPeriodPage() {
  return (
    <>
      <PageHeader title="Payroll Periods" description="Fiscal periods used for payroll & tax." />
      <DataTable columns={columns} rows={payrollPeriods} searchKeys={["name", "company"]} pageSize={10} />
    </>
  );
}
