"use client"
import { PageHeader } from "@/components/shared/page-header"
import { DataTable, type Column } from "@/components/shared/data-table"
import { appraisalTemplates, type AppraisalTemplate } from "@/lib/mock/data-3";

const columns: Column<AppraisalTemplate>[] = [
  { key: "name", header: "Template", sortable: true, cell: (x) => <span className="font-medium">{x.name}</span> },
  { key: "description", header: "Description", cell: (x) => <span className="text-muted-foreground">{x.description}</span> },
  { key: "totalScore", header: "Max Score", sortable: true, align: "center" },
];

export default function AppraisalTemplatesPage() {
  return (
    <>
      <PageHeader title="Appraisal Templates" description="Scoring templates for reviews." />
      <DataTable columns={columns} rows={appraisalTemplates} searchKeys={["name", "description"]} pageSize={10} />
    </>
  );
}
