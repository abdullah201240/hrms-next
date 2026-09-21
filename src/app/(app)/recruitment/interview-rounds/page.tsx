"use client";

import { PageHeader } from "@/components/shared/page-header";
import { DataTable, type Column } from "@/components/shared/data-table";
import { interviewRounds, type InterviewRound } from "@/lib/mock/data-3";

const columns: Column<InterviewRound>[] = [
  { key: "name", header: "Round", sortable: true, cell: (x) => <span className="font-medium">{x.name}</span> },
  { key: "interviewType", header: "Type", sortable: true },
  { key: "expectedDuration", header: "Expected Duration (min)", align: "center", sortable: true },
];

export default function InterviewRoundsPage() {
  return (
    <>
      <PageHeader title="Interview Rounds" description="Standard interview stages used in recruitment." />
      <DataTable columns={columns} rows={interviewRounds} searchKeys={["name", "interviewType"]} pageSize={10} />
    </>
  );
}
