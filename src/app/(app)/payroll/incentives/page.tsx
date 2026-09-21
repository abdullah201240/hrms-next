"use client"
import { PageHeader } from "@/components/shared/page-header"
import { DataTable, type Column } from "@/components/shared/data-table"
import { employeeIncentives, type EmployeeIncentive } from "@/lib/mock/data-2"
import { fmtDate, fmtMoney } from "@/lib/mock/data";

const columns: Column<EmployeeIncentive>[] = [
  { key: "employee", header: "Employee", sortable: true, cell: (x) => <span className="font-medium">{x.employee}</span> },
  { key: "payoutDate", header: "Payout Date", sortable: true, cell: (x) => fmtDate(x.payoutDate) },
  { key: "amount", header: "Amount", sortable: true, align: "right", cell: (x) => <span className="tabular-nums font-medium">{fmtMoney(x.amount)}</span> },
  { key: "note", header: "Note", cell: (x) => <span className="text-muted-foreground">{x.note}</span> },
];

export default function EmployeeIncentivesPage() {
  return (
    <>
      <PageHeader title="Employee Incentives" description="Performance incentive payments." />
      <DataTable columns={columns} rows={employeeIncentives} searchKeys={["employee", "note"]} pageSize={10} />
    </>
  );
}
