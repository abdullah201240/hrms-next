"use client"
import { PageHeader } from "@/components/shared/page-header"
import { DataTable, type Column } from "@/components/shared/data-table"
import { StatusBadge } from "@/components/shared/status-badge"
import { benefitApplications, type BenefitApplication } from "@/lib/mock/data-3"
import { fmtMoney } from "@/lib/mock/data";

const columns: Column<BenefitApplication>[] = [
  { key: "employee", header: "Employee", sortable: true, cell: (x) => <span className="font-medium">{x.employee}</span> },
  { key: "payrollPeriod", header: "Period", align: "center" },
  { key: "maxBeneficiaryAmount", header: "Max Amount", sortable: true, align: "right", cell: (x) => <span className="tabular-nums font-medium">{fmtMoney(x.maxBeneficiaryAmount)}</span> },
  { key: "status", header: "Status", cell: (x) => <StatusBadge status={x.status} /> },
];

export default function BenefitApplicationsPage() {
  return (
    <>
      <PageHeader title="Benefit Applications" description="Employee benefit coverage." />
      <DataTable columns={columns} rows={benefitApplications} searchKeys={["employee"]} pageSize={10} />
    </>
  );
}
