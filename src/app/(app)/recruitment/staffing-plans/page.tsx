"use client"
import { PageHeader } from "@/components/shared/page-header"
import { DataTable, type Column } from "@/components/shared/data-table"
import { StatusBadge } from "@/components/shared/status-badge"
import { staffingPlans, type StaffingPlan } from "@/lib/mock/data-3";

const columns: Column<StaffingPlan>[] = [
  { key: "month", header: "Month", sortable: true, cell: (x) => <span className="font-medium">{x.month}</span> },
  { key: "department", header: "Department" },
  { key: "designation", header: "Designation" },
  { key: "employeesRequired", header: "Required", sortable: true, align: "center" },
  { key: "currentlyEmployed", header: "Current", sortable: true, align: "center" },
  { key: "status", header: "Status", cell: (x) => <StatusBadge status={x.status} /> },
];

export default function StaffingPlansPage() {
  return (
    <>
      <PageHeader title="Staffing Plans" description="Planned vs current headcount." />
      <DataTable columns={columns} rows={staffingPlans} searchKeys={["department", "designation"]} pageSize={10} />
    </>
  );
}
