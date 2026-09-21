"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable, type Column } from "@/components/shared/data-table";
import { designations, type Designation } from "@/lib/mock/data";
import { Plus } from "lucide-react";

const columns: Column<Designation>[] = [
  { key: "name", header: "Designation", sortable: true },
  { key: "department", header: "Department", sortable: true },
  { key: "grade", header: "Grade", cell: (d) => <Badge variant="secondary">{d.grade}</Badge> },
  { key: "reportsTo", header: "Reports To", className: "hidden md:table-cell" },
  { key: "actions", header: "", align: "right", cell: () => <Button size="sm" variant="outline">Edit</Button> },
];

export default function DesignationsPage() {
  return (
    <>
      <PageHeader title="Designations" description={`${designations.length} roles defined`}>
        <Button><Plus /> New Designation</Button>
      </PageHeader>
      <DataTable columns={columns} rows={designations} searchKeys={["name", "department", "grade"]} pageSize={10} />
    </>
  );
}
