"use client"
import { PageHeader } from "@/components/shared/page-header"
import { DataTable, type Column } from "@/components/shared/data-table"
import { employeeCostCenters, type EmployeeCostCenter } from "@/lib/mock/data-2";

const columns: Column<EmployeeCostCenter>[] = [
  { key: "employee", header: "Employee", sortable: true, cell: (x) => <span className="font-medium">{x.employee}</span> },
  { key: "department", header: "Department" },
  { key: "costCenter", header: "Cost Center" },
  { key: "percentage", header: "Allocation", sortable: true, align: "center", cell: (x) => <span className="tabular-nums">{x.percentage}%</span> },
];

export default function CostCentersPage() {
  return (
    <>
      <PageHeader title="Employee Cost Centers" description="Allocate salary expense across cost centers." />
      <DataTable columns={columns} rows={employeeCostCenters} searchKeys={["employee", "costCenter"]} pageSize={10} />
    </>
  );
}
