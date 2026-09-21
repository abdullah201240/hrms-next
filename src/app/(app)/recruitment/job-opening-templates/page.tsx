"use client"
import { PageHeader } from "@/components/shared/page-header"
import { DataTable, type Column } from "@/components/shared/data-table"
import { jobOpeningTemplates, type JobOpeningTemplate } from "@/lib/mock/data-4";

const columns: Column<JobOpeningTemplate>[] = [
  { key: "name", header: "Template", sortable: true, cell: (x) => <span className="font-medium">{x.name}</span> },
  { key: "description", header: "Description", cell: (x) => <span className="text-muted-foreground">{x.description}</span> },
];

export default function JobOpeningTemplatesPage() {
  return (
    <>
      <PageHeader title="Job Opening Templates" description="Reusable templates for creating job openings." />
      <DataTable columns={columns} rows={jobOpeningTemplates} searchKeys={["name", "description"]} pageSize={10} />
    </>
  );
}
