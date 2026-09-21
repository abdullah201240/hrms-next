"use client"
import { PageHeader } from "@/components/shared/page-header"
import { DataTable, type Column } from "@/components/shared/data-table"
import { employeeBenefitLedgers, type EmployeeBenefitLedger } from "@/lib/mock/data-4"
import { fmtMoney } from "@/lib/mock/data";

const columns: Column<EmployeeBenefitLedger>[] = [
  { key: "employee", header: "Employee", sortable: true, cell: (x) => <span className="font-medium">{x.employee}</span> },
  { key: "benefitApplication", header: "Application" },
  { key: "amountEligible", header: "Eligible", sortable: true, align: "right", cell: (x) => <span className="tabular-nums font-medium">{fmtMoney(x.amountEligible)}</span> },
  { key: "amountSanctioned", header: "Sanctioned", sortable: true, align: "right", cell: (x) => <span className="tabular-nums font-medium">{fmtMoney(x.amountSanctioned)}</span> },
  { key: "amountUtilized", header: "Utilized", sortable: true, align: "right", cell: (x) => <span className="tabular-nums font-medium">{fmtMoney(x.amountUtilized)}</span> },
];

export default function BenefitLedgerPage() {
  return (
    <>
      <PageHeader title="Employee Benefit Ledger" description="Benefit eligibility, sanction & utilization." />
      <DataTable columns={columns} rows={employeeBenefitLedgers} searchKeys={["employee", "benefitApplication"]} pageSize={10} />
    </>
  );
}
