"use client"
import { PageHeader } from "@/components/shared/page-header"
import { DataTable, type Column } from "@/components/shared/data-table"
import { employeeSkills, type EmployeeSkill } from "@/lib/mock/data-4";

const columns: Column<EmployeeSkill>[] = [
  { key: "employee", header: "Employee", sortable: true, cell: (x) => <span className="font-medium">{x.employee}</span> },
  { key: "skill", header: "Skill" },
  { key: "proficiency", header: "Proficiency", sortable: true, align: "center" },
  { key: "assessmentCount", header: "Assessments", sortable: true, align: "center" },
];

export default function EmployeeSkillsPage() {
  return (
    <>
      <PageHeader title="Employee Skills" description="Skill records and proficiency." />
      <DataTable columns={columns} rows={employeeSkills} searchKeys={["employee", "skill"]} pageSize={10} />
    </>
  );
}
