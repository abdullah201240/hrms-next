"use client"
import { PageHeader } from "@/components/shared/page-header"
import { DataTable, type Column } from "@/components/shared/data-table"
import { StatusBadge } from "@/components/shared/status-badge"
import { appointmentLetters, type AppointmentLetter } from "@/lib/mock/data-3"
import { fmtMoney } from "@/lib/mock/data";

const columns: Column<AppointmentLetter>[] = [
  { key: "employeeName", header: "Employee", sortable: true, cell: (x) => <span className="font-medium">{x.employeeName}</span> },
  { key: "designation", header: "Designation" },
  { key: "basicSalary", header: "Basic", sortable: true, align: "right", cell: (x) => <span className="tabular-nums font-medium">{fmtMoney(x.basicSalary)}</span> },
  { key: "templName", header: "Template", className: "hidden lg:table-cell", cell: (x) => <span className="text-muted-foreground">{x.templName}</span> },
  { key: "status", header: "Status", cell: (x) => <StatusBadge status={x.status} /> },
];

export default function AppointmentLettersPage() {
  return (
    <>
      <PageHeader title="Appointment Letters" description="Formal appointment letter records." />
      <DataTable columns={columns} rows={appointmentLetters} searchKeys={["employeeName", "designation"]} pageSize={10} />
    </>
  );
}
