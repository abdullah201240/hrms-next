"use client";

import { PageHeader } from "@/components/shared/page-header";
import { DataTable, type Column } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { leavePeriods, type LeavePeriod } from "@/lib/mock/data-2";
import { fmtDate } from "@/lib/mock/data";

const columns: Column<LeavePeriod>[] = [
  { key: "name", header: "Leave Period", sortable: true, cell: (x) => <span className="font-medium">{x.name}</span> },
  { key: "from", header: "Start Date", cell: (x) => fmtDate(x.from) },
  { key: "to", header: "End Date", cell: (x) => fmtDate(x.to) },
  { key: "isAccual", header: "Accrued", align: "center", cell: (x) => <Badge variant={x.isAccual ? "secondary" : "outline"}>{x.isAccual ? "Yes" : "No"}</Badge> },
];

export default function LeavePeriodsPage() {
  return (
    <>
      <PageHeader title="Leave Period" description="Duration over which leaves are allocated and consumed." />
      <DataTable columns={columns} rows={leavePeriods} searchKeys={["name"]} pageSize={10} />
    </>
  );
}
