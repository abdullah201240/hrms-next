"use client"
import { PageHeader } from "@/components/shared/page-header"
import { DataTable, type Column } from "@/components/shared/data-table"
import { skillMaps, type SkillMap } from "@/lib/mock/data-3";

const columns: Column<SkillMap>[] = [
  { key: "employee", header: "Employee", sortable: true, cell: (x) => <span className="font-medium">{x.employee}</span> },
  { key: "department", header: "Department" },
  { key: "basedOn", header: "Based On", cell: (x) => <span className="text-muted-foreground">{x.basedOn}</span> },
  { key: "totalSkills", header: "Skills", sortable: true, align: "center" },
];

export default function SkillMapsPage() {
  return (
    <>
      <PageHeader title="Employee Skill Maps" description="Skill profiles per employee." />
      <DataTable columns={columns} rows={skillMaps} searchKeys={["employee", "department"]} pageSize={10} />
    </>
  );
}
