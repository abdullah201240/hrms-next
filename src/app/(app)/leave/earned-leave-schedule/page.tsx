"use client"
import { PageHeader } from "@/components/shared/page-header"
import { DataTable, type Column } from "@/components/shared/data-table"
import { earnedLeaveSchedules, type EarnedLeaveSchedule } from "@/lib/mock/data-4"
import { fmtDate } from "@/lib/mock/data";

const columns: Column<EarnedLeaveSchedule>[] = [
  { key: "employee", header: "Employee", sortable: true, cell: (x) => <span className="font-medium">{x.employee}</span> },
  { key: "leaveType", header: "Leave Type" },
  { key: "accrualFrequency", header: "Frequency", align: "center" },
  { key: "nextAccrualDate", header: "Next Accrual", sortable: true, cell: (x) => fmtDate(x.nextAccrualDate) },
  { key: "totalLeavesEarned", header: "Earned", sortable: true, align: "center" },
];

export default function EarnedLeaveSchedulePage() {
  return (
    <>
      <PageHeader title="Earned Leave Schedule" description="Accrual schedule for earned leave." />
      <DataTable columns={columns} rows={earnedLeaveSchedules} searchKeys={["employee", "leaveType"]} pageSize={10} />
    </>
  );
}
