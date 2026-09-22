"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable, type Column } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { StatCard } from "@/components/shared/stat-card";
import { employees, fmtMoney, type Employee } from "@/lib/mock/data";
import { Plus, Users, UserCheck, UserMinus, Building2 } from "lucide-react";

const initials = (n: string) => n.split(" ").map((s) => s[0]).slice(0, 2).join("");

const columns: Column<Employee>[] = [
  {
    key: "name",
    header: "Employee",
    sortable: true,
    cell: (e) => (
      <div className="flex items-center gap-3">
        <Avatar className="size-8">
          <AvatarFallback style={{ backgroundColor: e.avatarColor }} className="text-xs font-semibold text-white">
            {initials(e.name)}
          </AvatarFallback>
        </Avatar>
        <div className="grid leading-tight">
          <span className="font-semibold text-slate-800 dark:text-slate-100">{e.name}</span>
          <span className="text-xs text-slate-400 dark:text-slate-500 font-normal">{e.employeeId}</span>
        </div>
      </div>
    ),
  },
  { key: "department", header: "Department", sortable: true },
  { key: "designation", header: "Designation" },
  { key: "reportsTo", header: "Reports To", className: "hidden lg:table-cell text-slate-600 dark:text-slate-400" },
  {
    key: "baseSalary",
    header: "Base Salary",
    sortable: true,
    align: "right",
    cell: (e) => <span className="tabular-nums font-semibold text-slate-700 dark:text-slate-200">{fmtMoney(e.baseSalary)}</span>,
  },
  { key: "status", header: "Status", cell: (e) => <StatusBadge status={e.status} /> },
  {
    key: "actions",
    header: "",
    align: "right",
    cell: (e) => (
      <Button
        size="sm"
        variant="outline"
        className="h-8 rounded-lg border-slate-200 text-xs font-medium dark:border-slate-700 dark:hover:bg-slate-800"
        render={<Link href={`/employees/${e.id}`} />}
      >
        View
      </Button>
    ),
  },
];

export default function EmployeesPage() {
  const activeCount = employees.filter((e) => e.status === "Active").length;
  const probationCount = employees.filter((e) => e.status === "On Probation").length;
  const deptCount = new Set(employees.map((e) => e.department)).size;

  return (
    <>
      <PageHeader
        title="Employees"
        description={`${employees.length} people across ${deptCount} departments.`}
        showExport
        exportWhat="employees"
      >
        <Button
          render={<Link href="/employees/new" />}
          className="h-10 rounded-xl bg-blue-600 px-4 font-semibold text-white hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500"
        >
          <Plus className="size-4" /> New Employee
        </Button>
      </PageHeader>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Employees"
          value={employees.length}
          icon={Users}
          color="blue"
          hint="+4 this month"
          trend="up"
          trendColor="emerald"
          sparkPath="M 2 20 C 18 20, 28 14, 42 16 C 56 18, 66 8, 82 12"
        />
        <StatCard
          label="Active Staff"
          value={activeCount}
          icon={UserCheck}
          color="emerald"
          hint="92% active"
          trend="up"
          trendColor="emerald"
          sparkPath="M 2 21 C 16 21, 26 14, 38 12 C 50 10, 62 4, 82 2"
        />
        <StatCard
          label="On Probation"
          value={probationCount}
          icon={UserMinus}
          color="amber"
          hint="Review required"
          trend="up"
          trendColor="amber"
          sparkPath="M 2 20 C 12 20, 20 12, 30 11 C 40 10, 48 20, 58 14 C 66 9, 72 7, 82 10"
        />
        <StatCard
          label="Departments"
          value={deptCount}
          icon={Building2}
          color="purple"
          hint="All teams"
          trend="up"
          trendColor="neutral"
          sparkPath="M 2 19 C 14 19, 22 13, 32 14 C 42 15, 48 20, 58 12 C 66 6, 74 8, 82 13"
        />
      </div>

      <DataTable columns={columns} rows={employees} searchKeys={["name", "email", "employeeId", "department", "designation"]} pageSize={10} />
    </>
  );
}
