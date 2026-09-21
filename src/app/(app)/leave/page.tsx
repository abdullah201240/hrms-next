"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable, type Column } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { leaveApplications, fmtDate, type LeaveApplication, type LeaveStatus } from "@/lib/mock/data";
import { Plus } from "lucide-react";

const columns: Column<LeaveApplication>[] = [
  { key: "employeeName", header: "Employee", sortable: true },
  { key: "leaveType", header: "Leave Type", sortable: true },
  {
    key: "from",
    header: "Period",
    cell: (l) => (
      <span className="text-muted-foreground">
        {fmtDate(l.from)} → {fmtDate(l.to)}
      </span>
    ),
  },
  { key: "days", header: "Days", sortable: true, align: "right", cell: (l) => <span className="tabular-nums">{l.days}</span> },
  { key: "approver", header: "Approver", className: "hidden lg:table-cell" },
  { key: "status", header: "Status", cell: (l) => <StatusBadge status={l.status} /> },
];

const FILTERS: ("All" | LeaveStatus)[] = ["All", "Pending", "Approved", "Rejected", "Cancelled"];

export default function LeavePage() {
  const [filter, setFilter] = useState<"All" | LeaveStatus>("All");
  const rows = filter === "All" ? leaveApplications : leaveApplications.filter((l) => l.status === filter);

  return (
    <>
      <PageHeader title="Leave Applications" description="Track and manage leave requests across the team.">
        <Button render={<Link href="/leave/apply" />}><Plus /> Apply Leave</Button>
      </PageHeader>

      <Tabs value={filter} onValueChange={(v) => setFilter(v as "All" | LeaveStatus)}>
        <TabsList>
          {FILTERS.map((f) => (
            <TabsTrigger key={f} value={f}>
              {f}
              {f !== "All" && (
                <span className="ml-1.5 text-xs text-muted-foreground">
                  ({leaveApplications.filter((l) => l.status === f).length})
                </span>
              )}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <DataTable columns={columns} rows={rows} searchKeys={["employeeName", "leaveType", "reason"]} pageSize={10} />
    </>
  );
}
