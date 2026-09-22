"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable, type Column } from "@/components/shared/data-table";
import { SearchSelect } from "@/components/shared/search-select";
import { employees } from "@/lib/mock/data";
import {
  salaryAssignments,
  salaryTemplates,
  templateById,
  previewTemplate,
  fmtMoney,
  type SalaryAssignment,
} from "@/lib/mock/payroll";
import { toast } from "sonner";
import { UserCog, Plus } from "lucide-react";

type Row = SalaryAssignment & { local?: boolean };

const employeeNames = employees.map((e) => e.name);
const templateNames = salaryTemplates.map((t) => t.name);
const nameToTemplateId = (n: string) => salaryTemplates.find((t) => t.name === n)?.id ?? salaryTemplates[0].id;

const grossOf = (r: Row) => {
  const t = templateById(r.templateId);
  return t ? previewTemplate(t, r.basic).gross : r.basic;
};
const netOf = (r: Row) => {
  const t = templateById(r.templateId);
  return t ? previewTemplate(t, r.basic).net : r.basic;
};

const columns: Column<Row>[] = [
  {
    key: "employee",
    header: "Employee",
    sortable: true,
    cell: (r) => (
      <div>
        <div className="font-semibold text-slate-800 dark:text-slate-100">{r.employee}</div>
        <div className="text-xs text-slate-500 dark:text-slate-400">{r.employeeId} · {r.designation}</div>
      </div>
    ),
  },
  { key: "template", header: "Template", cell: (r) => <span className="text-slate-700 dark:text-slate-200">{templateById(r.templateId)?.name ?? "—"}</span> },
  { key: "basic", header: "Basic / mo", sortable: true, align: "right", cell: (r) => <span className="tabular-nums">{fmtMoney(r.basic)}</span> },
  { key: "gross", header: "Gross / mo", align: "right", cell: (r) => <span className="tabular-nums text-slate-700 dark:text-slate-200">{fmtMoney(grossOf(r))}</span> },
  { key: "net", header: "Net / mo", sortable: true, align: "right", cell: (r) => <span className="font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">{fmtMoney(netOf(r))}</span> },
  { key: "effectiveFrom", header: "Effective", align: "center", cell: (r) => <span className="text-xs text-slate-500 dark:text-slate-400">{r.effectiveFrom}</span> },
  {
    key: "status",
    header: "Status",
    align: "center",
    cell: (r) =>
      r.status === "Active" ? (
        <Badge variant="secondary" className="rounded-full bg-emerald-50 font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">Active</Badge>
      ) : (
        <Badge variant="secondary" className="rounded-full font-semibold text-slate-500">Inactive</Badge>
      ),
  },
];

export default function AssignSalaryPage() {
  const [rows, setRows] = useState<Row[]>(salaryAssignments);
  const [employee, setEmployee] = useState("");
  const [template, setTemplate] = useState(salaryTemplates[0].name);
  const [basic, setBasic] = useState("");
  const [from, setFrom] = useState("2026-01-01");

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = employees.find((x) => x.name === employee);
    const amt = Number(basic);
    if (!emp) {
      toast.error("Pick an employee.");
      return;
    }
    if (!amt || amt <= 0) {
      toast.error("Enter a monthly Basic Salary.");
      return;
    }
    const row: Row = {
      id: `as-local-${Date.now()}`,
      employee: emp.name,
      employeeId: emp.employeeId,
      department: emp.department,
      designation: emp.designation,
      templateId: nameToTemplateId(template),
      basic: Math.round(amt),
      effectiveFrom: from,
      status: "Active",
      local: true,
    };
    setRows((r) => [row, ...r]);
    setEmployee("");
    setBasic("");
    toast.success(`Assigned "${template}" to ${emp.name}`);
  };

  return (
    <>
      <PageHeader title="Assign Salary" description="Bind a salary template to an employee with their monthly Basic Salary." />

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base"><UserCog className="size-4 text-blue-600" /> New assignment</CardTitle>
          <CardDescription>Pick an employee and a template, set the basic — done.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_auto_auto_auto]" onSubmit={add}>
            <div className="space-y-2">
              <Label>Employee</Label>
              <SearchSelect value={employee} onChange={setEmployee} options={employeeNames} placeholder="Search employee…" />
            </div>
            <div className="space-y-2">
              <Label>Salary Template</Label>
              <SearchSelect value={template} onChange={setTemplate} options={templateNames} placeholder="Search template…" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="basic">Basic / mo (৳)</Label>
              <Input id="basic" type="number" min="0" step="any" className="w-36" value={basic} onChange={(e) => setBasic(e.target.value)} placeholder="50000" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="eff">Effective from</Label>
              <Input id="eff" type="date" className="w-44" value={from} onChange={(e) => setFrom(e.target.value)} />
            </div>
            <div className="flex items-end">
              <Button type="submit" className="h-10 rounded-xl bg-blue-600 font-semibold text-white hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500">
                <Plus className="size-4" /> Assign
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <DataTable columns={columns} rows={rows} searchKeys={["employee", "employeeId", "designation"]} pageSize={10} />
    </>
  );
}
