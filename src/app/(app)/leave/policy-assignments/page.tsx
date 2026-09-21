"use client";

import { PageHeader } from "@/components/shared/page-header";
import { DataTable, type Column } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { leavePolicyAssignments, type LeavePolicyAssignment } from "@/lib/mock/data-2";
import { fmtDate } from "@/lib/mock/data";

const columns: Column<LeavePolicyAssignment>[] = [
  { key: "employee", header: "Employee", sortable: true, cell: (x) => <span className="font-medium">{x.employee}</span> },
  { key: "policy", header: "Leave Policy" },
  { key: "leavePeriod", header: "Leave Period", className: "hidden lg:table-cell" },
  { key: "effectiveFrom", header: "Effective From", cell: (x) => fmtDate(x.effectiveFrom) },
  { key: "status", header: "Status", cell: (x) => <StatusBadge status={x.status} /> },
];

export default function LeavePolicyAssignmentsPage() {
  return (
    <>
      <PageHeader title="Leave Policy Assignment" description="Assign leave policies to employees for a period." />
      <DataTable columns={columns} rows={leavePolicyAssignments} searchKeys={["employee", "policy"]} pageSize={10} />
    </>
  );
}
