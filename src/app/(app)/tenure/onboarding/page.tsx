"use client"
import { PageHeader } from "@/components/shared/page-header"
import { DataTable, type Column } from "@/components/shared/data-table"
import { StatusBadge } from "@/components/shared/status-badge"
import { onboardings, type EmployeeOnboarding } from "@/lib/mock/data-3"
import { fmtDate } from "@/lib/mock/data";

const columns: Column<EmployeeOnboarding>[] = [
  { key: "employeeName", header: "New Hire", sortable: true, cell: (x) => <span className="font-medium">{x.employeeName}</span> },
  { key: "dateOfJoining", header: "Joining", sortable: true, cell: (x) => fmtDate(x.dateOfJoining) },
  { key: "jobOffer", header: "Job Offer", className: "hidden lg:table-cell", cell: (x) => <span className="text-muted-foreground">{x.jobOffer}</span> },
  { key: "boardingStatus", header: "Boarding" },
  { key: "status", header: "Status", cell: (x) => <StatusBadge status={x.status} /> },
];

export default function OnboardingPage() {
  return (
    <>
      <PageHeader title="Employee Onboarding" description="New-hire onboarding records." />
      <DataTable columns={columns} rows={onboardings} searchKeys={["employeeName", "jobOffer"]} pageSize={10} />
    </>
  );
}
