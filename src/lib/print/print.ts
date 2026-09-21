import { company, employees, type SalarySlip, type LeaveApplication, type ExpenseClaim } from "@/lib/mock/data";

/**
 * Print data layer — mirrors the reference Frappe HR print subsystem
 * (hrms/payroll/print_format/*, hrms/hr/print_format/* and the standard
 * print view every doctype gets). A printable payload is built from a row
 * and consumed by a registered Print Format component.
 */

export type Money = { label: string; amount: number };

export type SalarySlipPrint = {
  doctype: "Salary Slip";
  name: string; // e.g. SALADJ-2026-00003
  slip: SalarySlip;
  employeeName: string;
  employeeId: string;
  department: string;
  designation: string;
  branch: string;
  company: string;
  startDate: string;
  endDate: string;
  drawingDate: string;
  bankName: string;
  accountNo: string;
  workingDays: number;
  lwp: number;
  paymentDays: number;
  earnings: Money[];
  deductions: Money[];
  gross: number;
  totalDeduction: number;
  net: number;
  rounded: number;
  inWords: string;
  ytd?: { earnings: Money[]; deductions: Money[]; gross: number; deduction: number; net: number };
  timeSheetBased?: boolean;
};

export type LeavePrint = {
  doctype: "Leave Application";
  name: string;
  app: LeaveApplication;
  company: string;
};

export type ExpensePrint = {
  doctype: "Expense Claim";
  name: string;
  claim: ExpenseClaim;
  company: string;
};

export type EmployeePrint = {
  doctype: "Employee";
  name: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  row: any;
  company: string;
};

/* eslint-disable @typescript-eslint/no-explicit-any */
export type GenericPrint = { doctype: string; name: string; title: string; row: any; extra?: [string, string][]; company: string; /** Human doctype label for the sheet header (doctype stays the route key for registry lookup). */ label?: string };

export type Printable =
  | SalarySlipPrint
  | LeavePrint
  | ExpensePrint
  | EmployeePrint
  | GenericPrint;

/** month "September 2026" → { start, end, drawing } ISO dates. */
function monthRange(month: string): { start: string; end: string; drawing: string } {
  const [m, y] = month.split(" ");
  const dt = new Date(`${m} 1, ${y}`);
  const end = new Date(dt.getFullYear(), dt.getMonth() + 1, 0);
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  return { start: iso(dt), end: iso(end), drawing: iso(new Date(end.getFullYear(), end.getMonth(), 28)) };
}

/** Split a total into realistic salary components (last item absorbs rounding drift). */
function split(total: number, ratios: [string, number][]): Money[] {
  let rest = total;
  const rows: Money[] = [];
  ratios.forEach(([label, r], i) => {
    const amt = i === ratios.length - 1 ? rest : Math.round((total * r) / 10) / 10 * 10;
    rest -= amt;
    rows.push({ label, amount: amt });
  });
  return rows;
}

/** Build the printable payload for a salary-slip row (component split mirrors Frappe HR structures). */
export function salarySlipPrint(slip: SalarySlip, opts: { ytd?: boolean; timesheet?: boolean } = {}): SalarySlipPrint {
  const emp = employees.find((e) => e.id === slip.employeeId);
  const { start, end, drawing } = monthRange(slip.month);
  const earnings = split(slip.gross, [
    ["Basic Salary", 0.5],
    ["House Rent Allowance", 0.25],
    ["Conveyance Allowance", 0.06],
    ["Medical Allowance", 0.09],
    ["Special Allowance", 0.10],
  ]);
  const deductions = split(slip.deductions, [
    ["Provident Fund", 0.1],
    ["Income Tax", 0.6],
    ["Social Security", 0.15],
    ["Health Insurance", 0.15],
  ]).map((d, i) => (i === 0 ? { ...d, label: "Provident Fund" } : d));
  const rounded = Math.round(slip.net / 10) * 10;
  const seq = slip.id.replace(/\D/g, "").padStart(3, "0");
  const year = slip.month.split(" ")[1];
  const workingDays = 26;
  return {
    doctype: "Salary Slip",
    name: `SAL-${company.abbreviation.toUpperCase()}-${year}-${seq}`,
    slip,
    employeeName: slip.employeeName,
    employeeId: slip.employeeId,
    department: emp?.department ?? "—",
    designation: emp?.designation ?? "—",
    branch: emp?.workLocation ?? "—",
    company: company.name,
    startDate: start,
    endDate: end,
    drawingDate: drawing,
    bankName: "Dutch-Bangla Bank PLC",
    accountNo: `1${slip.employeeId.slice(-3)}78${seq}4021`,
    workingDays,
    lwp: 0,
    paymentDays: workingDays,
    earnings,
    deductions,
    gross: slip.gross,
    totalDeduction: slip.deductions,
    net: slip.net,
    rounded,
    inWords: amountInWords(rounded),
    ytd: opts.ytd
      ? {
          earnings: earnings.map((e) => ({ label: e.label, amount: e.amount * 6 })),
          deductions: deductions.map((d) => ({ label: d.label, amount: d.amount * 6 })),
          gross: slip.gross * 6,
          deduction: slip.deductions * 6,
          net: slip.net * 6,
        }
      : undefined,
    timeSheetBased: opts.timesheet,
  };
}

export function leavePrint(app: LeaveApplication): LeavePrint {
  return { doctype: "Leave Application", name: `ADV-${company.abbreviation.toUpperCase()}-${String(2000 + Number(app.id.replace(/\D/g, "") || 1)).slice(-4)}`, app, company: company.name };
}

export function expensePrint(claim: ExpenseClaim): ExpensePrint {
  return { doctype: "Expense Claim", name: claim.claimId, claim, company: company.name };
}

/** Deterministic amount-in-words, South-Asian numbering like Frappe's BDT renderer. */
export function amountInWords(n: number): string {
  const ones = ["Zero", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  const two = (v: number): string => (v < 20 ? ones[v] : tens[Math.floor(v / 10)] + (v % 10 ? " " + ones[v % 10] : ""));
  const grp = (v: number): string => {
    const parts: string[] = [];
    if (v > 99) parts.push(`${ones[Math.floor(v / 100)]} Hundred`);
    if (v % 100) parts.push(two(v % 100));
    return parts.join(" ");
  };
  const whole = Math.floor(n);
  const paise = Math.round((n - whole) * 100);
  const parts: string[] = [];
  const crore = Math.floor(whole / 10000000);
  const lakh = Math.floor((whole % 10000000) / 100000);
  const thousand = Math.floor((whole % 100000) / 1000);
  const rest = whole % 1000;
  if (crore) parts.push(`${grp(crore)} Crore`);
  if (lakh) parts.push(`${grp(lakh)} Lakh`);
  if (thousand) parts.push(`${grp(thousand)} Thousand`);
  if (rest || !parts.length) parts.push(grp(rest));
  let s = `Taka ${parts.join(" ")}`;
  if (paise) s += ` and ${two(paise)} Paise`;
  return s + " Only";
}
