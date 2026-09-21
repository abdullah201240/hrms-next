"use client"
import { PageHeader } from "@/components/shared/page-header"
import { DataTable, type Column } from "@/components/shared/data-table"
import { StatusBadge } from "@/components/shared/status-badge"
import { Badge } from "@/components/ui/badge"
import { appraisalCycles, type AppraisalCycle } from "@/lib/mock/data-3"
import { fmtDate } from "@/lib/mock/data";

const columns: Column<AppraisalCycle>[] = [
  { key: "name", header: "Cycle", sortable: true, cell: (x) => <span className="font-medium">{x.name}</span> },
  { key: "appraisalTemplate", header: "Template" },
  { key: "startDate", header: "Start", sortable: true, cell: (x) => fmtDate(x.startDate) },
  { key: "endDate", header: "End", sortable: true, cell: (x) => fmtDate(x.endDate) },
  { key: "kraAssessment", header: "KRA", align: "center", className: "hidden lg:table-cell", cell: (x) => <Badge variant={x.kraAssessment ? "secondary" : "outline"}>{x.kraAssessment ? "Yes" : "No"}</Badge> },
  { key: "status", header: "Status", cell: (x) => <StatusBadge status={x.status} /> },
];

export default function AppraisalCyclesPage() {
  return (
    <>
      <PageHeader title="Appraisal Cycles" description="Periodic review cycles." />
      <DataTable columns={columns} rows={appraisalCycles} searchKeys={["name", "appraisalTemplate"]} pageSize={10} />
    </>
  );
}
