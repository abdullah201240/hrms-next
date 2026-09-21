"use client";

import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable, type Column } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { salarySlips, fmtMoney, type SalarySlip } from "@/lib/mock/data";
import { Download, Eye } from "lucide-react";

const columns: Column<SalarySlip>[] = [
  { key: "employeeName", header: "Employee", sortable: true },
  { key: "employeeId", header: "Emp ID", className: "hidden md:table-cell text-muted-foreground" },
  { key: "month", header: "Pay Period", sortable: true },
  { key: "gross", header: "Gross", align: "right", sortable: true, cell: (s) => <span className="tabular-nums">{fmtMoney(s.gross)}</span> },
  { key: "deductions", header: "Deductions", align: "right", cell: (s) => <span className="tabular-nums text-muted-foreground">−{fmtMoney(s.deductions)}</span> },
  { key: "net", header: "Net Pay", align: "right", sortable: true, cell: (s) => <span className="font-medium tabular-nums">{fmtMoney(s.net)}</span> },
  { key: "status", header: "Status", cell: (s) => <StatusBadge status={s.status} /> },
  {
    key: "actions",
    header: "",
    align: "right",
    cell: (s) =>
      s.status === "Paid" ? (
        <Button size="sm" variant="outline"><Download /> Slip</Button>
      ) : (
        <Button size="sm" variant="ghost"><Eye /> Preview</Button>
      ),
  },
];

export default function SalarySlipsPage() {
  return (
    <>
      <PageHeader title="Salary Slips" description="Monthly payslips and their payout status." />
      <DataTable columns={columns} rows={salarySlips} searchKeys={["employeeName", "employeeId", "month", "status"]} pageSize={10} />
    </>
  );
}
