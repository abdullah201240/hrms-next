import type { SalarySlipPrint, LeavePrint, ExpensePrint, EmployeePrint, GenericPrint } from "@/lib/print/print";
import {
  SalarySlipStandard,
  SalarySlipClassic,
  SalarySlipCompact,
  SalarySlipDetailed,
  SalarySlipYtd,
  SalarySlipTimesheet,
} from "@/components/shared/print/salary-slip-formats";
import {
  LeaveApplicationStandard,
  ExpenseClaimStandard,
  EmployeeStandard,
  GenericStandard,
} from "@/components/shared/print/document-formats";

/**
 * Print Format registry — the hrms-next equivalent of Frappe's `Print Format`
 * doctype: each document ("Print Format For: DocType") lists its built-in
 * formats, one of which is the default. Names mirror the Frappe HR standards.
 */
export type PrintFormat = {
  name: string;
  isDefault?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  render: (data: any) => React.ReactNode;
};

const SALARY_SLIP_FORMATS: PrintFormat[] = [
  { name: "Salary Slip Standard", isDefault: true, render: (d: SalarySlipPrint) => <SalarySlipStandard data={d} /> },
  { name: "Salary Slip Classic", render: (d: SalarySlipPrint) => <SalarySlipClassic data={d} /> },
  { name: "Salary Slip Compact", render: (d: SalarySlipPrint) => <SalarySlipCompact data={d} /> },
  { name: "Salary Slip Detailed", render: (d: SalarySlipPrint) => <SalarySlipDetailed data={d} /> },
  { name: "Salary Slip With Year To Date", render: (d: SalarySlipPrint) => <SalarySlipYtd data={d} /> },
  { name: "Salary Slip Based On Timesheet", render: (d: SalarySlipPrint) => <SalarySlipTimesheet data={d} /> },
];

const REGISTRY: Record<string, PrintFormat[]> = {
  "Salary Slip": SALARY_SLIP_FORMATS,
  "Leave Application": [{ name: "Standard", isDefault: true, render: (d: LeavePrint) => <LeaveApplicationStandard data={d} /> }],
  "Expense Claim": [{ name: "Standard", isDefault: true, render: (d: ExpensePrint) => <ExpenseClaimStandard data={d} /> }],
  Employee: [{ name: "Standard", isDefault: true, render: (d: EmployeePrint) => <EmployeeStandard data={d} /> }],
};

export function formatsFor(doctype: string): PrintFormat[] {
  return REGISTRY[doctype] ?? [{ name: "Standard", isDefault: true, render: (d: GenericPrint) => <GenericStandard data={d} /> }];
}

export function defaultFormat(doctype: string): PrintFormat {
  const fs = formatsFor(doctype);
  return fs.find((f) => f.isDefault) ?? fs[0];
}
