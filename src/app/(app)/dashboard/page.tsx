"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Users,
  CalendarCheck,
  UserX,
  CalendarDays,
  Clock,
  Activity,
  Zap,
  Calendar,
  Building2,
  ChevronRight,
  ArrowRight,
  Plus,
  Code,
  TrendingUp,
  Sparkles,
  Palette,
  Coins,
  Megaphone,
  UserCheck,
  PieChart,
} from "lucide-react";

const attendanceTrendData = [
  { day: "Sep 15", present: 198, absent: 18 },
  { day: "Sep 16", present: 204, absent: 15 },
  { day: "Sep 17", present: 195, absent: 24 },
  { day: "Sep 18", present: 208, absent: 20 },
  { day: "Sep 19", present: 212, absent: 16 },
  { day: "Sep 20", present: 215, absent: 12 },
  { day: "Sep 21", present: 218, absent: 14 },
];

const actionItems = [
  {
    count: 12,
    color: "bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400",
    title: "Leave requests pending",
    desc: "Review and approve",
    href: "/leave/approvals",
  },
  {
    count: 6,
    color: "bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400",
    title: "Expense claims pending",
    desc: "Finance team needs approval",
    href: "/expenses/approvals",
  },
  {
    count: 4,
    color: "bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400",
    title: "Attendance corrections",
    desc: "Verify and update",
    href: "/attendance/attendance-requests",
  },
  {
    count: 5,
    color: "bg-sky-50 text-sky-600 dark:bg-sky-950/60 dark:text-sky-400",
    title: "Job applicants to review",
    desc: "Shortlist candidate pipeline",
    href: "/recruitment/pipeline",
  },
  {
    count: 3,
    color: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400",
    title: "Shift assignments pending",
    desc: "Roster scheduling check",
    href: "/attendance/shift-assignment-tool",
  },
];

const upcomingLeaves = [
  {
    initials: "AK",
    name: "Aisha Khan",
    type: "Casual Leave",
    dates: "Sep 24, 2026 – Sep 29, 2026",
    status: "Pending",
  },
  {
    initials: "DT",
    name: "Diego Torres",
    type: "Sick Leave",
    dates: "Sep 21, 2026 – Sep 22, 2026",
    status: "Pending",
  },
  {
    initials: "NP",
    name: "Nina Patel",
    type: "Earned Leave",
    dates: "Oct 05, 2026 – Oct 12, 2026",
    status: "Pending",
  },
  {
    initials: "RH",
    name: "Rafid Hasan",
    type: "Casual Leave",
    dates: "Sep 22, 2026 – Sep 23, 2026",
    status: "Approved",
  },
];

const departmentStats = [
  {
    name: "Engineering",
    icon: Code,
    iconColor: "text-sky-600 bg-sky-50 dark:bg-sky-950/60 dark:text-sky-400",
    total: 62,
    present: 56,
    absent: 4,
    leave: 2,
    late: 2,
    vacancy: "4.6%",
    bar: "bg-sky-500",
    vacancyColor: "bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-400",
  },
  {
    name: "Sales",
    icon: TrendingUp,
    iconColor: "text-amber-600 bg-amber-50 dark:bg-amber-950/60 dark:text-amber-400",
    total: 48,
    present: 42,
    absent: 3,
    leave: 2,
    late: 1,
    vacancy: "10.4%",
    bar: "bg-rose-500",
    vacancyColor: "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400",
  },
  {
    name: "Product",
    icon: Sparkles,
    iconColor: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-400",
    total: 35,
    present: 31,
    absent: 2,
    leave: 1,
    late: 1,
    vacancy: "8.6%",
    bar: "bg-amber-500",
    vacancyColor: "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400",
  },
  {
    name: "Design",
    icon: Palette,
    iconColor: "text-purple-600 bg-purple-50 dark:bg-purple-950/60 dark:text-purple-400",
    total: 28,
    present: 25,
    absent: 1,
    leave: 1,
    late: 1,
    vacancy: "7.1%",
    bar: "bg-emerald-500",
    vacancyColor: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400",
  },
  {
    name: "Finance",
    icon: Coins,
    iconColor: "text-amber-600 bg-amber-50 dark:bg-amber-950/60 dark:text-amber-400",
    total: 22,
    present: 19,
    absent: 2,
    leave: 1,
    late: 0,
    vacancy: "4.5%",
    bar: "bg-emerald-500",
    vacancyColor: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400",
  },
  {
    name: "Marketing",
    icon: Megaphone,
    iconColor: "text-rose-600 bg-rose-50 dark:bg-rose-950/60 dark:text-rose-400",
    total: 18,
    present: 16,
    absent: 1,
    leave: 1,
    late: 0,
    vacancy: "10.0%",
    bar: "bg-purple-500",
    vacancyColor: "bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-400",
  },
];

const recentActivities = [
  {
    name: "Aisha Khan",
    initials: "AK",
    time: "2 hours ago",
    detail: "Casual Leave",
    badge: "Leave",
    badgeColor: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400",
  },
  {
    name: "Diego Torres",
    initials: "DT",
    time: "3 hours ago",
    detail: "Expense claim",
    badge: "Expense",
    badgeColor: "bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-400",
  },
  {
    name: "Nina Patel",
    initials: "NP",
    time: "4 hours ago",
    detail: "On time",
    badge: "Attendance",
    badgeColor: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400",
  },
  {
    name: "Rafid Hasan",
    initials: "RH",
    time: "1 day ago",
    detail: "Resigned from the company",
    badge: "Resignation",
    badgeColor: "bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-400",
  },
  {
    name: "New Joiner",
    initials: "NJ",
    time: "6 hours ago",
    detail: "Software Engineer",
    badge: "Onboarding",
    badgeColor: "bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-400",
  },
];

const leaveBalancesList = [
  { label: "Casual Leave", used: 4, entitled: 12, pct: 33, color: "text-sky-500" },
  { label: "Sick Leave", used: 2, entitled: 8, pct: 25, color: "text-emerald-500" },
  { label: "Earned Leave", used: 6, entitled: 15, pct: 40, color: "text-amber-500" },
  { label: "Privilege Leave", used: 1, entitled: 10, pct: 10, color: "text-purple-500" },
  { label: "Unpaid Leave", used: 0, entitled: 30, pct: 0, color: "text-slate-400" },
];

function CircularMeter({
  pct,
  used,
  entitled,
  label,
  color,
}: {
  pct: number;
  used: number;
  entitled: number;
  label: string;
  color: string;
}) {
  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (pct / 100) * circumference;

  return (
    <div className="flex flex-col items-center text-center">
      <div className="relative flex size-16 items-center justify-center">
        <svg className="size-full -rotate-90" viewBox="0 0 60 60">
          <circle
            cx="30"
            cy="30"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="4.5"
            className="text-muted/30"
          />
          <circle
            cx="30"
            cy="30"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="4.5"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className={color}
          />
        </svg>
        <span className="absolute text-xs font-bold text-foreground">
          {pct}%
        </span>
      </div>
      <p className="mt-1 text-[10px] font-semibold leading-tight text-foreground">{label}</p>
      <p className="text-[11px] text-muted-foreground">{used}/{entitled} used</p>
    </div>
  );
}

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="dash space-y-6">
      <PageHeader
        title="Dashboard"
        description="People-operations overview for your organization."
        showExport
        exportWhat="metrics"
      >
        <Button
          render={<Link href="/leave/apply" />}
          className="h-10 rounded-xl bg-blue-600 px-4 font-semibold text-white shadow-sm hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500"
        >
          <Plus className="size-4" /> Request Leave
        </Button>
      </PageHeader>

      {/* Row 1: 5 KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard
          label="Total Employees"
          value="247"
          icon={Users}
          hint="+4%"
          trend="up"
          trendColor="emerald"
          color="blue"
          sparkPath="M 2 20 C 18 20, 28 14, 42 16 C 56 18, 66 8, 82 12"
        />
        <StatCard
          label="Present Today"
          value="218"
          subtext="88.3% of total"
          icon={CalendarCheck}
          hint="+6%"
          trend="up"
          trendColor="emerald"
          color="emerald"
          sparkPath="M 2 21 C 16 21, 26 14, 38 12 C 50 10, 62 4, 82 2"
        />
        <StatCard
          label="Absent Today"
          value="14"
          subtext="5.7% of total"
          icon={UserX}
          hint="-3%"
          trend="down"
          trendColor="rose"
          color="rose"
          sparkPath="M 2 20 C 18 20, 32 21, 46 16 C 58 12, 68 12, 82 5"
        />
        <StatCard
          label="On Leave Today"
          value="9"
          subtext="3.6% of total"
          icon={CalendarDays}
          hint="+2%"
          trend="up"
          trendColor="amber"
          color="amber"
          sparkPath="M 2 20 C 12 20, 20 12, 30 11 C 40 10, 48 20, 58 14 C 66 9, 72 7, 82 10"
        />
        <StatCard
          label="Late Today"
          value="6"
          subtext="2.4% of total"
          icon={Clock}
          hint="-1%"
          trend="down"
          trendColor="neutral"
          color="purple"
          sparkPath="M 2 19 C 14 19, 22 13, 32 14 C 42 15, 48 20, 58 12 C 66 6, 74 8, 82 13"
        />
      </div>

      {/* Row 2: Attendance Trend, Action Center, Upcoming Leave */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        {/* Attendance Trend */}
        <Card className="lg:col-span-5 rounded-2xl border border-slate-200/80 bg-white shadow-xs dark:border-slate-800/80 dark:bg-[#121826] dark:shadow-[0_16px_40px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.06)]">
          <CardContent className="flex h-full flex-col justify-between p-5">
            <div className="flex items-center justify-between gap-2 pb-3">
              <div className="flex items-center gap-2">
                <div className="flex size-8 items-center justify-center chip bg-sky-50 text-sky-600 dark:bg-sky-950/60 dark:text-sky-400">
                  <Activity className="size-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Attendance Trend</h3>
                  <p className="text-xs text-muted-foreground">Present vs Absent (Last 7 Days)</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1.5 font-medium text-foreground">
                  <span className="size-2 bg-emerald-500" /> Present
                </span>
                <span className="flex items-center gap-1.5 font-medium text-foreground">
                  <span className="size-2 bg-rose-500" /> Absent
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 items-center gap-4 sm:grid-cols-4">
              <div className="h-[190px] sm:col-span-3">
                {mounted ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={attendanceTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.6} vertical={false} />
                      <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#64748b" }} />
                      <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#64748b" }} domain={[0, 250]} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#121826",
                          borderColor: "#1e293b",
                          borderRadius: "12px",
                          color: "#f8fafc",
                          fontSize: 12,
                          boxShadow: "0 10px 25px -5px rgba(0,0,0,0.5)",
                        }}
                      />
                      <Line type="monotone" dataKey="present" stroke="#10b981" strokeWidth={2.5} dot={{ r: 3, fill: "#10b981" }} />
                      <Line type="monotone" dataKey="absent" stroke="#ef4444" strokeWidth={2.5} dot={{ r: 3, fill: "#ef4444" }} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="size-full rounded-xl bg-muted/20" />
                )}
              </div>

              {/* Callout Box on Right */}
              <div className="flex flex-col justify-center rounded-xl border border-sky-100/80 bg-sky-50/60 p-3.5 dark:border-sky-900/30 dark:bg-sky-950/25 sm:col-span-1">
                <div className="mb-2 flex size-7 items-center justify-center rounded-lg border border-sky-200/70 bg-white text-sky-600 shadow-xs dark:border-sky-800 dark:bg-slate-900 dark:text-sky-400">
                  <TrendingUp className="size-3.5" />
                </div>
                <p className="text-xl font-bold tracking-tight text-foreground">88.3%</p>
                <p className="text-[11px] text-muted-foreground">Avg. attendance rate</p>
                <div className="pt-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  <span>+2.5%</span>
                  <p className="text-[10px] font-normal text-muted-foreground">vs. last week</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Center */}
        <Card className="lg:col-span-4 rounded-2xl border border-slate-200/80 bg-white shadow-xs dark:border-slate-800/80 dark:bg-[#121826] dark:shadow-[0_16px_40px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.06)]">
          <CardContent className="flex h-full flex-col justify-between p-5">
            <div className="flex items-center justify-between gap-2 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex size-9 items-center justify-center rounded-xl border border-amber-200/60 bg-amber-50 text-amber-600 shadow-xs dark:border-amber-500/30 dark:bg-amber-950/50 dark:text-amber-400">
                  <Zap className="size-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Action Center</h3>
                  <p className="text-xs text-muted-foreground">Things need your attention</p>
                </div>
              </div>
              <Link href="/leave/approvals" className="text-xs font-semibold text-primary hover:underline">
                View all →
              </Link>
            </div>

            <div className="space-y-1.5">
              {actionItems.map((item) => (
                <Link
                  key={item.title}
                  href={item.href}
                  className="flex items-center justify-between rounded-xl p-2.5 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
                >
                  <div className="flex items-center gap-3">
                    <span className={`flex size-7 items-center justify-center rounded-lg border border-transparent text-xs font-bold ${item.color}`}>
                      {item.count}
                    </span>
                    <div>
                      <p className="text-xs font-semibold text-foreground">{item.title}</p>
                      <p className="text-[11px] text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                  <ChevronRight className="size-4 text-muted-foreground" />
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Leave Schedule */}
        <Card className="lg:col-span-3 rounded-2xl border border-slate-200/80 bg-white shadow-xs dark:border-slate-800/80 dark:bg-[#121826] dark:shadow-[0_16px_40px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.06)]">
          <CardContent className="flex h-full flex-col justify-between p-5">
            <div className="flex items-center justify-between gap-2 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex size-9 items-center justify-center rounded-xl border border-sky-200/60 bg-sky-50 text-sky-600 shadow-xs dark:border-sky-500/30 dark:bg-sky-950/50 dark:text-sky-400">
                  <Calendar className="size-4" />
                </div>
                <h3 className="text-sm font-semibold text-foreground">Upcoming Leaves</h3>
              </div>
              <Link href="/leave/approvals" className="text-xs font-semibold text-primary hover:underline">
                View all →
              </Link>
            </div>

            <div className="space-y-2.5">
              {upcomingLeaves.map((l) => (
                <div key={l.name} className="flex items-center justify-between gap-2 rounded-xl p-1.5 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Avatar className="size-8">
                      <AvatarFallback className="text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                        {l.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold text-foreground">{l.name}</p>
                      <p className="truncate text-[11px] text-muted-foreground">{l.type}</p>
                      <p className="truncate text-[10px] text-muted-foreground">{l.dates}</p>
                    </div>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold shrink-0 ${
                      l.status === "Approved"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-500/30"
                        : "bg-amber-50 text-amber-700 border border-amber-200/60 dark:bg-amber-950/60 dark:text-amber-400 dark:border-amber-500/30"
                    }`}
                  >
                    {l.status}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 3: Department Overview, Recent Activity, Leave Balance Overview */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        {/* Department Overview */}
        <Card className="lg:col-span-5 rounded-2xl border border-slate-200/80 bg-white shadow-xs dark:border-slate-800/80 dark:bg-[#121826] dark:shadow-[0_16px_40px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.06)]">
          <CardContent className="p-5">
            <div className="flex items-center justify-between gap-2 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex size-9 items-center justify-center rounded-xl border border-sky-200/60 bg-sky-50 text-sky-600 shadow-xs dark:border-sky-500/30 dark:bg-sky-950/50 dark:text-sky-400">
                  <Building2 className="size-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Department Overview</h3>
                  <p className="text-xs text-muted-foreground">Current headcount and vacancy status</p>
                </div>
              </div>
              <Link href="/departments" className="text-xs font-semibold text-primary hover:underline">
                View all →
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-500 dark:border-slate-800/60 dark:text-slate-400">
                    <th className="pb-2.5 font-medium">Department</th>
                    <th className="pb-2.5 text-center font-medium">Total Employees</th>
                    <th className="pb-2.5 text-center font-medium">Present</th>
                    <th className="pb-2.5 text-center font-medium">Absent</th>
                    <th className="pb-2.5 text-center font-medium">On Leave</th>
                    <th className="pb-2.5 text-center font-medium">Late</th>
                    <th className="pb-2.5 text-right font-medium">Vacancy</th>
                  </tr>
                </thead>
                <tbody className="divide-y-0">
                  {departmentStats.map((d) => (
                    <tr key={d.name} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-2.5 font-medium flex items-center gap-2">
                        <div className={`flex size-6 items-center justify-center rounded-md ${d.iconColor}`}>
                          <d.icon className="size-3.5" />
                        </div>
                        <span className="text-foreground font-semibold">{d.name}</span>
                      </td>
                      <td className="py-2.5 text-center text-muted-foreground font-medium tabular-nums">{d.total}</td>
                      <td className="py-2.5 text-center text-muted-foreground tabular-nums">{d.present}</td>
                      <td className="py-2.5 text-center text-muted-foreground tabular-nums">{d.absent}</td>
                      <td className="py-2.5 text-center text-muted-foreground tabular-nums">{d.leave}</td>
                      <td className="py-2.5 text-center text-muted-foreground tabular-nums">{d.late}</td>
                      <td className="py-2.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <span className="h-1.5 w-14 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                            <span
                              className={`block h-full rounded-full ${d.bar}`}
                              style={{ width: `${Math.min(100, parseFloat(d.vacancy) * 8)}%` }}
                            />
                          </span>
                          <span className={`rounded-full px-2 py-0.5 font-semibold text-[10px] ${d.vacancyColor}`}>
                            {d.vacancy}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="lg:col-span-4 rounded-2xl border border-slate-200/80 bg-white shadow-xs dark:border-slate-800/80 dark:bg-[#121826] dark:shadow-[0_16px_40px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.06)]">
          <CardContent className="p-5">
            <div className="flex items-center justify-between gap-2 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex size-9 items-center justify-center rounded-xl border border-sky-200/60 bg-sky-50 text-sky-600 shadow-xs dark:border-sky-500/30 dark:bg-sky-950/50 dark:text-sky-400">
                  <Clock className="size-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Recent Activity</h3>
                  <p className="text-xs text-muted-foreground">Latest updates from your team</p>
                </div>
              </div>
              <Link href="/attendance" className="text-xs font-semibold text-primary hover:underline">
                View all →
              </Link>
            </div>

            <div className="space-y-2.5">
              {recentActivities.map((act, i) => (
                <div key={i} className="flex items-center justify-between gap-2 rounded-xl p-1.5 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Avatar className="size-8">
                      <AvatarFallback className="text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                        {act.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold text-foreground">{act.name}</p>
                      <p className="truncate text-[11px] text-muted-foreground">
                        {act.time} · {act.detail}
                      </p>
                    </div>
                  </div>
                  <span className={`rounded-full shrink-0 px-2.5 py-0.5 text-[10px] font-semibold border border-transparent ${act.badgeColor}`}>
                    {act.badge}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Leave Balance Overview & HR Performance Banner */}
        <div className="flex flex-col justify-between gap-4 lg:col-span-3">
          {/* Leave Balance Overview Card */}
          <Card className="flex-1 rounded-2xl border border-slate-200/80 bg-white shadow-xs dark:border-slate-800/80 dark:bg-[#121826] dark:shadow-[0_16px_40px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.06)]">
            <CardContent className="p-5">
              <div className="flex items-center justify-between gap-2 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex size-9 items-center justify-center rounded-xl border border-sky-200/60 bg-sky-50 text-sky-600 shadow-xs dark:border-sky-500/30 dark:bg-sky-950/50 dark:text-sky-400">
                    <PieChart className="size-4" />
                  </div>
                  <h3 className="text-sm font-semibold text-foreground">Leave Balances</h3>
                </div>
                <Link href="/leave/balances" className="text-xs font-semibold text-primary hover:underline">
                  View →
                </Link>
              </div>

              <div className="grid grid-cols-5 gap-1 pt-1">
                {leaveBalancesList.map((lb) => (
                  <CircularMeter
                    key={lb.label}
                    pct={lb.pct}
                    used={lb.used}
                    entitled={lb.entitled}
                    label={lb.label}
                    color={lb.color}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* HR Performance Dark Banner */}
          <Card className="relative overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900 text-white shadow-md dark:bg-[#0f172a] dark:shadow-[0_16px_40px_rgba(0,0,0,0.6)]">
            {/* Background image on the right with smooth dark gradient fade */}
            <div
              className="absolute right-0 top-0 h-full w-3/5 bg-cover bg-right"
              style={{ backgroundImage: "url('/images/hr-performance.jpg')" }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-900/40 dark:from-[#0f172a] dark:via-[#0f172a]/90 dark:to-transparent" />

            <CardContent className="relative z-10 flex items-center justify-between gap-3 p-5">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sky-400">
                  <UserCheck className="size-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">HR Performance</span>
                </div>
                <p className="text-xs text-slate-300">Build a better workplace, together.</p>
                <div className="pt-2">
                  <Button
                    size="sm"
                    className="h-8 rounded-xl bg-white px-3 text-xs font-semibold text-slate-900 shadow-sm hover:bg-slate-100"
                    render={<Link href="/reports" />}
                  >
                    View Reports <ArrowRight className="size-3.5" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
