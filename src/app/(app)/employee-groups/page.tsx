"use client";

import { PageHeader } from "@/components/shared/page-header";
import { DataTable, type Column } from "@/components/shared/data-table";
import { employeeGroups, type EmployeeGroup } from "@/lib/mock/data-2";

const columns: Column<EmployeeGroup>[] = [
  { key: "name", header: "Group", sortable: true, cell: (x) => <span className="font-medium">{x.name}</span> },
  { key: "description", header: "Description", className: "text-muted-foreground" },
  { key: "strength", header: "Strength", sortable: true, align: "right", cell: (x) => <span className="tabular-nums">{x.strength}</span> },
];

export default function EmployeeGroupsPage() {
  return (
    <>
      <PageHeader title="Employee Groups" description="Logical groupings used for leave, payroll and reports." />
      <DataTable columns={columns} rows={employeeGroups} searchKeys={["name", "description"]} pageSize={10} />
    </>
  );
}
