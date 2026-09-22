"use client";

import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { DataTable, type Column } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Plus, Clock, CheckCircle2, FileText } from "lucide-react";
import { timesheets, type Timesheet } from "@/lib/mock/data-2";
import { fmtDate } from "@/lib/mock/data";

const columns: Column<Timesheet>[] = [
  { key: "project", header: "Project", sortable: true, cell: (x) => <span className="font-medium">{x.project}</span> },
  { key: "fromDate", header: "From", sortable: true, cell: (x) => fmtDate(x.fromDate) },
  { key: "toDate", header: "To", cell: (x) => fmtDate(x.toDate) },
  { key: "totalHours", header: "Hours", align: "center", sortable: true },
  { key: "status", header: "Status", cell: (x) => <StatusBadge status={x.status} /> },
];

export default function MyTimesheetsPage() {
  const totalHours = timesheets.reduce((n, t) => n + t.totalHours, 0);
  const submitted = timesheets.filter((t) => t.status !== "Draft").length;

  return (
    <>
      <PageHeader
        title="My Timesheets"
        description="Time you have logged against projects."
        backHref="/attendance"
        backLabel="Back to Attendance"
        showExport
        exportWhat="timesheets"
      >
        <Button
          render={<Link href="/attendance/my-timesheets/new" />}
          className="h-10 rounded-xl bg-blue-600 px-4 font-semibold text-white hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500"
        >
          <Plus className="size-4" />
          Log Time
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total Hours Logged" value={totalHours} icon={Clock} />
        <StatCard label="Submitted" value={submitted} icon={CheckCircle2} />
        <StatCard label="Timesheets" value={timesheets.length} icon={FileText} />
      </div>

      <div className="mt-6">
        <DataTable columns={columns} rows={timesheets} searchKeys={["project"]} pageSize={10} />
      </div>
    </>
  );
}
