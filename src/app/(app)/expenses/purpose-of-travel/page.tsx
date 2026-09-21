"use client";

import { PageHeader } from "@/components/shared/page-header";
import { DataTable, type Column } from "@/components/shared/data-table";
import { purposesOfTravel, type PurposeOfTravel } from "@/lib/mock/data-2";

const columns: Column<PurposeOfTravel>[] = [
  { key: "name", header: "Purpose of Travel", sortable: true, cell: (x) => <span className="font-medium">{x.name}</span> },
];

export default function PurposeOfTravelPage() {
  return (
    <>
      <PageHeader title="Purpose of Travel" description="Selectable reasons on travel requests." />
      <DataTable columns={columns} rows={purposesOfTravel} searchKeys={["name"]} pageSize={10} />
    </>
  );
}
