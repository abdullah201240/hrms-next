"use client";

import { PageHeader } from "@/components/shared/page-header";
import { DataTable, type Column } from "@/components/shared/data-table";
import { employeeGrades, type EmployeeGrade } from "@/lib/mock/data-2";
import { fmtMoney } from "@/lib/mock/data";

const columns: Column<EmployeeGrade>[] = [
  { key: "name", header: "Grade", sortable: true, cell: (x) => <span className="font-medium">{x.name}</span> },
  { key: "level", header: "Level", sortable: true, align: "center" },
  { key: "minSalary", header: "Min Salary", sortable: true, align: "right", cell: (x) => <span className="tabular-nums">{fmtMoney(x.minSalary)}</span> },
  { key: "maxSalary", header: "Max Salary", sortable: true, align: "right", cell: (x) => <span className="tabular-nums">{fmtMoney(x.maxSalary)}</span> },
  { key: "defaultComponent", header: "Default Structure", className: "hidden lg:table-cell text-muted-foreground" },
];

export default function EmployeeGradesPage() {
  return (
    <>
      <PageHeader title="Employee Grades" description="Salary grades and bands used for costing and appraisals." />
      <DataTable columns={columns} rows={employeeGrades} searchKeys={["name", "defaultComponent"]} pageSize={10} />
    </>
  );
}
