"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { SearchSelect } from "@/components/shared/search-select";
import { PageHeader } from "@/components/shared/page-header";
import { departments, company } from "@/lib/mock/data";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

// Fields cloned from the ERPNext `Department` doctype.
export default function NewDepartmentPage() {
  const router = useRouter();
  const [v, setV] = useState<Record<string, string>>({ companyName: company.name });
  const set = (k: string, val: string) => setV((p) => ({ ...p, [k]: val }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!v.departmentName?.trim() || !v.companyName?.trim()) {
      toast.error("Missing required: Department, Company");
      return;
    }
    toast.success(`${v.departmentName} added to ${v.companyName}`);
    router.push("/departments");
  };

  return (
    <>
      <Button variant="ghost" size="sm" className="-ml-2 w-fit" render={<Link href="/departments" />}>
        <ArrowLeft /> Back to Departments
      </Button>
      <PageHeader title="New Department" description="Create a department — fields mirror the Frappe Department form." />

      <form className="space-y-6" onSubmit={submit}>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Department</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="departmentName" className="after:content-['*'] after:ml-0.5 after:text-destructive">Department</Label>
                <Input id="departmentName" value={v.departmentName ?? ""} onChange={(e) => set("departmentName", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="parentDepartment">Parent Department</Label>
                <SearchSelect
                  id="parentDepartment"
                  value={v.parentDepartment ?? ""}
                  onChange={(val) => set("parentDepartment", val)}
                  options={departments.map((d) => d.name)}
                  placeholder="Search parent department…"
                  addLabel="Department"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company" className="after:content-['*'] after:ml-0.5 after:text-destructive">Company</Label>
                <SearchSelect
                  id="company"
                  value={v.companyName ?? ""}
                  onChange={(val) => set("companyName", val)}
                  options={[company.name]}
                  placeholder="Search company…"
                  addLabel="Company"
                />
              </div>
              <div className="flex flex-wrap items-center gap-6 pt-6">
                <div className="flex items-center gap-2">
                  <Checkbox id="isGroup" checked={v.isGroup === "true"} onCheckedChange={(c) => set("isGroup", c === true ? "true" : "false")} />
                  <label htmlFor="isGroup" className="text-sm leading-none">Is Group</label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox id="disabled" checked={v.disabled === "true"} onCheckedChange={(c) => set("disabled", c === true ? "true" : "false")} />
                  <label htmlFor="disabled" className="text-sm leading-none">Disabled</label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2 pb-8">
          <Button type="button" variant="outline" render={<Link href="/departments" />}>Cancel</Button>
          <Button type="submit">Create Department</Button>
        </div>
      </form>
    </>
  );
}
