"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SearchSelect } from "@/components/shared/search-select";
import { ChildTable } from "@/components/shared/child-table";
import { PageHeader } from "@/components/shared/page-header";
import { company, employees, departments } from "@/lib/mock/data";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

const CURRENCIES = ["BDT"];
const PROJECTS = ["Website Redesign", "Mobile App", "Internal Tools", "Client Portal", "HR Automation"];

// Fields cloned from the ERPNext `Timesheet` doctype.
export default function NewTimesheetPage() {
  const router = useRouter();
  const [v, setV] = useState<Record<string, string>>({
    series: "TS-.YYYY.-",
    companyName: company.name,
    currency: "BDT",
  });
  const set = (k: string, val: string) => setV((p) => ({ ...p, [k]: val }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const missing: string[] = [];
    if (!v.employee?.trim()) missing.push("Employee");
    if (!v.startDate?.trim()) missing.push("Start Date");
    if (missing.length) {
      toast.error(`Missing required: ${missing.join(", ")}`);
      return;
    }
    toast.success(`Timesheet logged for ${v.employee}`);
    router.push("/attendance/my-timesheets");
  };

  return (
    <>
      <Button variant="ghost" size="sm" className="-ml-2 w-fit" render={<Link href="/attendance/my-timesheets" />}>
        <ArrowLeft /> Back to My Timesheets
      </Button>
      <PageHeader title="Log Time" description="Create a timesheet — fields mirror the Frappe Timesheet form." />

      <form className="space-y-6" onSubmit={submit}>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Timesheet</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="series" className="after:content-['*'] after:ml-0.5 after:text-destructive">Series</Label>
                <SearchSelect id="series" value={v.series ?? ""} onChange={(val) => set("series", val)} options={["TS-.YYYY.-"]} placeholder="Search series…" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company">Company</Label>
                <SearchSelect id="company" value={v.companyName ?? ""} onChange={(val) => set("companyName", val)} options={[company.name]} placeholder="Search company…" addLabel="Company" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="project">Project</Label>
                <SearchSelect id="project" value={v.project ?? ""} onChange={(val) => set("project", val)} options={PROJECTS} placeholder="Search project…" addLabel="Project" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <SearchSelect id="currency" value={v.currency ?? ""} onChange={(val) => set("currency", val)} options={CURRENCIES} placeholder="Search currency…" addLabel="Currency" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Employee Detail</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="employee" className="after:content-['*'] after:ml-0.5 after:text-destructive">Employee</Label>
                <SearchSelect id="employee" value={v.employee ?? ""} onChange={(val) => set("employee", val)} options={employees.map((e) => e.name)} placeholder="Search employee…" addLabel="Employee" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <SearchSelect id="department" value={v.department ?? ""} onChange={(val) => set("department", val)} options={departments.map((d) => d.name)} placeholder="Search department…" addLabel="Department" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input id="startDate" type="date" value={v.startDate ?? ""} onChange={(e) => set("startDate", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input id="endDate" type="date" value={v.endDate ?? ""} onChange={(e) => set("endDate", e.target.value)} />
              </div>
            </div>
          </CardContent>
        </Card>

        <ChildTable
          title="Time Logs"
          desc="Hours worked, grouped by activity type."
          columns={[
            { label: "Activity Type", type: "text" },
            { label: "From Date", type: "date" },
            { label: "To Date", type: "date" },
            { label: "Hours", type: "number" },
          ]}
        />

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Note</CardTitle>
            <CardDescription>Optional remarks for this timesheet.</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea id="note" rows={3} value={v.note ?? ""} onChange={(e) => set("note", e.target.value)} />
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2 pb-8">
          <Button type="button" variant="outline" render={<Link href="/attendance/my-timesheets" />}>Cancel</Button>
          <Button type="submit">Create Timesheet</Button>
        </div>
      </form>
    </>
  );
}
