"use client";

import { PageHeader } from "@/components/shared/page-header";
import { DataTable, type Column } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { leaveBlockLists, type LeaveBlockList } from "@/lib/mock/data-2";
import { fmtDate } from "@/lib/mock/data";

const columns: Column<LeaveBlockList>[] = [
  { key: "name", header: "Block List", sortable: true, cell: (x) => <span className="font-medium">{x.name}</span> },
  { key: "blockDate", header: "Block Date", sortable: true, cell: (x) => fmtDate(x.blockDate) },
  { key: "allEmployeeDay", header: "All Employees", align: "center", cell: (x) => <Badge variant={x.allEmployeeDay ? "secondary" : "outline"}>{x.allEmployeeDay ? "Yes" : "No"}</Badge> },
  { key: "company", header: "Company", className: "text-muted-foreground" },
];

export default function LeaveBlockListPage() {
  return (
    <>
      <PageHeader title="Leave Block List" description="Dates on which leave cannot be applied." />
      <DataTable columns={columns} rows={leaveBlockLists} searchKeys={["name", "company"]} pageSize={10} />
    </>
  );
}
