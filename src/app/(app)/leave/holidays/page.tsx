"use client";

import { PageHeader } from "@/components/shared/page-header";
import { DataTable, type Column } from "@/components/shared/data-table";
import { holidayLists, type HolidayList } from "@/lib/mock/data-2";
import { fmtDate } from "@/lib/mock/data";

const columns: Column<HolidayList>[] = [
  { key: "name", header: "Holiday List", sortable: true, cell: (x) => <span className="font-medium">{x.name}</span> },
  { key: "from", header: "From", cell: (x) => fmtDate(x.from) },
  { key: "to", header: "To", cell: (x) => fmtDate(x.to) },
  { key: "totalHolidays", header: "Total Holidays", sortable: true, align: "center" },
  { key: "weeklyOff", header: "Weekly Off" },
];

export default function HolidayListsPage() {
  return (
    <>
      <PageHeader title="Holiday List" description="Public holidays and weekly offs applied to attendance." />
      <DataTable columns={columns} rows={holidayLists} searchKeys={["name", "weeklyOff"]} pageSize={10} />
    </>
  );
}
