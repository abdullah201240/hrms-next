"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable, type Column } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { employees, fmtMoney, type Employee } from "@/lib/mock/data";
import { Plus } from "lucide-react";

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
          <span className="font-medium">{e.name}</span>
          <span className="text-xs text-muted-foreground">{e.employeeId}</span>
        </div>
      </div>
    ),
  },
  { key: "department", header: "Department", sortable: true },
  { key: "designation", header: "Designation" },
  { key: "reportsTo", header: "Reports To", className: "hidden lg:table-cell" },
  {
    key: "baseSalary",
    header: "Base Salary",
    sortable: true,
    align: "right",
    cell: (e) => <span className="tabular-nums">{fmtMoney(e.baseSalary)}</span>,
  },
  { key: "status", header: "Status", cell: (e) => <StatusBadge status={e.status} /> },
  {
    key: "actions",
    header: "",
    align: "right",
    cell: (e) => (
      <Button size="sm" variant="outline" render={<Link href={`/employees/${e.id}`} />}>
        View
      </Button>
    ),
  },
];

export default function EmployeesPage() {
  return (
    <>
      <PageHeader title="Employees" description={`${employees.length} people across ${new Set(employees.map((e) => e.department)).size} departments.`}>
        <Button>
          <Plus /> New Employee
        </Button>
      </PageHeader>
      <DataTable columns={columns} rows={employees} searchKeys={["name", "email", "employeeId", "department", "designation"]} pageSize={10} />
    </>
  );
}
