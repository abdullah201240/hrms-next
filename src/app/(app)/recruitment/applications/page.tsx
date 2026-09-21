"use client";

import { PageHeader } from "@/components/shared/page-header";
import { DataTable, type Column } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { jobApplications, fmtDate, type JobApplication } from "@/lib/mock/data";
import { Star } from "lucide-react";

function Rating({ value }: { value: number }) {
  if (!value) return <span className="text-xs text-muted-foreground">Not rated</span>;
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={`size-3.5 ${i < value ? "fill-amber-400 text-amber-400" : "text-muted-foreground/40"}`} />
      ))}
    </div>
  );
}

const columns: Column<JobApplication>[] = [
  { key: "applicantName", header: "Applicant", sortable: true, cell: (x) => (
    <div className="space-y-0.5">
      <p className="font-medium">{x.applicantName}</p>
      <p className="text-xs text-muted-foreground">{x.email}</p>
    </div>
  ) },
  { key: "jobTitle", header: "Position", sortable: true },
  { key: "source", header: "Source", className: "hidden lg:table-cell text-muted-foreground" },
  { key: "appliedOn", header: "Applied", sortable: true, cell: (x) => fmtDate(x.appliedOn) },
  { key: "rating", header: "Rating", sortable: true, cell: (x) => <Rating value={x.rating} /> },
  { key: "status", header: "Status", cell: (x) => <StatusBadge status={x.status} /> },
];

export default function JobApplicationsPage() {
  return (
    <>
      <PageHeader title="Applications" description={`${jobApplications.length} candidate applications received.`} />
      <DataTable columns={columns} rows={jobApplications} searchKeys={["applicantName", "email", "jobTitle", "source"]} pageSize={10} />
    </>
  );
}
