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
import { Checkbox } from "@/components/ui/checkbox";
import { SearchSelect } from "@/components/shared/search-select";
import { ChildTable } from "@/components/shared/child-table";
import { PageHeader } from "@/components/shared/page-header";
import { company } from "@/lib/mock/data";
import { salaryComponents } from "@/lib/mock/data-2";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

const CURRENCIES = ["BDT"];
const MODES = ["Bank", "Cash", "Cheque"];
const componentNames = salaryComponents.map((c) => c.name);

// Fields cloned from the HRMS `Salary Structure` doctype.
export default function NewSalaryStructurePage() {
  const router = useRouter();
  const [v, setV] = useState<Record<string, string>>({
    companyName: company.name,
    currency: "BDT",
    isActive: "Yes",
    payrollFrequency: "Monthly",
  });
  const set = (k: string, val: string) => setV((p) => ({ ...p, [k]: val }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const missing: string[] = [];
    if (!v.companyName?.trim()) missing.push("Company");
    if (!v.currency?.trim()) missing.push("Currency");
    if (!v.isActive?.trim()) missing.push("Is Active");
    if (missing.length) {
      toast.error(`Missing required: ${missing.join(", ")}`);
      return;
    }
    toast.success(`Salary structure created for ${v.companyName}`);
    router.push("/payroll");
  };

  return (
    <>
      <Button variant="ghost" size="sm" className="-ml-2 w-fit" render={<Link href="/payroll" />}>
        <ArrowLeft /> Back to Salary Structures
      </Button>
      <PageHeader title="New Salary Structure" description="Create a compensation template — fields mirror the Frappe HR Salary Structure form." />

      <form className="space-y-6" onSubmit={submit}>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Company &amp; Pay Basis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="company" className="after:content-['*'] after:ml-0.5 after:text-destructive">Company</Label>
                <SearchSelect id="company" value={v.companyName ?? ""} onChange={(val) => set("companyName", val)} options={[company.name]} placeholder="Search company…" addLabel="Company" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency" className="after:content-['*'] after:ml-0.5 after:text-destructive">Currency</Label>
                <SearchSelect id="currency" value={v.currency ?? ""} onChange={(val) => set("currency", val)} options={CURRENCIES} placeholder="Search currency…" addLabel="Currency" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="letterHead">Letter Head</Label>
                <SearchSelect id="letterHead" value={v.letterHead ?? ""} onChange={(val) => set("letterHead", val)} options={[company.name]} placeholder="Search letter head…" addLabel="Letter Head" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="isActive" className="after:content-['*'] after:ml-0.5 after:text-destructive">Is Active</Label>
                <SearchSelect id="isActive" value={v.isActive ?? ""} onChange={(val) => set("isActive", val)} options={["Yes", "No"]} placeholder="Search…" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="payrollFrequency">Payroll Frequency</Label>
                <SearchSelect id="payrollFrequency" value={v.payrollFrequency ?? ""} onChange={(val) => set("payrollFrequency", val)} options={["Monthly", "Fortnightly", "Bimonthly", "Weekly", "Daily"]} placeholder="Search…" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="modeOfPayment">Mode of Payment</Label>
                <SearchSelect id="modeOfPayment" value={v.modeOfPayment ?? ""} onChange={(val) => set("modeOfPayment", val)} options={MODES} placeholder="Search mode…" addLabel="Mode of Payment" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Compensation Settings</CardTitle>
            <CardDescription>Timesheet-based pay and rate defaults.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="flex items-center gap-2 pt-6">
                <Checkbox id="salaryBasedOnTimesheet" checked={v.salaryBasedOnTimesheet === "true"} onCheckedChange={(c) => set("salaryBasedOnTimesheet", c === true ? "true" : "false")} />
                <label htmlFor="salaryBasedOnTimesheet" className="text-sm leading-none">Salary Slip Based on Timesheet</label>
              </div>
              <div className="space-y-2">
                <Label htmlFor="salaryComponent">Salary Component</Label>
                <SearchSelect id="salaryComponent" value={v.salaryComponent ?? ""} onChange={(val) => set("salaryComponent", val)} options={componentNames} placeholder="Search component…" addLabel="Salary Component" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hourRate">Hour Rate</Label>
                <Input id="hourRate" type="number" min="0" step="any" value={v.hourRate ?? ""} onChange={(e) => set("hourRate", e.target.value)} placeholder="0" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="leaveEncashment">Leave Encashment Amount Per Day</Label>
                <Input id="leaveEncashment" type="number" min="0" step="any" value={v.leaveEncashment ?? ""} onChange={(e) => set("leaveEncashment", e.target.value)} placeholder="0" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxBenefits">Max Benefits (Amount)</Label>
                <Input id="maxBenefits" type="number" min="0" step="any" value={v.maxBenefits ?? ""} onChange={(e) => set("maxBenefits", e.target.value)} placeholder="0" />
              </div>
            </div>
          </CardContent>
        </Card>

        <ChildTable title="Earnings" desc="Earning components and amounts." columns={[{ label: "Salary Component", type: "text" }, { label: "Amount", type: "number" }]} />
        <ChildTable title="Deductions" desc="Deduction components and amounts." columns={[{ label: "Salary Component", type: "text" }, { label: "Amount", type: "number" }]} />
        <ChildTable title="Employer Contributions" desc="Employer-paid contribution components." columns={[{ label: "Salary Component", type: "text" }, { label: "Amount", type: "number" }]} />

        <div className="flex justify-end gap-2 pb-8">
          <Button type="button" variant="outline" render={<Link href="/payroll" />}>Cancel</Button>
          <Button type="submit">Create Salary Structure</Button>
        </div>
      </form>
    </>
  );
}
