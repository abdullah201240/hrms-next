"use client"
import { PageHeader } from "@/components/shared/page-header"
import { DataTable, type Column } from "@/components/shared/data-table"
import { Badge } from "@/components/ui/badge"
import { payrollCorrections, type PayrollCorrection } from "@/lib/mock/data-4";

const columns: Column<PayrollCorrection>[] = [
  { key: "employee", header: "Employee", sortable: true, cell: (x) => <span className="font-medium">{x.employee}</span> },
  { key: "payrollEntry", header: "Payroll Entry" },
  { key: "month", header: "Month", align: "center" },
  { key: "submitted", header: "Submitted", align: "center", cell: (x) => <Badge variant={x.submitted ? "secondary" : "outline"}>{x.submitted ? "Yes" : "No"}</Badge> },
];

export default function PayrollCorrectionPage() {
  return (
    <>
      <PageHeader title="Payroll Correction" description="Corrections against a payroll entry." />
      <DataTable columns={columns} rows={payrollCorrections} searchKeys={["employee", "payrollEntry"]} pageSize={10} />
    </>
  );
}
