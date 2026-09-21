"use client";

import { PageHeader } from "@/components/shared/page-header";
import { DataTable, type Column } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { leaveTypes, type LeaveType } from "@/lib/mock/data";

const yesNo = (v: boolean) => <Badge variant={v ? "secondary" : "outline"}>{v ? "Yes" : "No"}</Badge>;

const columns: Column<LeaveType>[] = [
  { key: "name", header: "Leave Type", sortable: true, cell: (x) => <span className="font-medium">{x.name}</span> },
  { key: "code", header: "Code" },
  { key: "maxDays", header: "Max Days", sortable: true, align: "center" },
  { key: "paid", header: "Paid", align: "center", cell: (x) => yesNo(x.paid) },
  { key: "carryForward", header: "Carry Forward", align: "center", cell: (x) => yesNo(x.carryForward) },
];

export default function LeaveTypesPage() {
  return (
    <>
      <PageHeader title="Leave Types" description="Configurable leave categories and their rules." />
      <DataTable columns={columns} rows={leaveTypes} searchKeys={["name", "code"]} pageSize={10} />
    </>
  );
}
