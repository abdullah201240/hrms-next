"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable, type Column } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { jobOpenings, fmtDate, type JobOpening } from "@/lib/mock/data";
import { Plus } from "lucide-react";

const columns: Column<JobOpening>[] = [
  { key: "title", header: "Job Title", sortable: true, cell: (x) => <span className="font-medium">{x.title}</span> },
  { key: "department", header: "Department", sortable: true },
  { key: "location", header: "Location", className: "hidden lg:table-cell text-muted-foreground" },
  { key: "type", header: "Type", cell: (x) => <Badge variant="secondary">{x.type}</Badge> },
  { key: "openings", header: "Openings", sortable: true, align: "center" },
  { key: "postedOn", header: "Posted", sortable: true, cell: (x) => fmtDate(x.postedOn) },
  { key: "status", header: "Status", cell: (x) => <StatusBadge status={x.status} /> },
];

export default function JobOpeningsPage() {
  return (
    <>
      <PageHeader title="Job Openings" description={`${jobOpenings.filter((j) => j.status === "Open").length} positions currently open.`}>
        <Button render={<Link href="/recruitment/jobs/new" />}><Plus /> New Opening</Button>
      </PageHeader>
      <DataTable columns={columns} rows={jobOpenings} searchKeys={["title", "department", "location", "type"]} pageSize={10} />
    </>
  );
}
