"use client"
import { PageHeader } from "@/components/shared/page-header"
import { DataTable, type Column } from "@/components/shared/data-table"
import { StatusBadge } from "@/components/shared/status-badge"
import { benefitClaims, type BenefitClaim } from "@/lib/mock/data-3"
import { fmtDate, fmtMoney } from "@/lib/mock/data";

const columns: Column<BenefitClaim>[] = [
  { key: "benefitApplication", header: "Application", sortable: true, cell: (x) => <span className="font-medium">{x.benefitApplication}</span> },
  { key: "employee", header: "Employee" },
  { key: "expenseDate", header: "Expense Date", sortable: true, cell: (x) => fmtDate(x.expenseDate) },
  { key: "amount", header: "Amount", sortable: true, align: "right", cell: (x) => <span className="tabular-nums font-medium">{fmtMoney(x.amount)}</span> },
  { key: "status", header: "Status", cell: (x) => <StatusBadge status={x.status} /> },
];

export default function BenefitClaimsPage() {
  return (
    <>
      <PageHeader title="Benefit Claims" description="Claims against benefit applications." />
      <DataTable columns={columns} rows={benefitClaims} searchKeys={["employee", "benefitApplication"]} pageSize={10} />
    </>
  );
}
