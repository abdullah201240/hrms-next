"use client"
import { PageHeader } from "@/components/shared/page-header"
import { DataTable, type Column } from "@/components/shared/data-table"
import { StatusBadge } from "@/components/shared/status-badge"
import { employeeReferrals, type EmployeeReferral } from "@/lib/mock/data-3";

const columns: Column<EmployeeReferral>[] = [
  { key: "applicantName", header: "Candidate", sortable: true, cell: (x) => <span className="font-medium">{x.applicantName}</span> },
  { key: "referringEmployee", header: "Referred By" },
  { key: "jobTitle", header: "Job Title", cell: (x) => <span className="text-muted-foreground">{x.jobTitle}</span> },
  { key: "status", header: "Status", cell: (x) => <StatusBadge status={x.status} /> },
];

export default function EmployeeReferralsPage() {
  return (
    <>
      <PageHeader title="Employee Referrals" description="Candidate referrals by employees." />
      <DataTable columns={columns} rows={employeeReferrals} searchKeys={["applicantName", "referringEmployee"]} pageSize={10} />
    </>
  );
}
