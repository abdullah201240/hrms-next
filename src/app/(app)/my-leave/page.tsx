"use client";

import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { DataTable, type Column } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Plus, Inbox, Clock, CheckCircle2, CalendarDays, Wallet } from "lucide-react";
import { leaveApplications, type LeaveApplication } from "@/lib/mock/data";
import { fmtDate } from "@/lib/mock/data";
import { leavePrint } from "@/lib/print/print";
import { PrintButton } from "@/components/shared/print/print-dialog";

const columns: Column<LeaveApplication>[] = [
  { key: "employeeName", header: "Employee", sortable: true, cell: (x) => <span className="font-medium">{x.employeeName}</span> },
  { key: "leaveType", header: "Leave Type", sortable: true },
  { key: "from", header: "From", sortable: true, cell: (x) => fmtDate(x.from) },
  { key: "to", header: "To", sortable: true, cell: (x) => fmtDate(x.to) },
  { key: "days", header: "Days", align: "center" },
  { key: "status", header: "Status", cell: (x) => <StatusBadge status={x.status} /> },
  { key: "print", header: "", align: "right", cell: (x) => <PrintButton data={() => leavePrint(x)} variant="ghost" label="Print" /> },
];

export default function MyLeavePage() {
  const pending = leaveApplications.filter((a) => a.status === "Pending").length;
  const approved = leaveApplications.filter((a) => a.status === "Approved");
  const daysTaken = approved.reduce((n, a) => n + a.days, 0);

  return (
    <>
      <PageHeader title="My Leave" description="Your leave overview, balances and recent requests.">
        <Button render={<Link href="/leave/apply" />}>
          <Plus className="size-4" />
          Apply Leave
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Requests" value={leaveApplications.length} icon={Inbox} />
        <StatCard label="Pending" value={pending} icon={Clock} hint="Awaiting approval" trend="flat" />
        <StatCard label="Approved" value={approved.length} icon={CheckCircle2} />
        <StatCard label="Days Taken" value={daysTaken} icon={CalendarDays} />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button variant="outline" size="sm" render={<Link href="/leave/balances" />}>
          <Wallet className="size-4" />
          View My Balances
        </Button>
      </div>

      <div className="mt-6">
        <h2 className="pb-3 text-lg font-semibold tracking-tight">Recent Applications</h2>
        <DataTable columns={columns} rows={leaveApplications} searchKeys={["employeeName", "leaveType"]} pageSize={10} />
      </div>
    </>
  );
}
