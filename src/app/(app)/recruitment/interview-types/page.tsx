"use client"
import { PageHeader } from "@/components/shared/page-header"
import { DataTable, type Column } from "@/components/shared/data-table"
import { interviewTypes, type InterviewType } from "@/lib/mock/data-4";

const columns: Column<InterviewType>[] = [
  { key: "name", header: "Interview Type", sortable: true, cell: (x) => <span className="font-medium">{x.name}</span> },
  { key: "description", header: "Description", cell: (x) => <span className="text-muted-foreground">{x.description}</span> },
];

export default function InterviewTypesPage() {
  return (
    <>
      <PageHeader title="Interview Types" description="Classifications used when scheduling interviews." />
      <DataTable columns={columns} rows={interviewTypes} searchKeys={["name", "description"]} pageSize={10} />
    </>
  );
}
