"use client";

import { PageHeader } from "@/components/shared/page-header";
import { DataTable, type Column } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { grievanceTypes, type GrievanceType } from "@/lib/mock/data-3";

const columns: Column<GrievanceType>[] = [
  { key: "name", header: "Grievance Type", sortable: true, cell: (x) => <span className="font-medium">{x.name}</span> },
  { key: "isSubmittable", header: "Employees Can Submit", align: "center", cell: (x) => <Badge variant={x.isSubmittable ? "secondary" : "outline"}>{x.isSubmittable ? "Yes" : "No"}</Badge> },
];

export default function GrievanceTypesPage() {
  return (
    <>
      <PageHeader title="Grievance Types" description="Categories used when logging employee grievances." />
      <DataTable columns={columns} rows={grievanceTypes} searchKeys={["name"]} pageSize={10} />
    </>
  );
}
