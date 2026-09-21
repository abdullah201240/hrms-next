"use client"
import { PageHeader } from "@/components/shared/page-header"
import { DataTable, type Column } from "@/components/shared/data-table"
import { feedbackCriteria, type FeedbackCriteria } from "@/lib/mock/data-4";

const columns: Column<FeedbackCriteria>[] = [
  { key: "name", header: "Criteria", sortable: true, cell: (x) => <span className="font-medium">{x.name}</span> },
  { key: "category", header: "Category", sortable: true },
];

export default function FeedbackCriteriaPage() {
  return (
    <>
      <PageHeader title="Feedback Criteria" description="Criteria used across appraisal feedback forms." />
      <DataTable columns={columns} rows={feedbackCriteria} searchKeys={["name", "category"]} pageSize={10} />
    </>
  );
}
