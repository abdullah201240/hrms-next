"use client";

import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable, type Column } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { StatCard } from "@/components/shared/stat-card";
import { attendanceRecords, type AttendanceRecord } from "@/lib/mock/data";
import { Download, CalendarCheck, CalendarX, Clock, Coffee } from "lucide-react";

const columns: Column<AttendanceRecord>[] = [
  { key: "date", header: "Date", sortable: true },
  { key: "employeeName", header: "Employee", sortable: true },
  { key: "employeeId", header: "Emp ID", className: "hidden md:table-cell text-muted-foreground" },
  { key: "checkIn", header: "Check In", align: "center" },
  { key: "checkOut", header: "Check Out", align: "center" },
  { key: "lateBy", header: "Late", align: "center", className: "hidden sm:table-cell" },
  {
    key: "workHours",
    header: "Hours",
    sortable: true,
    align: "right",
    cell: (a) => <span className="tabular-nums">{a.workHours ? `${a.workHours}h` : "—"}</span>,
  },
  { key: "status", header: "Status", cell: (a) => <StatusBadge status={a.status} /> },
];

export default function AttendancePage() {
  const today = attendanceRecords.filter((a) => a.date === "2026-09-21");
  const count = (s: AttendanceRecord["status"]) => today.filter((a) => a.status === s).length;

  return (
    <>
      <PageHeader title="Attendance" description="Daily attendance register across the organization.">
        <Button variant="outline"><Download /> Export</Button>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Present Today" value={count("Present")} icon={CalendarCheck} />
        <StatCard label="Absent Today" value={count("Absent")} icon={CalendarX} />
        <StatCard label="On Leave" value={count("Leave")} icon={Clock} />
        <StatCard label="Half Day" value={count("Half Day")} icon={Coffee} />
      </div>

      <DataTable
        columns={columns}
        rows={attendanceRecords}
        searchKeys={["employeeName", "employeeId", "status"]}
        pageSize={10}
      />
    </>
  );
}
