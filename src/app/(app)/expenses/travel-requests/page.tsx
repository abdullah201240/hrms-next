"use client"
import { PageHeader } from "@/components/shared/page-header"
import { DataTable, type Column } from "@/components/shared/data-table"
import { StatusBadge } from "@/components/shared/status-badge"
import { travelRequests, type TravelRequest } from "@/lib/mock/data-2"
import { fmtDate, fmtMoney } from "@/lib/mock/data";

const columns: Column<TravelRequest>[] = [
  { key: "employee", header: "Employee", sortable: true, cell: (x) => <span className="font-medium">{x.employee}</span> },
  { key: "purpose", header: "Purpose" },
  { key: "modeOfTravel", header: "Mode", align: "center" },
  { key: "travelDate", header: "Date", sortable: true, cell: (x) => fmtDate(x.travelDate) },
  { key: "amount", header: "Est. Cost", sortable: true, align: "right", cell: (x) => <span className="tabular-nums font-medium">{fmtMoney(x.amount)}</span> },
  { key: "status", header: "Status", cell: (x) => <StatusBadge status={x.status} /> },
];

export default function TravelRequestsPage() {
  return (
    <>
      <PageHeader title="Travel Requests" description="Employee travel approvals." />
      <DataTable columns={columns} rows={travelRequests} searchKeys={["employee", "purpose"]} pageSize={10} />
    </>
  );
}
