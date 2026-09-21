"use client";

import { PageHeader } from "@/components/shared/page-header";
import { DataTable, type Column } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { appraisals, fmtDate, type Appraisal } from "@/lib/mock/data";

const columns: Column<Appraisal>[] = [
  { key: "employeeName", header: "Employee", sortable: true, cell: (x) => (
    <div className="space-y-0.5">
      <p className="font-medium">{x.employeeName}</p>
      <p className="text-xs text-muted-foreground">{x.employeeId}</p>
    </div>
  ) },
  { key: "department", header: "Department", sortable: true, className: "hidden lg:table-cell" },
  { key: "cycle", header: "Cycle" },
  { key: "selfRating", header: "Self", align: "center", cell: (x) => (x.selfRating ? `${x.selfRating}/5` : "—") },
  { key: "managerRating", header: "Manager", align: "center", cell: (x) => (x.managerRating ? `${x.managerRating}/5` : "—") },
  { key: "finalScore", header: "Score", sortable: true, align: "center", cell: (x) => (x.finalScore ? <span className="tabular-nums font-medium">{x.finalScore}</span> : "—") },
  { key: "dueOn", header: "Due", sortable: true, cell: (x) => fmtDate(x.dueOn) },
  { key: "status", header: "Status", cell: (x) => <StatusBadge status={x.status} /> },
];

export default function AppraisalsPage() {
  return (
    <>
      <PageHeader title="Appraisals" description="Performance review cycles and ratings." />
      <DataTable columns={columns} rows={appraisals} searchKeys={["employeeName", "employeeId", "department", "cycle"]} pageSize={10} />
    </>
  );
}
