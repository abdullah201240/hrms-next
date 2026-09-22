"use client";

import { useMemo, useState } from "react";
import { DataTable, type Column } from "@/components/shared/data-table";
import { StatCard } from "@/components/shared/stat-card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  attendanceRecords,
  employees,
  type AttendanceRecord,
} from "@/lib/mock/data";
import {
  CalendarCheck,
  CalendarX,
  Clock,
  Coffee,
  Download,
  ChevronDown,
  Users,
} from "lucide-react";

const EMP_AVATARS: Record<string, string> = {
  "Aisha Khan": "bg-[#fed7aa] text-[#c2410c] dark:bg-orange-950/70 dark:text-orange-300 dark:border dark:border-orange-500/30",
  "Diego Torres": "bg-[#e9d5ff] text-[#7e22ce] dark:bg-purple-950/70 dark:text-purple-300 dark:border dark:border-purple-500/30",
  "Nina Patel": "bg-[#bbf7d0] text-[#15803d] dark:bg-emerald-950/70 dark:text-emerald-300 dark:border dark:border-emerald-500/30",
  "Elena Vox": "bg-[#fecdd3] text-[#be123c] dark:bg-rose-950/70 dark:text-rose-300 dark:border dark:border-rose-500/30",
  "Leo Martins": "bg-[#ddd6fe] text-[#6d28d9] dark:bg-violet-950/70 dark:text-violet-300 dark:border dark:border-violet-500/30",
  "Yuki Tanaka": "bg-[#bae6fd] text-[#0369a1] dark:bg-sky-950/70 dark:text-sky-300 dark:border dark:border-sky-500/30",
};

const DEPT_BY_NAME: Record<string, string> = Object.fromEntries(
  employees.map((e) => [e.name, e.department]),
);

function initials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function AttendancePage() {
  const [dept, setDept] = useState("all");

  const today = attendanceRecords.filter((a) => a.date === "2026-09-21");
  const count = (s: AttendanceRecord["status"]) => today.filter((a) => a.status === s).length;

  const departments = useMemo(
    () => Array.from(new Set(employees.map((e) => e.department))).sort(),
    [],
  );

  const rows = useMemo(
    () =>
      dept === "all"
        ? attendanceRecords
        : attendanceRecords.filter((a) => DEPT_BY_NAME[a.employeeName] === dept),
    [dept],
  );

  const columns: Column<AttendanceRecord>[] = [
    {
      key: "date",
      header: "Date",
      sortable: true,
      cell: (a) => <span className="tabular-nums text-[13px] text-slate-600 dark:text-slate-300">{a.date}</span>,
    },
    {
      key: "employeeName",
      header: "Employee",
      sortable: true,
      cell: (a) => (
        <div className="flex items-center gap-2.5">
          <Avatar className="size-8">
            <AvatarFallback
              className={`text-xs font-semibold ${
                EMP_AVATARS[a.employeeName] ?? "bg-slate-100 text-slate-700"
              }`}
            >
              {initials(a.employeeName)}
            </AvatarFallback>
          </Avatar>
          <span className="font-medium text-[13px] text-slate-800 dark:text-slate-100">{a.employeeName}</span>
        </div>
      ),
    },
    {
      key: "employeeId",
      header: "Emp ID",
      sortable: true,
      cell: (a) => <span className="text-xs text-slate-400 dark:text-slate-500 font-normal">{a.employeeId}</span>,
    },
    {
      key: "checkIn",
      header: "Check In",
      sortable: true,
      cell: (a) => (
        <span className={`tabular-nums text-[13px] ${a.checkIn === "—" ? "text-slate-400 dark:text-slate-600" : "text-slate-700 dark:text-slate-200"}`}>
          {a.checkIn}
        </span>
      ),
    },
    {
      key: "checkOut",
      header: "Check Out",
      sortable: true,
      cell: (a) => (
        <span className={`tabular-nums text-[13px] ${a.checkOut === "—" ? "text-slate-400 dark:text-slate-600" : "text-slate-700 dark:text-slate-200"}`}>
          {a.checkOut}
        </span>
      ),
    },
    {
      key: "lateBy",
      header: "Late",
      sortable: true,
      cell: (a) => (
        <span className={`tabular-nums text-[13px] ${a.lateBy === "—" ? "text-slate-400 dark:text-slate-600" : "text-slate-700 dark:text-slate-200"}`}>
          {a.lateBy}
        </span>
      ),
    },
    {
      key: "workHours",
      header: "Hours",
      sortable: true,
      cell: (a) => (
        <span className={`tabular-nums text-[13px] ${!a.workHours ? "text-slate-400 dark:text-slate-600" : "text-slate-700 dark:text-slate-200"}`}>
          {a.workHours ? `${a.workHours}h` : "—"}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      cell: (a) => {
        const statusClass =
          a.status === "Present"
            ? "bg-[#e6f9ef] text-[#16a34a] dark:bg-emerald-950/60 dark:text-emerald-300 dark:border dark:border-emerald-500/30"
            : a.status === "Leave"
            ? "bg-[#eef2f6] text-[#64748b] dark:bg-slate-800/90 dark:text-slate-300 dark:border dark:border-slate-700/60"
            : a.status === "Absent"
            ? "bg-[#fef2f2] text-[#ef4444] dark:bg-rose-950/60 dark:text-rose-300 dark:border dark:border-rose-500/30"
            : a.status === "Half Day"
            ? "bg-[#fef9c3] text-[#d97706] dark:bg-amber-950/60 dark:text-amber-300 dark:border dark:border-amber-500/30"
            : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";

        return (
          <span
            className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-medium tracking-tight ${statusClass}`}
          >
            {a.status}
          </span>
        );
      },
    },
  ];

  return (
    <div className="relative space-y-6">
      {/* Exact atmospheric organic background wave matching reference mockup in top-right */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-6 -top-6 h-64 w-96 overflow-hidden opacity-90 select-none"
      >
        <svg
          viewBox="0 0 400 280"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="absolute -right-4 -top-8 h-full w-full"
        >
          <path
            d="M120 0C180 40 220 110 270 140C320 170 380 160 410 150V0H120Z"
            className="fill-[#eaf0fa] dark:fill-blue-950/30"
            fillOpacity="0.7"
          />
          <path
            d="M200 0C250 50 280 90 330 110C370 125 410 115 430 100V0H200Z"
            className="fill-[#dbe6f8] dark:fill-indigo-950/20"
            fillOpacity="0.5"
          />
        </svg>
      </div>

      {/* Top Header */}
      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3.5">
          <div className="flex size-10 items-center justify-center rounded-xl bg-blue-50/90 border border-blue-100 text-blue-600 dark:bg-blue-950/60 dark:border-blue-800/50 dark:text-blue-400 dark:shadow-[0_0_16px_rgba(37,99,235,0.25)]">
            <CalendarCheck className="size-5 stroke-[2.2]" />
          </div>
          <div className="space-y-0.5">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
              Attendance
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Daily attendance register across the organization.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="h-10 gap-2 rounded-xl border border-slate-200/90 bg-white px-3.5 font-medium text-slate-700 shadow-xs hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900/90 dark:text-slate-200 dark:hover:bg-slate-800 dark:shadow-[0_2px_8px_rgba(0,0,0,0.4)]"
            onClick={() => toast.success("Attendance report exported successfully.")}
          >
            <Download className="size-3.5 text-slate-600 dark:text-slate-400" />
            <span className="text-sm">Export</span>
            <ChevronDown className="size-3.5 text-slate-400" />
          </Button>
        </div>
      </div>

      {/* 4 KPI Stat Cards with exact sparkline waves matching reference mockup */}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Present Today"
          value={count("Present")}
          icon={CalendarCheck}
          color="emerald"
          hint="100%"
          trend="up"
          trendColor="emerald"
          sparkPath="M 2 18 C 18 18, 26 21, 38 16 C 50 11, 58 5, 66 8 C 72 11, 76 16, 82 13"
        />
        <StatCard
          label="Absent Today"
          value={count("Absent")}
          icon={CalendarX}
          color="rose"
          hint="0%"
          trend="up"
          trendColor="neutral"
          sparkPath="M 2 20 C 18 20, 32 21, 46 16 C 58 12, 68 12, 82 5"
        />
        <StatCard
          label="On Leave"
          value={count("Leave")}
          icon={Clock}
          color="amber"
          hint="0%"
          trend="up"
          trendColor="emerald"
          sparkPath="M 2 20 C 12 20, 20 12, 30 11 C 40 10, 48 20, 58 14 C 66 9, 72 7, 82 10"
        />
        <StatCard
          label="Half Day"
          value={count("Half Day")}
          icon={Coffee}
          color="purple"
          hint="0%"
          trend="up"
          trendColor="neutral"
          sparkPath="M 2 19 C 14 19, 22 13, 32 14 C 42 15, 48 20, 58 12 C 66 6, 74 8, 82 13"
        />
      </div>

      {/* Register DataTable */}
      <DataTable
        columns={columns}
        rows={rows}
        searchKeys={["employeeName", "employeeId", "status"]}
        searchPlaceholder="Search by name, role or department..."
        pageSize={10}
        selectable
        defaultSortKey="date"
        defaultSortDir="desc"
        filters={
          <Select value={dept} onValueChange={(v) => setDept(v ?? "all")}>
            <SelectTrigger className="h-10 w-full rounded-xl border border-slate-200/90 bg-white font-medium text-slate-700 dark:border-slate-800 dark:bg-slate-900/90 dark:text-slate-200 dark:shadow-[inset_0_1px_2px_rgba(0,0,0,0.4)] sm:w-48">
              <div className="flex items-center gap-2">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="size-4 text-slate-600 dark:text-slate-400"
                >
                  <rect x="4.5" y="4.5" width="15" height="16" rx="2" />
                  <circle cx="12" cy="10" r="2.5" />
                  <path d="M8 17a4 4 0 0 1 8 0" />
                  <path d="M10 2h4" />
                </svg>
                <span className="text-sm">{dept === "all" ? "All Departments" : dept}</span>
              </div>
            </SelectTrigger>
            <SelectContent className="rounded-xl dark:border-slate-800 dark:bg-[#121826] dark:shadow-[0_12px_36px_rgba(0,0,0,0.6)]">
              <SelectItem value="all">All Departments</SelectItem>
              {departments.map((d) => (
                <SelectItem key={d} value={d}>
                  {d}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />
    </div>
  );
}
