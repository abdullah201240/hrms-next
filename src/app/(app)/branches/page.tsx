"use client";

import { PageHeader } from "@/components/shared/page-header";
import { DataTable, type Column } from "@/components/shared/data-table";
import { branches, type Branch } from "@/lib/mock/data-2";

const columns: Column<Branch>[] = [
  { key: "name", header: "Branch", sortable: true, cell: (x) => <span className="font-medium">{x.name}</span> },
  { key: "city", header: "City", sortable: true },
  { key: "company", header: "Company" },
  { key: "head", header: "Branch Head", className: "text-muted-foreground" },
];

export default function BranchesPage() {
  return (
    <>
      <PageHeader title="Branches" description="Physical and distributed office locations." />
      <DataTable columns={columns} rows={branches} searchKeys={["name", "city", "head"]} pageSize={10} />
    </>
  );
}
