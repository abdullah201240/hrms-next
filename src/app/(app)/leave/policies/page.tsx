"use client";

import { PageHeader } from "@/components/shared/page-header";
import { DataTable, type Column } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { leavePolicies, type LeavePolicy } from "@/lib/mock/data-2";

const columns: Column<LeavePolicy>[] = [
  { key: "name", header: "Leave Policy", sortable: true, cell: (x) => <span className="font-medium">{x.name}</span> },
  { key: "applicableTo", header: "Applicable To" },
  { key: "annualAllocation", header: "Annual Days", sortable: true, align: "center" },
  { key: "docStatus", header: "Status", cell: (x) => <StatusBadge status={x.docStatus} /> },
];

export default function LeavePoliciesPage() {
  return (
    <>
      <PageHeader title="Leave Policy" description="Reusable bundles of leave-type entitlements." />
      <DataTable columns={columns} rows={leavePolicies} searchKeys={["name", "applicableTo"]} pageSize={10} />
    </>
  );
}
