"use client";

import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable, type Column } from "@/components/shared/data-table";
import { departments, type Department } from "@/lib/mock/data";
import { Plus } from "lucide-react";

const columns: Column<Department>[] = [
  { key: "name", header: "Department", sortable: true },
  { key: "head", header: "Head of Department", sortable: true },
  {
    key: "employeeCount",
    header: "Employees",
    sortable: true,
    align: "right",
    cell: (d) => <span className="tabular-nums">{d.employeeCount}</span>,
  },
  {
    key: "actions",
    header: "",
    align: "right",
    cell: () => <Button size="sm" variant="outline">Manage</Button>,
  },
];

export default function DepartmentsPage() {
  const total = departments.reduce((s, d) => s + d.employeeCount, 0);
  return (
    <>
      <PageHeader title="Departments" description={`${departments.length} departments · ${total} employees`}>
        <Button><Plus /> New Department</Button>
      </PageHeader>
      <DataTable columns={columns} rows={departments} searchKeys={["name", "head"]} pageSize={10} />
    </>
  );
}
