"use client"
import { PageHeader } from "@/components/shared/page-header"
import { DataTable, type Column } from "@/components/shared/data-table"
import { Badge } from "@/components/ui/badge"
import { dailyWorkSummaries, type DailyWorkSummary } from "@/lib/mock/data-4";

const columns: Column<DailyWorkSummary>[] = [
  { key: "name", header: "Summary", sortable: true, cell: (x) => <span className="font-medium">{x.name}</span> },
  { key: "template", header: "Template" },
  { key: "group", header: "Group" },
  { key: "recipients", header: "Recipients", sortable: true, align: "center" },
  { key: "enabled", header: "Enabled", align: "center", cell: (x) => <Badge variant={x.enabled ? "secondary" : "outline"}>{x.enabled ? "Yes" : "No"}</Badge> },
];

export default function DailyWorkSummaryPage() {
  return (
    <>
      <PageHeader title="Daily Work Summary Group" description="Automated end-of-day work digests." />
      <DataTable columns={columns} rows={dailyWorkSummaries} searchKeys={["name", "group"]} pageSize={10} />
    </>
  );
}
