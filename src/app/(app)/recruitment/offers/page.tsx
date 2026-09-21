"use client"
import { PageHeader } from "@/components/shared/page-header"
import { DataTable, type Column } from "@/components/shared/data-table"
import { StatusBadge } from "@/components/shared/status-badge"
import { jobOffers, type JobOffer } from "@/lib/mock/data-3"
import { fmtDate, fmtMoney } from "@/lib/mock/data";

const columns: Column<JobOffer>[] = [
  { key: "applicantName", header: "Candidate", sortable: true, cell: (x) => <span className="font-medium">{x.applicantName}</span> },
  { key: "designation", header: "Designation" },
  { key: "offerDate", header: "Offer Date", sortable: true, cell: (x) => fmtDate(x.offerDate) },
  { key: "base", header: "Base", sortable: true, align: "right", cell: (x) => <span className="tabular-nums font-medium">{fmtMoney(x.base)}</span> },
  { key: "status", header: "Status", cell: (x) => <StatusBadge status={x.status} /> },
];

export default function JobOffersPage() {
  return (
    <>
      <PageHeader title="Job Offers" description="Offers extended to candidates." />
      <DataTable columns={columns} rows={jobOffers} searchKeys={["applicantName", "jobTitle"]} pageSize={10} />
    </>
  );
}
