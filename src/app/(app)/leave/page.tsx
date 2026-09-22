"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable, type Column } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { StatCard } from "@/components/shared/stat-card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { fmtDate, type LeaveApplication, type LeaveStatus } from "@/lib/mock/data";
import { useLeaveApplications } from "@/hooks/use-leave-applications";
import { leavePrint } from "@/lib/print/print";
import { PrintButton } from "@/components/shared/print/print-dialog";
import { Plus, CalendarDays, CalendarCheck, Clock, CalendarX } from "lucide-react";

const initials = (n: string) => n.split(" ").map((s) => s[0]).slice(0, 2).join("");

const columns: Column<LeaveApplication>[] = [
  {
    key: "employeeName",
    header: "Employee",
    sortable: true,
    cell: (l) => (
      <div className="flex items-center gap-2.5">
        <Avatar className="size-8">
          <AvatarFallback className="text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
            {initials(l.employeeName)}
          </AvatarFallback>
        </Avatar>
        <span className="font-semibold text-slate-800 dark:text-slate-100">{l.employeeName}</span>
      </div>
    ),
  },
  { key: "leaveType", header: "Leave Type", sortable: true },
  {
    key: "from",
    header: "Period",
    cell: (l) => (
      <span className="text-slate-600 dark:text-slate-300">
        {fmtDate(l.from)} → {fmtDate(l.to)}
      </span>
    ),
  },
  { key: "days", header: "Days", sortable: true, align: "right", cell: (l) => <span className="tabular-nums font-semibold text-slate-700 dark:text-slate-200">{l.days}</span> },
  { key: "approver", header: "Approver", className: "hidden lg:table-cell" },
  { key: "status", header: "Status", cell: (l) => <StatusBadge status={l.status} /> },
  { key: "print", header: "", align: "right", cell: (l) => <PrintButton data={() => leavePrint(l)} variant="ghost" label="Print" /> },
];

const FILTERS: ("All" | LeaveStatus)[] = ["All", "Pending", "Approved", "Rejected", "Cancelled"];

export default function LeavePage() {
  const [filter, setFilter] = useState<"All" | LeaveStatus>("All");
  const leaveApplications = useLeaveApplications();
  const rows = filter === "All" ? leaveApplications : leaveApplications.filter((l) => l.status === filter);

  const pendingCount = leaveApplications.filter((l) => l.status === "Pending").length;
  const approvedCount = leaveApplications.filter((l) => l.status === "Approved").length;
  const rejectedCount = leaveApplications.filter((l) => l.status === "Rejected").length;

  return (
    <>
      <PageHeader
        title="Leave Applications"
        description="Track and manage leave requests across the team."
        showExport
        exportWhat="leave applications"
      >
        <Button
          render={<Link href="/leave/apply" />}
          className="h-10 rounded-xl bg-blue-600 px-4 font-semibold text-white hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500"
        >
          <Plus className="size-4" /> New Leave Application
        </Button>
      </PageHeader>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Applications"
          value={leaveApplications.length}
          icon={CalendarDays}
          color="blue"
          hint="+8%"
          trend="up"
          trendColor="emerald"
          sparkPath="M 2 20 C 18 20, 28 14, 42 16 C 56 18, 66 8, 82 12"
        />
        <StatCard
          label="Approved"
          value={approvedCount}
          icon={CalendarCheck}
          color="emerald"
          hint="+12%"
          trend="up"
          trendColor="emerald"
          sparkPath="M 2 21 C 16 21, 26 14, 38 12 C 50 10, 62 4, 82 2"
        />
        <StatCard
          label="Pending Review"
          value={pendingCount}
          icon={Clock}
          color="amber"
          hint="Active"
          trend="up"
          trendColor="amber"
          sparkPath="M 2 20 C 12 20, 20 12, 30 11 C 40 10, 48 20, 58 14 C 66 9, 72 7, 82 10"
        />
        <StatCard
          label="Rejected"
          value={rejectedCount}
          icon={CalendarX}
          color="rose"
          hint="0%"
          trend="down"
          trendColor="neutral"
          sparkPath="M 2 20 C 18 20, 32 21, 46 16 C 58 12, 68 12, 82 5"
        />
      </div>

      <Tabs value={filter} onValueChange={(v) => setFilter(v as "All" | LeaveStatus)}>
        <TabsList className="h-10 rounded-xl bg-slate-100 p-1 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800">
          {FILTERS.map((f) => (
            <TabsTrigger
              key={f}
              value={f}
              className="rounded-lg text-xs font-semibold data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 dark:data-[state=active]:text-white"
            >
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
