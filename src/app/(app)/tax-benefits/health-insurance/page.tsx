"use client"
import { PageHeader } from "@/components/shared/page-header"
import { DataTable, type Column } from "@/components/shared/data-table"
import { StatusBadge } from "@/components/shared/status-badge"
import { employeeHealthInsurances, type EmployeeHealthInsurance } from "@/lib/mock/data-4"
import { fmtDate } from "@/lib/mock/data";

const columns: Column<EmployeeHealthInsurance>[] = [
  { key: "policyNo", header: "Policy", sortable: true, cell: (x) => <span className="font-medium">{x.policyNo}</span> },
  { key: "employee", header: "Employee" },
  { key: "insuranceProvider", header: "Provider" },
  { key: "planType", header: "Plan", className: "hidden lg:table-cell", cell: (x) => <span className="text-muted-foreground">{x.planType}</span> },
  { key: "from", header: "From", cell: (x) => fmtDate(x.from) },
  { key: "to", header: "To", cell: (x) => fmtDate(x.to) },
  { key: "status", header: "Status", cell: (x) => <StatusBadge status={x.status} /> },
];

export default function HealthInsurancePage() {
  return (
    <>
      <PageHeader title="Employee Health Insurance" description="Health insurance policy records." />
      <DataTable columns={columns} rows={employeeHealthInsurances} searchKeys={["policyNo", "employee"]} pageSize={10} />
    </>
  );
}
