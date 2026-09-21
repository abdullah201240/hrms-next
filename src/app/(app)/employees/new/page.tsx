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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/components/shared/page-header";
import { departments, designations, employees, type EmployeeStatus } from "@/lib/mock/data";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

const STATUSES: EmployeeStatus[] = ["Active", "On Probation", "Notice Period", "Inactive"];
const ROLES = ["employee", "hr", "admin", "approver"] as const;

export default function NewEmployeePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [department, setDepartment] = useState("");
  const [designation, setDesignation] = useState("");
  const [reportsTo, setReportsTo] = useState("");
  const [joinDate, setJoinDate] = useState("");
  const [workLocation, setWorkLocation] = useState("");
  const [baseSalary, setBaseSalary] = useState("");
  const [status, setStatus] = useState<EmployeeStatus>("Active");
  const [role, setRole] = useState<(typeof ROLES)[number]>("employee");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !department) {
      toast.error("Name, email and department are required.");
      return;
    }
    // Mock-only: real persistence would happen here.
    toast.success(`${name.trim()} added as ${designation || "employee"}`);
    router.push("/employees");
  };

  return (
    <>
      <Button variant="ghost" size="sm" className="-ml-2 w-fit" render={<Link href="/employees" />}>
        <ArrowLeft /> Back to Employees
      </Button>
      <PageHeader title="New Employee" description="Create an employee record." />

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="text-base">Employee Details</CardTitle>
          <CardDescription>Fill in the core information. All fields marked required must be completed.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-5" onSubmit={submit}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jane@company.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 555 000 1234" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="joinDate">Date of Joining</Label>
                <Input id="joinDate" type="date" value={joinDate} onChange={(e) => setJoinDate(e.target.value)} />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="department">Department *</Label>
                <Select value={department} onValueChange={(v) => setDepartment(v ?? "")}>
                  <SelectTrigger id="department" className="w-full">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((d) => (
                      <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="designation">Designation</Label>
                <Select value={designation} onValueChange={(v) => setDesignation(v ?? "")}>
                  <SelectTrigger id="designation" className="w-full">
                    <SelectValue placeholder="Select designation" />
                  </SelectTrigger>
                  <SelectContent>
                    {designations.map((d) => (
                      <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reportsTo">Reports To</Label>
              <Select value={reportsTo} onValueChange={(v) => setReportsTo(v ?? "")}>
                <SelectTrigger id="reportsTo" className="w-full">
                  <SelectValue placeholder="Select reporting manager" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((e) => (
                    <SelectItem key={e.id} value={e.name}>{e.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="workLocation">Work Location</Label>
                <Input id="workLocation" value={workLocation} onChange={(e) => setWorkLocation(e.target.value)} placeholder="New York" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="baseSalary">Base Salary (USD)</Label>
                <Input id="baseSalary" type="number" min="0" step="1000" value={baseSalary} onChange={(e) => setBaseSalary(e.target.value)} placeholder="0" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={status} onValueChange={(v) => setStatus((v as EmployeeStatus) ?? "Active")}>
                  <SelectTrigger id="status" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">System Role</Label>
                <Select value={role} onValueChange={(v) => setRole((v as (typeof ROLES)[number]) ?? "employee")}>
                  <SelectTrigger id="role" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLES.map((r) => (
                      <SelectItem key={r} value={r}>{r[0].toUpperCase() + r.slice(1)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" render={<Link href="/employees" />}>Cancel</Button>
              <Button type="submit">Create Employee</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </>
  );
}
