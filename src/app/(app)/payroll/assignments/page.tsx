"use client"
import { PageHeader } from "@/components/shared/page-header"
import { DataTable, type Column } from "@/components/shared/data-table"
import { salaryStructureAssignments, type SalaryStructureAssignment } from "@/lib/mock/data-2"
import { fmtDate, fmtMoney } from "@/lib/mock/data";

const columns: Column<SalaryStructureAssignment>[] = [
  { key: "employee", header: "Employee", sortable: true, cell: (x) => <span className="font-medium">{x.employee}</span> },
  { key: "salaryStructure", header: "Structure" },
  { key: "base", header: "Base", sortable: true, align: "right", cell: (x) => <span className="tabular-nums font-medium">{fmtMoney(x.base)}</span> },
  { key: "amount", header: "Monthly", sortable: true, align: "right", cell: (x) => <span className="tabular-nums font-medium">{fmtMoney(x.amount)}</span> },
  { key: "fromDate", header: "From", className: "hidden lg:table-cell", cell: (x) => fmtDate(x.fromDate) },
  { key: "currency", header: "Currency", align: "center" },
];

export default function StructureAssignmentPage() {
  return (
    <>
      <PageHeader title="Salary Structure Assignment" description="Employee-to-structure mapping with base pay." />
      <DataTable columns={columns} rows={salaryStructureAssignments} searchKeys={["employee", "salaryStructure"]} pageSize={10} />
    </>
  );
}
