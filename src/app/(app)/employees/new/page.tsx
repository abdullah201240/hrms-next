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
import { Checkbox } from "@/components/ui/checkbox";
import { SearchSelect } from "@/components/shared/search-select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageHeader } from "@/components/shared/page-header";
import {
  departments,
  designations,
  employees,
} from "@/lib/mock/data";
import { branches, holidayLists, employeeGrades } from "@/lib/mock/data-2";
import { toast } from "sonner";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";

/* ------------------------------------------------------------------ *
 * Options cloned directly from the ERPNext/HRMS `Employee` doctype.
 * Select = literal doctype options; Link = dropdown fed from mock masters.
 * ------------------------------------------------------------------ */
const OPTIONS = {
  series: ["HR-EMP-"],
  salutation: ["Mr.", "Mrs.", "Ms.", "M/s.", "Dr.", "Prof."],
  gender: ["Male", "Female", "Others", "Prefer Not To Say"],
  status: ["Active", "Inactive", "Suspended", "Left"],
  salaryMode: ["Bank", "Cash", "Cheque"],
  preferredContact: ["Company Email", "Personal Email", "User ID"],
  addressIs: ["Rented", "Owned"],
  marital: ["Single", "Married", "Divorced", "Widowed"],
  blood: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
  yesNo: ["Yes", "No"],
  company: ["Acme"],
  currency: ["USD", "EUR", "GBP", "INR", "AED"],
  department: departments.map((d) => d.name),
  designation: designations.map((d) => d.name),
  branch: branches.map((b) => b.name),
  holidayList: holidayLists.map((h) => h.name),
  reportsTo: employees.map((e) => e.name),
  grade: employeeGrades.map((g) => g.name),
} as const;

// Link fields (Frappe doctype links) get a "+ Add {Doctype}" quick-create item.
const LINK_DOCTYPE: Record<string, string> = {
  salutation: "Salutation",
  gender: "Gender",
  company: "Company",
  department: "Department",
  designation: "Designation",
  reportsTo: "Employee",
  branch: "Branch",
  holidayList: "Holiday List",
  grade: "Employee Grade",
  salaryCurrency: "Currency",
};

type FieldDef = {
  key: string;
  label: string;
  type: "text" | "email" | "tel" | "number" | "date" | "select" | "textarea" | "check";
  options?: readonly string[];
  req?: boolean;
  placeholder?: string;
  full?: boolean;
};

type SectionDef = { title: string; desc?: string; fields: FieldDef[] };

const SECTIONS: SectionDef[] = [
  {
    title: "Basic Information",
    fields: [
      { key: "series", label: "Series", type: "select", options: OPTIONS.series },
      { key: "salutation", label: "Salutation", type: "select", options: OPTIONS.salutation },
      { key: "firstName", label: "First Name", type: "text", req: true },
      { key: "middleName", label: "Middle Name", type: "text" },
      { key: "lastName", label: "Last Name", type: "text" },
      { key: "employeeName", label: "Full Name", type: "text", placeholder: "Auto-set from names" },
      { key: "employeeNumber", label: "Employee Number", type: "text" },
      { key: "company", label: "Company", type: "select", options: OPTIONS.company, req: true },
      { key: "status", label: "Status", type: "select", options: OPTIONS.status, req: true },
      { key: "gender", label: "Gender", type: "select", options: OPTIONS.gender, req: true },
      { key: "dob", label: "Date of Birth", type: "date", req: true },
      { key: "dateOfJoining", label: "Date of Joining", type: "date", req: true },
    ],
  },
  {
    title: "Destination",
    desc: "Where the employee sits in the organisation.",
    fields: [
      { key: "department", label: "Department", type: "select", options: OPTIONS.department },
      { key: "designation", label: "Designation", type: "select", options: OPTIONS.designation },
      { key: "reportsTo", label: "Reports To", type: "select", options: OPTIONS.reportsTo },
      { key: "branch", label: "Branch", type: "select", options: OPTIONS.branch },
      { key: "holidayList", label: "Holiday List", type: "select", options: OPTIONS.holidayList },
      { key: "grade", label: "Grade", type: "select", options: OPTIONS.grade },
    ],
  },
  {
    title: "Salary & Compensation",
    fields: [
      { key: "salaryCurrency", label: "Salary Currency", type: "select", options: OPTIONS.currency },
      { key: "ctc", label: "Cost to Company (CTC)", type: "number", placeholder: "0" },
      { key: "baseSalary", label: "Base Salary", type: "number", placeholder: "0" },
      { key: "salaryMode", label: "Salary Mode", type: "select", options: OPTIONS.salaryMode },
      { key: "bankName", label: "Bank Name", type: "text" },
      { key: "bankAcno", label: "Bank A/C No.", type: "text" },
      { key: "iban", label: "IBAN", type: "text" },
    ],
  },
  {
    title: "Terms & Dates",
    fields: [
      { key: "offerDate", label: "Offer Date", type: "date" },
      { key: "confirmationDate", label: "Confirmation Date", type: "date" },
      { key: "contractEndDate", label: "Contract End Date", type: "date" },
      { key: "retirementDate", label: "Date of Retirement", type: "date" },
      { key: "noticeDays", label: "Notice (days)", type: "number", placeholder: "0" },
      { key: "attendanceDeviceId", label: "Attendance Device ID", type: "text", placeholder: "Biometric / RF tag ID" },
    ],
  },
  {
    title: "Contact & User",
    fields: [
      { key: "mobile", label: "Mobile", type: "tel" },
      { key: "preferredContact", label: "Preferred Contact Email", type: "select", options: OPTIONS.preferredContact },
      { key: "companyEmail", label: "Company Email", type: "email" },
      { key: "personalEmail", label: "Personal Email", type: "email" },
      { key: "userId", label: "User ID", type: "email" },
      { key: "createUser", label: "Create User Automatically", type: "check" },
      { key: "unsubscribed", label: "Unsubscribed From System Emails", type: "check" },
    ],
  },
  {
    title: "Address",
    fields: [
      { key: "permanentAddressIs", label: "Permanent Address Is", type: "select", options: OPTIONS.addressIs },
      { key: "permanentAddress", label: "Permanent Address", type: "textarea", full: true },
      { key: "currentAddressIs", label: "Current Address Is", type: "select", options: OPTIONS.addressIs },
      { key: "currentAddress", label: "Current Address", type: "textarea", full: true },
    ],
  },
  {
    title: "Emergency Contact",
    fields: [
      { key: "emergencyPhone", label: "Emergency Phone", type: "tel" },
      { key: "emergencyContactName", label: "Emergency Contact Name", type: "text" },
      { key: "relation", label: "Relation", type: "text" },
    ],
  },
  {
    title: "Background & Health",
    fields: [
      { key: "maritalStatus", label: "Marital Status", type: "select", options: OPTIONS.marital },
      { key: "bloodGroup", label: "Blood Group", type: "select", options: OPTIONS.blood },
      { key: "passportNumber", label: "Passport Number", type: "text" },
      { key: "passportDateOfIssue", label: "Date of Issue", type: "date" },
      { key: "passportValidUpto", label: "Valid Up To", type: "date" },
      { key: "placeOfIssue", label: "Place of Issue", type: "text" },
      { key: "familyBackground", label: "Family Background", type: "textarea", full: true },
      { key: "healthDetails", label: "Health Details", type: "textarea", full: true },
      { key: "bio", label: "Bio / Cover Letter", type: "textarea", full: true },
    ],
  },
];

// Required fields for submit validation (mirrors the doctype's reqd flags).
const REQUIRED: { key: string; label: string }[] = [
  { key: "firstName", label: "First Name" },
  { key: "company", label: "Company" },
  { key: "status", label: "Status" },
  { key: "gender", label: "Gender" },
  { key: "dob", label: "Date of Birth" },
  { key: "dateOfJoining", label: "Date of Joining" },
];

export default function NewEmployeePage() {
  const router = useRouter();
  const [v, setV] = useState<Record<string, string>>({
    series: "HR-EMP-",
    status: "Active",
    salaryMode: "Bank",
    salaryCurrency: "USD",
  });
  const set = (k: string, val: string) => setV((prev) => ({ ...prev, [k]: val }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const missing = REQUIRED.filter((r) => !v[r.key]?.trim()).map((r) => r.label);
    if (missing.length) {
      toast.error(`Missing required: ${missing.join(", ")}`);
      return;
    }
    const name = [v.salutation, v.firstName, v.lastName].filter(Boolean).join(" ") || v.employeeName;
    toast.success(`${name} added to ${v.company ?? "the company"}`);
    router.push("/employees");
  };

  const renderField = (f: FieldDef) => {
    const id = f.key;
    const label = (
      <Label htmlFor={id} className={f.req ? "after:content-['*'] after:ml-0.5 after:text-destructive" : undefined}>
        {f.label}
      </Label>
    );
    if (f.type === "check") {
      return (
        <div key={id} className="flex items-center gap-2 pt-6">
          <Checkbox
            id={id}
            checked={v[id] === "true"}
            onCheckedChange={(c) => set(id, c === true ? "true" : "false")}
          />
          <label htmlFor={id} className="text-sm leading-none">{f.label}</label>
        </div>
      );
    }
    if (f.type === "select") {
      return (
        <div key={id} className={f.full ? "sm:col-span-2 space-y-2" : "space-y-2"}>
          {label}
          <SearchSelect
            id={id}
            value={v[id] ?? ""}
            onChange={(val) => set(id, val)}
            options={f.options ?? []}
            placeholder={`Search ${f.label.toLowerCase()}\u2026`}
            addLabel={LINK_DOCTYPE[f.key]}
          />
        </div>
      );
    }
    if (f.type === "textarea") {
      return (
        <div key={id} className={f.full ? "sm:col-span-2 space-y-2" : "space-y-2"}>
          {label}
          <Textarea id={id} rows={2} value={v[id] ?? ""} onChange={(ev) => set(id, ev.target.value)} placeholder={f.placeholder} />
        </div>
      );
    }
    return (
      <div key={id} className={f.full ? "sm:col-span-2 space-y-2" : "space-y-2"}>
        {label}
        <Input
          id={id}
          type={f.type}
          value={v[id] ?? ""}
          min={f.type === "number" ? "0" : undefined}
          step={f.type === "number" ? "any" : undefined}
          onChange={(ev) => set(id, ev.target.value)}
          placeholder={f.placeholder}
        />
      </div>
    );
  };

  return (
    <>
      <Button variant="ghost" size="sm" className="-ml-2 w-fit" render={<Link href="/employees" />}>
        <ArrowLeft /> Back to Employees
      </Button>
      <PageHeader title="New Employee" description="Create an employee record — fields mirror the Frappe HR Employee form." />

      <form className="space-y-6" onSubmit={submit}>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Profile Image</CardTitle>
            <CardDescription>Optional photo shown across the app.</CardDescription>
          </CardHeader>
          <CardContent>
            <Input type="file" accept="image/*" className="max-w-md" />
          </CardContent>
        </Card>

        {SECTIONS.map((s) => (
          <Card key={s.title}>
            <CardHeader>
              <CardTitle className="text-base">{s.title}</CardTitle>
              {s.desc && <CardDescription>{s.desc}</CardDescription>}
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{s.fields.map(renderField)}</div>
            </CardContent>
          </Card>
        ))}

        <ChildTable title="Educational Qualification" desc="Add degrees and certifications." columns={["Qualification", "Specialisation / Course", "Institution", "From Date", "To Date"]} />
        <ChildTable title="Previous Work Experience" desc="External employment history." columns={["Company", "Designation", "From Date", "To Date"]} />
        <ChildTable title="Work History In Company" desc="Internal department / designation changes." columns={["Department", "Designation", "Grade", "From Date", "To Date"]} />

        <div className="flex justify-end gap-2 pb-8">
          <Button type="button" variant="outline" render={<Link href="/employees" />}>Cancel</Button>
          <Button type="submit">Create Employee</Button>
        </div>
      </form>
    </>
  );
}

// Repeatable child-table (mirrors Frappe's Education / Employment History grids).
function ChildTable({ title, desc, columns }: { title: string; desc?: string; columns: string[] }) {
  const [rows, setRows] = useState<Record<string, string>[]>([]);
  const addRow = () => setRows((r) => [...r, Object.fromEntries(columns.map((c) => [c, ""]))]);
  const removeRow = (i: number) => setRows((r) => r.filter((_, x) => x !== i));
  const setCell = (i: number, c: string, val: string) => setRows((r) => r.map((row, x) => (x === i ? { ...row, [c]: val } : row)));

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between gap-4">
        <div>
          <CardTitle className="text-base">{title}</CardTitle>
          {desc && <CardDescription>{desc}</CardDescription>}
        </div>
        <Button type="button" variant="outline" size="sm" onClick={addRow}>
          <Plus /> Add Row
        </Button>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">No entries yet.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8">#</TableHead>
                {columns.map((c) => (
                  <TableHead key={c}>{c}</TableHead>
                ))}
                <TableHead className="w-8" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row, i) => (
                <TableRow key={i}>
                  <TableCell className="text-muted-foreground">{i + 1}</TableCell>
                  {columns.map((c) => (
                    <TableCell key={c}>
                      <Input
                        value={row[c] ?? ""}
                        type={c.includes("Date") ? "date" : "text"}
                        onChange={(e) => setCell(i, c, e.target.value)}
                      />
                    </TableCell>
                  ))}
                  <TableCell>
                    <Button type="button" variant="ghost" size="icon" className="size-8" onClick={() => removeRow(i)}>
                      <Trash2 />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
