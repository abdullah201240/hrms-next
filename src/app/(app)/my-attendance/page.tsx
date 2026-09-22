"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { DataTable, type Column } from "@/components/shared/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { currentUser } from "@/lib/mock/data";
import {
  CalendarCheck,
  Clock,
  Coffee,
  CalendarDays,
  LogIn,
  LogOut,
  MapPin,
  ShieldCheck,
  FileText,
  Plus,
  Timer,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  Sparkles,
  ArrowUpRight,
  Info,
} from "lucide-react";

export type MyAttendanceRecord = {
  date: string;
  weekday: string;
  dayNum: number;
  shift: string;
  checkIn: string;
  checkOut: string;
  lateBy: string;
  workHours: number;
  status: "Present" | "Late" | "Half Day" | "Leave" | "Week Off" | "Upcoming";
  notes?: string;
};

// Full September 2026 attendance dataset for currentUser
const initialRecords: MyAttendanceRecord[] = [
  { date: "2026-09-21", weekday: "Mon", dayNum: 21, shift: "General (09:00 - 18:00)", checkIn: "08:58 AM", checkOut: "—", lateBy: "0m", workHours: 9.0, status: "Present", notes: "Shift active" },
  { date: "2026-09-20", weekday: "Sun", dayNum: 20, shift: "General (09:00 - 18:00)", checkIn: "09:01 AM", checkOut: "06:12 PM", lateBy: "1m", workHours: 9.2, status: "Present" },
  { date: "2026-09-19", weekday: "Sat", dayNum: 19, shift: "Weekly Off", checkIn: "—", checkOut: "—", lateBy: "—", workHours: 0, status: "Week Off" },
  { date: "2026-09-18", weekday: "Fri", dayNum: 18, shift: "Weekly Off", checkIn: "—", checkOut: "—", lateBy: "—", workHours: 0, status: "Week Off" },
  { date: "2026-09-17", weekday: "Thu", dayNum: 17, shift: "General (09:00 - 18:00)", checkIn: "09:24 AM", checkOut: "05:58 PM", lateBy: "24m", workHours: 8.6, status: "Late", notes: "Traffic delay" },
  { date: "2026-09-16", weekday: "Wed", dayNum: 16, shift: "General (09:00 - 18:00)", checkIn: "—", checkOut: "—", lateBy: "—", workHours: 0, status: "Leave", notes: "Casual Leave" },
  { date: "2026-09-15", weekday: "Tue", dayNum: 15, shift: "General (09:00 - 18:00)", checkIn: "08:55 AM", checkOut: "01:05 PM", lateBy: "0m", workHours: 4.1, status: "Half Day", notes: "Approved half day" },
  { date: "2026-09-14", weekday: "Mon", dayNum: 14, shift: "General (09:00 - 18:00)", checkIn: "08:52 AM", checkOut: "06:10 PM", lateBy: "0m", workHours: 9.3, status: "Present" },
  { date: "2026-09-13", weekday: "Sun", dayNum: 13, shift: "General (09:00 - 18:00)", checkIn: "09:04 AM", checkOut: "06:30 PM", lateBy: "4m", workHours: 9.4, status: "Present" },
  { date: "2026-09-12", weekday: "Sat", dayNum: 12, shift: "Weekly Off", checkIn: "—", checkOut: "—", lateBy: "—", workHours: 0, status: "Week Off" },
  { date: "2026-09-11", weekday: "Fri", dayNum: 11, shift: "Weekly Off", checkIn: "—", checkOut: "—", lateBy: "—", workHours: 0, status: "Week Off" },
  { date: "2026-09-10", weekday: "Thu", dayNum: 10, shift: "General (09:00 - 18:00)", checkIn: "08:57 AM", checkOut: "06:05 PM", lateBy: "0m", workHours: 9.1, status: "Present" },
  { date: "2026-09-09", weekday: "Wed", dayNum: 9, shift: "General (09:00 - 18:00)", checkIn: "08:50 AM", checkOut: "06:22 PM", lateBy: "0m", workHours: 9.5, status: "Present" },
  { date: "2026-09-08", weekday: "Tue", dayNum: 8, shift: "General (09:00 - 18:00)", checkIn: "09:18 AM", checkOut: "06:15 PM", lateBy: "18m", workHours: 9.0, status: "Late", notes: "Weather alert" },
  { date: "2026-09-07", weekday: "Mon", dayNum: 7, shift: "General (09:00 - 18:00)", checkIn: "08:59 AM", checkOut: "06:08 PM", lateBy: "0m", workHours: 9.1, status: "Present" },
  { date: "2026-09-06", weekday: "Sun", dayNum: 6, shift: "General (09:00 - 18:00)", checkIn: "08:54 AM", checkOut: "06:00 PM", lateBy: "0m", workHours: 9.1, status: "Present" },
  { date: "2026-09-05", weekday: "Sat", dayNum: 5, shift: "Weekly Off", checkIn: "—", checkOut: "—", lateBy: "—", workHours: 0, status: "Week Off" },
  { date: "2026-09-04", weekday: "Fri", dayNum: 4, shift: "Weekly Off", checkIn: "—", checkOut: "—", lateBy: "—", workHours: 0, status: "Week Off" },
  { date: "2026-09-03", weekday: "Thu", dayNum: 3, shift: "General (09:00 - 18:00)", checkIn: "08:56 AM", checkOut: "06:14 PM", lateBy: "0m", workHours: 9.3, status: "Present" },
  { date: "2026-09-02", weekday: "Wed", dayNum: 2, shift: "General (09:00 - 18:00)", checkIn: "09:00 AM", checkOut: "06:00 PM", lateBy: "0m", workHours: 9.0, status: "Present" },
  { date: "2026-09-01", weekday: "Tue", dayNum: 1, shift: "General (09:00 - 18:00)", checkIn: "08:58 AM", checkOut: "06:05 PM", lateBy: "0m", workHours: 9.1, status: "Present" },
  // Upcoming days of September
  { date: "2026-09-22", weekday: "Tue", dayNum: 22, shift: "General (09:00 - 18:00)", checkIn: "—", checkOut: "—", lateBy: "—", workHours: 0, status: "Upcoming" },
  { date: "2026-09-23", weekday: "Wed", dayNum: 23, shift: "General (09:00 - 18:00)", checkIn: "—", checkOut: "—", lateBy: "—", workHours: 0, status: "Upcoming" },
  { date: "2026-09-24", weekday: "Thu", dayNum: 24, shift: "General (09:00 - 18:00)", checkIn: "—", checkOut: "—", lateBy: "—", workHours: 0, status: "Upcoming" },
  { date: "2026-09-25", weekday: "Fri", dayNum: 25, shift: "Weekly Off", checkIn: "—", checkOut: "—", lateBy: "—", workHours: 0, status: "Week Off" },
  { date: "2026-09-26", weekday: "Sat", dayNum: 26, shift: "Weekly Off", checkIn: "—", checkOut: "—", lateBy: "—", workHours: 0, status: "Week Off" },
  { date: "2026-09-27", weekday: "Sun", dayNum: 27, shift: "General (09:00 - 18:00)", checkIn: "—", checkOut: "—", lateBy: "—", workHours: 0, status: "Upcoming" },
  { date: "2026-09-28", weekday: "Mon", dayNum: 28, shift: "General (09:00 - 18:00)", checkIn: "—", checkOut: "—", lateBy: "—", workHours: 0, status: "Upcoming" },
  { date: "2026-09-29", weekday: "Tue", dayNum: 29, shift: "General (09:00 - 18:00)", checkIn: "—", checkOut: "—", lateBy: "—", workHours: 0, status: "Upcoming" },
  { date: "2026-09-30", weekday: "Wed", dayNum: 30, shift: "General (09:00 - 18:00)", checkIn: "—", checkOut: "—", lateBy: "—", workHours: 0, status: "Upcoming" },
];

export default function MyAttendancePage() {
  const [records, setRecords] = useState<MyAttendanceRecord[]>(initialRecords);
  const [viewMode, setViewMode] = useState<"table" | "calendar">("table");
  const [statusFilter, setStatusFilter] = useState("all");
  const [mounted, setMounted] = useState(false);

  // Live clock & punch state
  const [punchState, setPunchState] = useState<"in" | "out" | "break">("in");
  const [checkOutTime, setCheckOutTime] = useState<string | null>(null);
  const [breakActive, setBreakActive] = useState(false);
  const [liveClock, setLiveClock] = useState("09:24:18 AM");

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => {
      const now = new Date();
      setLiveClock(now.toLocaleTimeString("en-US", { hour12: true }));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handlePunchOut = () => {
    const timeStr = mounted ? new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) : "06:05 PM";
    setPunchState("out");
    setCheckOutTime(timeStr);
    setRecords((prev) =>
      prev.map((r) =>
        r.date === "2026-09-21"
          ? { ...r, checkOut: timeStr, workHours: 9.1 }
          : r
      )
    );
    toast.success(`Checked out successfully at ${timeStr}. Have a great evening!`);
  };

  const handleToggleBreak = () => {
    if (!breakActive) {
      setBreakActive(true);
      setPunchState("break");
      toast.info("Break started at " + liveClock + ". Take your time!");
    } else {
      setBreakActive(false);
      setPunchState("in");
      toast.success("Resumed shift work at " + liveClock + ".");
    }
  };

  const handlePunchIn = () => {
    const timeStr = mounted ? new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) : "08:58 AM";
    setPunchState("in");
    setCheckOutTime(null);
    toast.success(`Clocked in at ${timeStr}. Have a productive day!`);
  };

  // Filtered rows for DataTable
  const filteredRows = useMemo(() => {
    // Show completed or active days (exclude upcoming from table)
    const active = records.filter((r) => r.status !== "Upcoming");
    if (statusFilter === "all") return active;
    if (statusFilter === "late") return active.filter((r) => r.status === "Late" || parseInt(r.lateBy) > 0);
    return active.filter((r) => r.status === statusFilter);
  }, [records, statusFilter]);

  const columns: Column<MyAttendanceRecord>[] = [
    {
      key: "date",
      header: "Date",
      sortable: true,
      cell: (r) => (
        <div className="flex items-center gap-2">
          <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 font-mono text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
            {r.dayNum}
          </div>
          <div className="space-y-0.5">
            <p className="text-[13px] font-semibold text-slate-800 dark:text-slate-100">
              {r.weekday}, {r.date}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">{r.shift}</p>
          </div>
        </div>
      ),
    },
    {
      key: "checkIn",
      header: "Check In",
      sortable: true,
      cell: (r) => (
        <div className="flex items-center gap-1.5 tabular-nums text-[13px]">
          {r.checkIn !== "—" && (
            <span
              className={`size-1.5 rounded-full ${
                r.status === "Late" ? "bg-amber-500" : "bg-emerald-500"
              }`}
            />
          )}
          <span
            className={
              r.checkIn === "—"
                ? "text-slate-400 dark:text-slate-600"
                : "font-medium text-slate-700 dark:text-slate-200"
            }
          >
            {r.checkIn}
          </span>
        </div>
      ),
    },
    {
      key: "checkOut",
      header: "Check Out",
      sortable: true,
      cell: (r) => (
        <span
          className={`tabular-nums text-[13px] ${
            r.checkOut === "—"
              ? "text-slate-400 dark:text-slate-600"
              : "font-medium text-slate-700 dark:text-slate-200"
          }`}
        >
          {r.checkOut}
        </span>
      ),
    },
    {
      key: "workHours",
      header: "Work Hours",
      sortable: true,
      cell: (r) => (
        <div className="flex items-center gap-2">
          <span
            className={`tabular-nums text-[13px] font-semibold ${
              r.workHours >= 8
                ? "text-emerald-600 dark:text-emerald-400"
                : r.workHours > 0
                ? "text-slate-700 dark:text-slate-200"
                : "text-slate-400 dark:text-slate-600"
            }`}
          >
            {r.workHours > 0 ? `${r.workHours}h` : "—"}
          </span>
        </div>
      ),
    },
    {
      key: "lateBy",
      header: "Late By",
      sortable: true,
      cell: (r) => (
        <span
          className={`tabular-nums text-[13px] ${
            r.lateBy === "0m" || r.lateBy === "—"
              ? "text-slate-400 dark:text-slate-600"
              : "font-semibold text-amber-600 dark:text-amber-400"
          }`}
        >
          {r.lateBy}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      cell: (r) => <StatusBadge status={r.status} />,
    },
    {
      key: "action",
      header: "",
      align: "right",
      cell: (r) =>
        r.status === "Late" || r.status === "Half Day" ? (
          <Button
            size="sm"
            variant="ghost"
            className="h-8 gap-1 rounded-lg text-xs font-semibold text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:text-blue-400 dark:hover:bg-blue-950/50"
            render={<Link href="/attendance/attendance-requests/new" />}
          >
            Regularize
            <ArrowUpRight className="size-3" />
          </Button>
        ) : (
          <span className="text-xs text-slate-400 dark:text-slate-600">Standard</span>
        ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="My Attendance"
        description={`Personal attendance records, live web punch, and shift compliance for ${currentUser.name} (${currentUser.employeeId}).`}
        icon={CalendarCheck}
        showExport
        exportWhat="my attendance"
      >
        <Button
          variant="outline"
          render={<Link href="/attendance/attendance-requests/new" />}
          className="h-10 gap-2 rounded-xl border border-slate-200/50 bg-white px-3.5 font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900/90 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          <FileText className="size-4 text-slate-500 dark:text-slate-400" />
          <span>Regularize</span>
        </Button>
        <Button
          render={<Link href="/leave/apply" />}
          className="h-10 gap-2 rounded-xl bg-blue-600 px-4 font-semibold text-white hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500"
        >
          <Plus className="size-4" />
          <span>Apply Leave</span>
        </Button>
      </PageHeader>

      {/* Row 1: Interactive Hero Live Clock & Punch Card + Shift Info */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        {/* Left: Interactive Web Punch Clock */}
        <Card className="rounded-2xl border border-slate-200/50 bg-white dark:border-slate-800/40 dark:bg-[#121826] lg:col-span-7">
          <CardHeader className="pb-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="flex size-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/80 dark:text-blue-400">
                  <Timer className="size-4.5 stroke-[2.2]" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold text-slate-900 dark:text-slate-50">
                    Live Web Punch
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Monday, 21 September 2026
                  </CardDescription>
                </div>
              </div>

              {/* Live shift status pill */}
              <div
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                  punchState === "in"
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200/80 dark:bg-emerald-950/60 dark:border-emerald-800/50 dark:text-emerald-300"
                    : punchState === "break"
                    ? "bg-amber-50 text-amber-700 border border-amber-200/80 dark:bg-amber-950/60 dark:border-amber-800/50 dark:text-amber-300"
                    : "bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300"
                }`}
              >
                <span
                  className={`size-2 rounded-full ${
                    punchState === "in"
                      ? "bg-emerald-500 animate-pulse"
                      : punchState === "break"
                      ? "bg-amber-500 animate-pulse"
                      : "bg-slate-400"
                  }`}
                />
                {punchState === "in"
                  ? "Shift Active · On Clock"
                  : punchState === "break"
                  ? "On Break"
                  : "Clocked Out"}
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-5">
            {/* Real-time Clock & Punch Times */}
            <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4 dark:border-slate-800/40 dark:bg-[#161e2e]/70">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Current Time (UTC+6)
                  </p>
                  <p className="font-mono text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
                    {mounted ? liveClock : "09:24:18 AM"}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:gap-6">
                  <div className="rounded-lg bg-white p-2.5 shadow-2xs dark:bg-slate-900/80">
                    <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500">Punch In</p>
                    <p className="tabular-nums text-sm font-bold text-slate-800 dark:text-slate-100">
                      08:58 AM
                    </p>
                  </div>
                  <div className="rounded-lg bg-white p-2.5 shadow-2xs dark:bg-slate-900/80">
                    <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500">Punch Out</p>
                    <p className="tabular-nums text-sm font-bold text-slate-800 dark:text-slate-100">
                      {checkOutTime ?? "—:—"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-4 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-600 dark:text-slate-300">
                    Daily Progress (8h standard)
                  </span>
                  <span className="tabular-nums font-semibold text-blue-600 dark:text-blue-400">
                    {punchState === "out" ? "100% · 9h 00m" : "90% · 7h 12m"}
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                  <div
                    className="h-full rounded-full bg-linear-to-r from-blue-600 to-emerald-500 transition-all duration-500"
                    style={{ width: punchState === "out" ? "100%" : "90%" }}
                  />
                </div>
              </div>
            </div>

            {/* Interactive Action Buttons */}
            <div className="flex flex-wrap items-center gap-3">
              <Button
                onClick={handlePunchIn}
                disabled={punchState === "in"}
                className="h-10 flex-1 gap-2 rounded-xl bg-blue-600 font-semibold text-white hover:bg-blue-700 disabled:opacity-50 dark:bg-blue-600 dark:hover:bg-blue-500"
              >
                <LogIn className="size-4" />
                <span>{punchState === "in" ? "Clocked In (08:58)" : "Clock In"}</span>
              </Button>

              <Button
                variant="outline"
                onClick={handleToggleBreak}
                disabled={punchState === "out"}
                className="h-10 gap-2 rounded-xl border border-slate-200/50 bg-white px-4 font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900/90 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <Coffee className="size-4 text-amber-500" />
                <span>{breakActive ? "Resume Work" : "Take Break"}</span>
              </Button>

              <Button
                variant="outline"
                onClick={handlePunchOut}
                disabled={punchState === "out"}
                className="h-10 gap-2 rounded-xl border border-rose-200 bg-rose-50/40 px-4 font-semibold text-rose-600 hover:bg-rose-50 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-400 dark:hover:bg-rose-900/40"
              >
                <LogOut className="size-4" />
                <span>{punchState === "out" ? "Checked Out" : "Check Out"}</span>
              </Button>
            </div>

            {/* Geo and IP Telemetry */}
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <MapPin className="size-3.5 text-blue-500 shrink-0" />
              <span>Office HQ · Dhaka Tower (Geo-verified IP: 103.28.45.12)</span>
              <span className="hidden sm:inline">·</span>
              <span className="hidden sm:inline font-mono">Biometric ID: {currentUser.attendanceDeviceId ?? "BIO-0005"}</span>
            </div>
          </CardContent>
        </Card>

        {/* Right: Shift Information & Today's Milestones */}
        <Card className="rounded-2xl border border-slate-200/50 bg-white dark:border-slate-800/40 dark:bg-[#121826] lg:col-span-5">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-bold text-slate-900 dark:text-slate-50">
                General Office Shift Policy
              </CardTitle>
              <Badge variant="secondary" className="rounded-full font-semibold">
                09:00 AM – 06:00 PM
              </Badge>
            </div>
            <CardDescription className="text-xs">
              Standard organization-wide office working schedule
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Shift specs list */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3 dark:border-slate-800/40 dark:bg-slate-900/40">
                <p className="text-slate-500 dark:text-slate-400">Grace Period</p>
                <p className="font-semibold text-slate-800 dark:text-slate-200">15 mins (up to 09:15)</p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3 dark:border-slate-800/40 dark:bg-slate-900/40">
                <p className="text-slate-500 dark:text-slate-400">Lunch Break</p>
                <p className="font-semibold text-slate-800 dark:text-slate-200">01:00 PM – 02:00 PM</p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3 dark:border-slate-800/40 dark:bg-slate-900/40">
                <p className="text-slate-500 dark:text-slate-400">Half-Day Threshold</p>
                <p className="font-semibold text-slate-800 dark:text-slate-200">Minimum 4h required</p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3 dark:border-slate-800/40 dark:bg-slate-900/40">
                <p className="text-slate-500 dark:text-slate-400">Weekly Offs</p>
                <p className="font-semibold text-slate-800 dark:text-slate-200">Friday & Saturday</p>
              </div>
            </div>

            {/* Today's timeline steps */}
            <div className="space-y-2 pt-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Today's Punch Log
              </p>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between rounded-lg border border-slate-100 bg-white px-3 py-2 dark:border-slate-800 dark:bg-[#161e2e]">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="size-3.5 text-emerald-500" />
                    <span className="font-medium text-slate-700 dark:text-slate-200">First Punch In</span>
                  </div>
                  <span className="font-mono font-semibold text-slate-900 dark:text-slate-100">08:58 AM</span>
                </div>

                <div className="flex items-center justify-between rounded-lg border border-slate-100 bg-white px-3 py-2 dark:border-slate-800 dark:bg-[#161e2e]">
                  <div className="flex items-center gap-2">
                    <Coffee className="size-3.5 text-amber-500" />
                    <span className="font-medium text-slate-700 dark:text-slate-200">Lunch Break</span>
                  </div>
                  <span className="font-mono font-semibold text-slate-500 dark:text-slate-400">01:05 PM – 01:51 PM (46m)</span>
                </div>

                <div className="flex items-center justify-between rounded-lg border border-slate-100 bg-white px-3 py-2 dark:border-slate-800 dark:bg-[#161e2e]">
                  <div className="flex items-center gap-2">
                    <Clock className="size-3.5 text-blue-500" />
                    <span className="font-medium text-slate-700 dark:text-slate-200">Scheduled Punch Out</span>
                  </div>
                  <span className="font-mono font-semibold text-slate-500 dark:text-slate-400">06:00 PM</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 2: 4 KPI Stat Cards Matching Reference Mockup on /attendance */}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Days Present"
          value={18}
          icon={CalendarCheck}
          color="emerald"
          hint="94.7% monthly rate"
          trend="up"
          trendColor="emerald"
          sparkPath="M 2 18 C 18 18, 26 21, 38 16 C 50 11, 58 5, 66 8 C 72 11, 76 16, 82 13"
        />
        <StatCard
          label="Hours Logged"
          value="162.5h"
          icon={Clock}
          color="blue"
          hint="Avg 8.8h / day (+4.2h OT)"
          trend="up"
          trendColor="emerald"
          sparkPath="M 2 20 C 18 20, 28 14, 42 16 C 56 18, 66 8, 82 12"
        />
        <StatCard
          label="On-Time Arrival"
          value="91.5%"
          icon={CheckCircle2}
          color="amber"
          hint="2 late arrivals (<15m)"
          trend="up"
          trendColor="neutral"
          sparkPath="M 2 20 C 12 20, 20 12, 30 11 C 40 10, 48 20, 58 14 C 66 9, 72 7, 82 10"
        />
        <StatCard
          label="Leaves & Offs"
          value="4 Days"
          icon={Coffee}
          color="purple"
          hint="1 Casual Leave · 3 Offs"
          trend="flat"
          trendColor="neutral"
          sparkPath="M 2 19 C 14 19, 22 13, 32 14 C 42 15, 48 20, 58 12 C 66 6, 74 8, 82 13"
        />
      </div>

      {/* Row 3: Monthly Visual Heatmap / Calendar Tracker */}
      <Card className="rounded-2xl border border-slate-200/50 bg-white dark:border-slate-800/40 dark:bg-[#121826]">
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <CalendarDays className="size-4.5 text-blue-600 dark:text-blue-400" />
                <CardTitle className="text-base font-bold text-slate-900 dark:text-slate-50">
                  September 2026 Attendance Heatmap
                </CardTitle>
              </div>
              <CardDescription className="text-xs">
                Visual matrix of your attendance status, on-time arrivals, and working hours.
              </CardDescription>
            </div>

            {/* Legend pills */}
            <div className="flex flex-wrap items-center gap-2 text-[11px] font-medium">
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                <span className="size-1.5 rounded-full bg-emerald-500" /> Present (18)
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
                <span className="size-1.5 rounded-full bg-amber-500" /> Late (2)
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2.5 py-0.5 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300">
                <span className="size-1.5 rounded-full bg-purple-500" /> Leave (1)
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                <span className="size-1.5 rounded-full bg-slate-400" /> Weekly Off (6)
              </span>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-10">
            {records.map((r) => {
              const isPresent = r.status === "Present";
              const isLate = r.status === "Late";
              const isLeave = r.status === "Leave";
              const isHalfDay = r.status === "Half Day";
              const isWeekOff = r.status === "Week Off";
              const isUpcoming = r.status === "Upcoming";
              const isToday = r.date === "2026-09-21";

              return (
                <div
                  key={r.date}
                  className={`group relative flex flex-col justify-between rounded-xl border p-2.5 transition-all hover:scale-[1.02] ${
                    isToday
                      ? "ring-2 ring-blue-500 border-blue-400 bg-blue-50/30 dark:bg-blue-950/30"
                      : isPresent
                      ? "border-emerald-200/80 bg-emerald-50/40 dark:border-emerald-900/50 dark:bg-emerald-950/20"
                      : isLate
                      ? "border-amber-200/90 bg-amber-50/50 dark:border-amber-900/50 dark:bg-amber-950/25"
                      : isLeave
                      ? "border-purple-200/80 bg-purple-50/40 dark:border-purple-900/50 dark:bg-purple-950/20"
                      : isHalfDay
                      ? "border-amber-200/80 bg-amber-50/30 dark:border-amber-900/40 dark:bg-amber-950/20"
                      : isWeekOff
                      ? "border-slate-100 bg-slate-50/60 dark:border-slate-800/40 dark:bg-slate-900/40"
                      : "border-dashed border-slate-200 bg-transparent opacity-60 dark:border-slate-800"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
                      {r.dayNum}
                    </span>
                    <span className="text-[10px] uppercase tracking-wider text-slate-400">
                      {r.weekday}
                    </span>
                  </div>

                  <div className="my-1.5 min-h-[30px]">
                    {isPresent && (
                      <div className="space-y-0.5">
                        <p className="font-mono text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                          {r.workHours}h
                        </p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">
                          {r.checkIn.replace(" AM", "")}
                        </p>
                      </div>
                    )}
                    {isLate && (
                      <div className="space-y-0.5">
                        <p className="font-mono text-[11px] font-semibold text-amber-700 dark:text-amber-400">
                          +{r.lateBy}
                        </p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">
                          {r.checkIn.replace(" AM", "")}
                        </p>
                      </div>
                    )}
                    {isLeave && (
                      <p className="text-[11px] font-semibold text-purple-700 dark:text-purple-400">
                        Leave
                      </p>
                    )}
                    {isHalfDay && (
                      <p className="text-[11px] font-semibold text-amber-700 dark:text-amber-400">
                        Half Day
                      </p>
                    )}
                    {isWeekOff && (
                      <p className="text-[10px] text-slate-400 dark:text-slate-500">
                        Off Day
                      </p>
                    )}
                    {isUpcoming && (
                      <p className="text-[10px] text-slate-400 dark:text-slate-600">
                        Scheduled
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <span
                      className={`size-1.5 rounded-full ${
                        isPresent
                          ? "bg-emerald-500"
                          : isLate
                          ? "bg-amber-500"
                          : isLeave
                          ? "bg-purple-500"
                          : isHalfDay
                          ? "bg-amber-500"
                          : isWeekOff
                          ? "bg-slate-300 dark:bg-slate-600"
                          : "bg-transparent"
                      }`}
                    />
                    {isToday && (
                      <span className="text-[9px] font-extrabold uppercase text-blue-600 dark:text-blue-400">
                        Today
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Row 4: Attendance Register DataTable */}
      <div className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Attendance Register History
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Detailed breakdown of your biometric punches and daily hours.
            </p>
          </div>
        </div>

        <DataTable
          columns={columns}
          rows={filteredRows}
          searchKeys={["date", "weekday", "status", "shift"]}
          searchPlaceholder="Search by date, weekday or status..."
          pageSize={10}
          defaultSortKey="date"
          defaultSortDir="desc"
          filters={
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? "all")}>
              <SelectTrigger className="h-10 w-full rounded-xl border border-slate-200/50 bg-white font-medium text-slate-700 dark:border-slate-800 dark:bg-slate-900/90 dark:text-slate-200 sm:w-44">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent className="rounded-xl dark:border-slate-800 dark:bg-[#121826]">
                <SelectItem value="all">All Records</SelectItem>
                <SelectItem value="Present">Present</SelectItem>
                <SelectItem value="late">Late Arrivals</SelectItem>
                <SelectItem value="Half Day">Half Day</SelectItem>
                <SelectItem value="Leave">Leave</SelectItem>
                <SelectItem value="Week Off">Weekly Off</SelectItem>
              </SelectContent>
            </Select>
          }
        />
      </div>

      {/* Row 5: Helpful Policy & Regularization Info Cards */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <Card className="rounded-2xl border border-slate-200/50 bg-white dark:border-slate-800/40 dark:bg-[#121826]">
          <CardContent className="flex items-start gap-4 p-5">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/80 dark:text-blue-400">
              <FileText className="size-5" />
            </div>
            <div className="min-w-0 flex-1 space-y-1">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Missed a punch or biometric device failure?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                You can submit an Attendance Regularization Request within 3 business days of the incident for manager approval.
              </p>
              <div className="pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  render={<Link href="/attendance/attendance-requests/new" />}
                  className="h-8 gap-1.5 rounded-lg border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  Request Regularization
                  <ChevronRight className="size-3.5" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-slate-200/50 bg-white dark:border-slate-800/40 dark:bg-[#121826]">
          <CardContent className="flex items-start gap-4 p-5">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/80 dark:text-purple-400">
              <CalendarCheck className="size-5" />
            </div>
            <div className="min-w-0 flex-1 space-y-1">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Need to plan time off or medical leave?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                View your remaining annual, casual, and sick leave balances or apply for upcoming planned leaves.
              </p>
              <div className="pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  render={<Link href="/leave" />}
                  className="h-8 gap-1.5 rounded-lg border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  View Leave Balances
                  <ChevronRight className="size-3.5" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
