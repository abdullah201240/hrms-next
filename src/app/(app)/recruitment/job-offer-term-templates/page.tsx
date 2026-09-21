"use client"
import { PageHeader } from "@/components/shared/page-header"
import { DataTable, type Column } from "@/components/shared/data-table"
import { jobOfferTermTemplates, type JobOfferTermTemplate } from "@/lib/mock/data-4";

const columns: Column<JobOfferTermTemplate>[] = [
  { key: "name", header: "Term Template", sortable: true, cell: (x) => <span className="font-medium">{x.name}</span> },
  { key: "offerTerm", header: "Offer Term", sortable: true },
  { key: "weight", header: "Weight", align: "center", cell: (x) => <span className="tabular-nums">{x.weight}%</span> },
];

export default function JobOfferTermTemplatesPage() {
  return (
    <>
      <PageHeader title="Job Offer Term Templates" description="Standard terms attached to job offers." />
      <DataTable columns={columns} rows={jobOfferTermTemplates} searchKeys={["name", "offerTerm"]} pageSize={10} />
    </>
  );
}
