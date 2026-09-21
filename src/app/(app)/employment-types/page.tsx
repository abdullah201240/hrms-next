"use client"
import { PageHeader } from "@/components/shared/page-header"
import { DataTable, type Column } from "@/components/shared/data-table"
import { employmentTypes, type EmploymentType } from "@/lib/mock/data-4";

const columns: Column<EmploymentType>[] = [
  { key: "name", header: "Type", sortable: true, cell: (x) => <span className="font-medium">{x.name}</span> },
  { key: "description", header: "Description", cell: (x) => <span className="text-muted-foreground">{x.description}</span> },
];

export default function EmploymentTypesPage() {
  return (
    <>
      <PageHeader title="Employment Types" description="Classifications of employment." />
      <DataTable columns={columns} rows={employmentTypes} searchKeys={["name", "description"]} pageSize={10} />
    </>
  );
}
