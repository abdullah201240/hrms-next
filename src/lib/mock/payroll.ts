// ============================================================================
// Payroll — simplified, international, mock-only model.
//
// The whole payroll flow collapses to three steps with ONE data model:
//   1. Salary Template  -> reusable earnings + deductions recipe.
//   2. Assign Salary     -> bind a template to an employee with a monthly Basic.
//   3. Make Salary       -> compute payslips from template + assignment.
//
// Every template line is either a fixed monthly amount OR a percentage of the
// employee's Basic Salary, so a package stays "fully adjustable" without any
// formula scripting. No tax, no multi-currency (site standard is BDT / ৳).
//
// This is a UI-only layer (no DB yet, like the rest of hrms-next). Payslips are
// derived live from assignments, so "generate payroll" always reflects current
// templates and assignments with zero manual bookkeeping.
// ============================================================================
import { company, employees, fmtMoney } from "./data";

/** A line is either a flat monthly amount or a percentage of the employee Basic. */
export type PayMode = "Fixed" | "Percent";
export type LineKind = "Earning" | "Deduction";

export interface TemplateLine {
  name: string;
  mode: PayMode;
  /** Fixed => monthly amount (BDT). Percent => percentage (0-100) of Basic. */
  value: number;
}

export interface SalaryTemplate {
  id: string;
  name: string;
  description: string;
  active: boolean;
  earnings: TemplateLine[];
  deductions: TemplateLine[];
}

/** Reusable compensation recipes. Basic Salary is always paid on top. */
export const salaryTemplates: SalaryTemplate[] = [
  {
    id: "tpl-standard",
    name: "Standard Package",
    description: "Typical office role — allowances as a share of basic, PF + insurance deducted.",
    active: true,
    earnings: [
      { name: "House Rent Allowance", mode: "Percent", value: 40 },
      { name: "Medical Allowance", mode: "Percent", value: 10 },
      { name: "Conveyance Allowance", mode: "Fixed", value: 3000 },
      { name: "Special Allowance", mode: "Percent", value: 20 },
    ],
    deductions: [
      { name: "Provident Fund", mode: "Percent", value: 12 },
      { name: "Health Insurance", mode: "Fixed", value: 1000 },
    ],
  },
  {
    id: "tpl-sales",
    name: "Sales Package",
    description: "Field sales role with a fixed commission and lighter housing share.",
    active: true,
    earnings: [
      { name: "House Rent Allowance", mode: "Percent", value: 35 },
      { name: "Commission", mode: "Fixed", value: 5000 },
      { name: "Special Allowance", mode: "Percent", value: 15 },
    ],
    deductions: [
      { name: "Provident Fund", mode: "Percent", value: 10 },
      { name: "Transport Fund", mode: "Fixed", value: 500 },
    ],
  },
  {
    id: "tpl-executive",
    name: "Executive Package",
    description: "Senior role with a car allowance and higher housing share.",
    active: true,
    earnings: [
      { name: "House Rent Allowance", mode: "Percent", value: 50 },
      { name: "Car Allowance", mode: "Fixed", value: 15000 },
      { name: "Special Allowance", mode: "Percent", value: 25 },
    ],
    deductions: [
      { name: "Provident Fund", mode: "Percent", value: 12 },
      { name: "Health Insurance", mode: "Fixed", value: 2500 },
    ],
  },
];

export const templateById = (id: string): SalaryTemplate | undefined =>
  salaryTemplates.find((t) => t.id === id);

/** Resolve one template line into a monthly amount for a given basic. */
export const lineAmount = (l: TemplateLine, basic: number): number =>
  Math.round(l.mode === "Fixed" ? l.value : (basic * l.value) / 100);

export interface SalaryAssignment {
  id: string;
  employee: string;
  employeeId: string;
  department: string;
  designation: string;
  templateId: string;
  /** Monthly Basic Salary — the base every Percent line is calculated on. */
  basic: number;
  effectiveFrom: string;
  status: "Active" | "Inactive";
}

/** Seed one assignment per (non-inactive) employee, cycling through templates. */
export const salaryAssignments: SalaryAssignment[] = employees
  .filter((e) => e.status !== "Inactive")
  .slice(0, 10)
  .map((e, i) => {
    const tpl = salaryTemplates[i % salaryTemplates.length];
    return {
      id: `as${i + 1}`,
      employee: e.name,
      employeeId: e.employeeId,
      department: e.department,
      designation: e.designation,
      templateId: tpl.id,
      basic: e.baseSalary > 0 ? Math.round(e.baseSalary) : 50000,
      effectiveFrom: "2026-01-01",
      status: "Active" as const,
    };
  });

export interface SlipLine {
  label: string;
  amount: number;
}

export interface PaySlip {
  id: string;
  slipNo: string;
  employee: string;
  employeeId: string;
  department: string;
  designation: string;
  templateName: string;
  month: string;
  basic: number;
  earnings: SlipLine[];
  deductions: SlipLine[];
  gross: number;
  totalDeduction: number;
  net: number;
  status: "Draft" | "Published";
}

/** Months offered in the payroll selectors. */
export const PAYROLL_MONTHS = [
  "September 2026",
  "October 2026",
  "November 2026",
  "December 2026",
];
export const DEFAULT_PAYROLL_MONTH = PAYROLL_MONTHS[0];

/** Compute a single, fully itemised payslip from an assignment + its template. */
export function computePaySlip(
  a: SalaryAssignment,
  month: string,
  status: "Draft" | "Published" = "Draft",
): PaySlip {
  const tpl = templateById(a.templateId);
  const earnings: SlipLine[] = [{ label: "Basic Salary", amount: a.basic }];
  const deductions: SlipLine[] = [];
  if (tpl) {
    for (const l of tpl.earnings) earnings.push({ label: l.name, amount: lineAmount(l, a.basic) });
    for (const l of tpl.deductions) deductions.push({ label: l.name, amount: lineAmount(l, a.basic) });
  }
  const gross = earnings.reduce((s, x) => s + x.amount, 0);
  const totalDeduction = deductions.reduce((s, x) => s + x.amount, 0);
  const year = month.split(" ")[1] ?? "";
  const seq = String(Number(a.id.replace(/\D/g, "")) || 0).padStart(3, "0");
  return {
    id: `${a.id}-${month}`,
    slipNo: `SAL-${company.abbreviation.toUpperCase()}-${year}-${seq}`,
    employee: a.employee,
    employeeId: a.employeeId,
    department: a.department,
    designation: a.designation,
    templateName: tpl?.name ?? "—",
    month,
    basic: a.basic,
    earnings,
    deductions,
    gross,
    totalDeduction,
    net: gross - totalDeduction,
    status,
  };
}

/** Generate the payslips for everyone with an active assignment in a month. */
export function generatePayroll(
  month: string,
  opts: { status?: "Draft" | "Published"; department?: string } = {},
): PaySlip[] {
  const status = opts.status ?? "Draft";
  return salaryAssignments
    .filter((a) => a.status === "Active")
    .filter((a) => !opts.department || opts.department === "All Departments" || a.department === opts.department)
    .map((a) => computePaySlip(a, month, status));
}

/** Quick monthly gross/net preview for a template assuming a sample basic. */
export function previewTemplate(tpl: SalaryTemplate, basic: number): { gross: number; net: number } {
  const earnings = basic + tpl.earnings.reduce((s, l) => s + lineAmount(l, basic), 0);
  const deduction = tpl.deductions.reduce((s, l) => s + lineAmount(l, basic), 0);
  return { gross: earnings, net: earnings - deduction };
}

export { fmtMoney };
