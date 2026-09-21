"use client"
import { PageHeader } from "@/components/shared/page-header"
import { DataTable, type Column } from "@/components/shared/data-table"
import { StatusBadge } from "@/components/shared/status-badge"
import { retentionBonuses, type RetentionBonus } from "@/lib/mock/data-2"
import { fmtDate, fmtMoney } from "@/lib/mock/data";

const columns: Column<RetentionBonus>[] = [
  { key: "employee", header: "Employee", sortable: true, cell: (x) => <span className="font-medium">{x.employee}</span> },
  { key: "bonusPaymentPlan", header: "Plan" },
  { key: "bonusAmount", header: "Amount", sortable: true, align: "right", cell: (x) => <span className="tabular-nums font-medium">{fmtMoney(x.bonusAmount)}</span> },
  { key: "bonusPaymentDate", header: "Payment Date", sortable: true, cell: (x) => fmtDate(x.bonusPaymentDate) },
  { key: "payoutStatus", header: "Status", cell: (x) => <StatusBadge status={x.payoutStatus} /> },
];

export default function RetentionBonusPage() {
  return (
    <>
      <PageHeader title="Retention Bonus" description="Scheduled retention bonus payouts." />
      <DataTable columns={columns} rows={retentionBonuses} searchKeys={["employee", "bonusPaymentPlan"]} pageSize={10} />
    </>
  );
}
