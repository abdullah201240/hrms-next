// Generates the gap-closing admin list pages (data-4). Run: node scripts/gen-pages-gap.mjs
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const ROOT = join(process.cwd(), "src/app/(app)");

function col(c) {
  const parts = [`key: "${c.key}"`, `header: "${c.header}"`];
  if (c.sortable) parts.push("sortable: true");
  if (c.align) parts.push(`align: "${c.align}"`);
  if (c.hide) parts.push(`className: "hidden lg:table-cell"`);
  let cell = "";
  if (c.render === "bold") cell = `, cell: (x) => <span className="font-medium">{x.${c.key}}</span>`;
  else if (c.render === "status") cell = `, cell: (x) => <StatusBadge status={x.${c.key}} />`;
  else if (c.render === "money") cell = `, cell: (x) => <span className="tabular-nums font-medium">{fmtMoney(x.${c.key})}</span>`;
  else if (c.render === "date") cell = `, cell: (x) => fmtDate(x.${c.key})`;
  else if (c.render === "bool") cell = `, cell: (x) => <Badge variant={x.${c.key} ? "secondary" : "outline"}>{x.${c.key} ? "Yes" : "No"}</Badge>`;
  else if (c.render === "muted") cell = `, cell: (x) => <span className="text-muted-foreground">{x.${c.key}}</span>`;
  else if (c.render === "pct") cell = `, cell: (x) => <span className="tabular-nums">{x.${c.key}}%</span>`;
  return `  { ${parts.join(", ")}${cell} },`;
}

function page(spec) {
  const uses = { status: false, bool: false, date: false, money: false };
  for (const c of spec.cols) {
    if (c.render === "status") uses.status = true;
    if (c.render === "bool") uses.bool = true;
    if (c.render === "date") uses.date = true;
    if (c.render === "money") uses.money = true;
  }
  const helpers = [uses.date && "fmtDate", uses.money && "fmtMoney"].filter(Boolean);
  const imports = [
    `"use client"`,
    ``,
    `import { PageHeader } from "@/components/shared/page-header"`,
    `import { DataTable, type Column } from "@/components/shared/data-table"`,
    uses.status && `import { StatusBadge } from "@/components/shared/status-badge"`,
    uses.bool && `import { Badge } from "@/components/ui/badge"`,
    `import { ${spec.rows}, type ${spec.type} } from "@/lib/mock/${spec.mod}"`,
    helpers.length && `import { ${helpers.join(", ")} } from "@/lib/mock/data"`,
  ].filter(Boolean);
  const body = `${imports.join("\n")};

const columns: Column<${spec.type}>[] = [
${spec.cols.map(col).join("\n")}
];

export default function ${spec.component}() {
  return (
    <>
      <PageHeader title="${spec.title}" description="${spec.desc}" />
      <DataTable columns={columns} rows={${spec.rows}} searchKeys={[${spec.search.map((s) => `"${s}"`).join(", ")}]} pageSize={10} />
    </>
  );
}
`;
  const file = join(ROOT, spec.route, "page.tsx");
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, body);
  return spec.route;
}

const specs = [
  { route: "leave/ledger", component: "LeaveLedgerPage", title: "Leave Ledger Entry", desc: "Running record of every leave credit and debit.", mod: "data-4", rows: "leaveLedgerEntries", type: "LeaveLedgerEntry", search: ["employee", "leaveType"], cols: [
    { key: "employee", header: "Employee", render: "bold", sortable: true },
    { key: "leaveType", header: "Leave Type" },
    { key: "transactionType", header: "Transaction" },
    { key: "leaves", header: "Leaves", align: "center", sortable: true },
    { key: "ledgerFrom", header: "From", render: "date", hide: true },
    { key: "isCredit", header: "Credit", render: "bool", align: "center" } ] },
  { route: "leave/adjustment", component: "LeaveAdjustmentPage", title: "Leave Adjustment", desc: "Manual corrections to a leave balance.", mod: "data-4", rows: "leaveAdjustments", type: "LeaveAdjustment", search: ["employee", "remarks"], cols: [
    { key: "employee", header: "Employee", render: "bold", sortable: true },
    { key: "leaveType", header: "Leave Type" },
    { key: "adjustmentDate", header: "Date", render: "date", sortable: true },
    { key: "leavesAdjustded", header: "Leaves", align: "center", sortable: true },
    { key: "remarks", header: "Remarks", render: "muted" },
    { key: "docStatus", header: "Status", render: "status" } ] },
  { route: "leave/earned-leave-schedule", component: "EarnedLeaveSchedulePage", title: "Earned Leave Schedule", desc: "Accrual schedule for earned leave.", mod: "data-4", rows: "earnedLeaveSchedules", type: "EarnedLeaveSchedule", search: ["employee", "leaveType"], cols: [
    { key: "employee", header: "Employee", render: "bold", sortable: true },
    { key: "leaveType", header: "Leave Type" },
    { key: "accrualFrequency", header: "Frequency", align: "center" },
    { key: "nextAccrualDate", header: "Next Accrual", render: "date", sortable: true },
    { key: "totalLeavesEarned", header: "Earned", align: "center", sortable: true } ] },
  { route: "employment-types", component: "EmploymentTypesPage", title: "Employment Types", desc: "Classifications of employment.", mod: "data-4", rows: "employmentTypes", type: "EmploymentType", search: ["name", "description"], cols: [
    { key: "name", header: "Type", render: "bold", sortable: true },
    { key: "description", header: "Description", render: "muted" } ] },
  { route: "tenure/training-records", component: "EmployeeTrainingPage", title: "Employee Training", desc: "Training history per employee.", mod: "data-4", rows: "employeeTrainings", type: "EmployeeTraining", search: ["employee", "trainingProgram"], cols: [
    { key: "employee", header: "Employee", render: "bold", sortable: true },
    { key: "trainingProgram", header: "Program" },
    { key: "level", header: "Level", align: "center" },
    { key: "trainerName", header: "Trainer", render: "muted", hide: true },
    { key: "score", header: "Score", align: "center", sortable: true },
    { key: "status", header: "Status", render: "status" } ] },
  { route: "tenure/skills", component: "EmployeeSkillsPage", title: "Employee Skills", desc: "Skill records and proficiency.", mod: "data-4", rows: "employeeSkills", type: "EmployeeSkill", search: ["employee", "skill"], cols: [
    { key: "employee", header: "Employee", render: "bold", sortable: true },
    { key: "skill", header: "Skill" },
    { key: "proficiency", header: "Proficiency", align: "center", sortable: true },
    { key: "assessmentCount", header: "Assessments", align: "center", sortable: true } ] },
  { route: "tax-benefits/health-insurance", component: "HealthInsurancePage", title: "Employee Health Insurance", desc: "Health insurance policy records.", mod: "data-4", rows: "employeeHealthInsurances", type: "EmployeeHealthInsurance", search: ["policyNo", "employee"], cols: [
    { key: "policyNo", header: "Policy", render: "bold", sortable: true },
    { key: "employee", header: "Employee" },
    { key: "insuranceProvider", header: "Provider" },
    { key: "planType", header: "Plan", render: "muted", hide: true },
    { key: "from", header: "From", render: "date" },
    { key: "to", header: "To", render: "date" },
    { key: "status", header: "Status", render: "status" } ] },
  { route: "attendance/daily-work-summary", component: "DailyWorkSummaryPage", title: "Daily Work Summary Group", desc: "Automated end-of-day work digests.", mod: "data-4", rows: "dailyWorkSummaries", type: "DailyWorkSummary", search: ["name", "group"], cols: [
    { key: "name", header: "Summary", render: "bold", sortable: true },
    { key: "template", header: "Template" },
    { key: "group", header: "Group" },
    { key: "recipients", header: "Recipients", align: "center", sortable: true },
    { key: "enabled", header: "Enabled", render: "bool", align: "center" } ] },
  { route: "payroll/arrears", component: "ArrearsPage", title: "Arrears", desc: "Salary arrears paid to employees.", mod: "data-4", rows: "arrears", type: "Arrear", search: ["employee", "payrollPeriod"], cols: [
    { key: "employee", header: "Employee", render: "bold", sortable: true },
    { key: "payrollPeriod", header: "Payroll Period" },
    { key: "fromMonth", header: "From", render: "date", hide: true },
    { key: "toMonth", header: "To", render: "date", hide: true },
    { key: "totalArrearAmount", header: "Amount", render: "money", align: "right", sortable: true },
    { key: "submitted", header: "Submitted", render: "bool", align: "center" } ] },
  { route: "payroll/correction", component: "PayrollCorrectionPage", title: "Payroll Correction", desc: "Corrections against a payroll entry.", mod: "data-4", rows: "payrollCorrections", type: "PayrollCorrection", search: ["employee", "payrollEntry"], cols: [
    { key: "employee", header: "Employee", render: "bold", sortable: true },
    { key: "payrollEntry", header: "Payroll Entry" },
    { key: "month", header: "Month", align: "center" },
    { key: "submitted", header: "Submitted", render: "bool", align: "center" } ] },
  { route: "payroll/other-income", component: "OtherIncomePage", title: "Employee Other Income", desc: "Additional income taxed with salary.", mod: "data-4", rows: "employeeOtherIncomes", type: "EmployeeOtherIncome", search: ["employee", "incomeType"], cols: [
    { key: "employee", header: "Employee", render: "bold", sortable: true },
    { key: "incomeType", header: "Income Type" },
    { key: "payStructureComponent", header: "Component", render: "muted", hide: true },
    { key: "amount", header: "Amount", render: "money", align: "right", sortable: true },
    { key: "note", header: "Note", render: "muted" } ] },
  { route: "payroll/taxable-slabs", component: "TaxableSalarySlabsPage", title: "Taxable Salary Slabs", desc: "Slab-wise taxable breakdown per slip.", mod: "data-4", rows: "taxableSalarySlabs", type: "TaxableSalarySlab", search: ["salarySlip", "employee"], cols: [
    { key: "salarySlip", header: "Salary Slip", render: "bold", sortable: true },
    { key: "employee", header: "Employee" },
    { key: "fromAmount", header: "From", render: "money", align: "right" },
    { key: "toAmount", header: "To", render: "money", align: "right" },
    { key: "percentDeducted", header: "Rate", align: "center", render: "pct" } ] },
  { route: "tax-benefits/benefit-ledger", component: "BenefitLedgerPage", title: "Employee Benefit Ledger", desc: "Benefit eligibility, sanction & utilization.", mod: "data-4", rows: "employeeBenefitLedgers", type: "EmployeeBenefitLedger", search: ["employee", "benefitApplication"], cols: [
    { key: "employee", header: "Employee", render: "bold", sortable: true },
    { key: "benefitApplication", header: "Application" },
    { key: "amountEligible", header: "Eligible", render: "money", align: "right", sortable: true },
    { key: "amountSanctioned", header: "Sanctioned", render: "money", align: "right", sortable: true },
    { key: "amountUtilized", header: "Utilized", render: "money", align: "right", sortable: true } ] },
  { route: "payroll/withholding-cycles", component: "WithholdingCyclesPage", title: "Salary Withholding Cycle", desc: "Grouped withholding periods.", mod: "data-4", rows: "salaryWithholdingCycles", type: "SalaryWithholdingCycle", search: ["employee"], cols: [
    { key: "employee", header: "Employee", render: "bold", sortable: true },
    { key: "fromDate", header: "From", render: "date" },
    { key: "toDate", header: "To", render: "date" },
    { key: "withholdingAmount", header: "Withheld", render: "money", align: "right", sortable: true },
    { key: "receivedAmount", header: "Received", render: "money", align: "right", sortable: true },
    { key: "status", header: "Status", render: "status" } ] },
  { route: "expenses/full-and-final", component: "FullAndFinalPage", title: "Full and Final Statement", desc: "Final settlement for exiting employees.", mod: "data-4", rows: "fullAndFinalStatements", type: "FullAndFinalStatement", search: ["employee"], cols: [
    { key: "employee", header: "Employee", render: "bold", sortable: true },
    { key: "payrollDate", header: "Payroll Date", render: "date", sortable: true },
    { key: "unsalariedAmount", header: "Unsalaried", render: "money", align: "right", hide: true },
    { key: "salaryPayout", header: "Salary", render: "money", align: "right", sortable: true },
    { key: "totalAmount", header: "Total", render: "money", align: "right", sortable: true },
    { key: "status", header: "Status", render: "status" } ] },
  { route: "expenses/vehicle-service", component: "VehicleServicePage", title: "Vehicle Service", desc: "Company vehicle service records.", mod: "data-4", rows: "vehicleServices", type: "VehicleService", search: ["licensePlate", "employee"], cols: [
    { key: "licensePlate", header: "Vehicle", render: "bold", sortable: true },
    { key: "employee", header: "Requested By" },
    { key: "serviceDate", header: "Service Date", render: "date", sortable: true },
    { key: "type", header: "Type" },
    { key: "invoiceNo", header: "Invoice", render: "muted", hide: true },
    { key: "amount", header: "Amount", render: "money", align: "right", sortable: true },
    { key: "status", header: "Status", render: "status" } ] },
];

const made = specs.map(page);
console.log(`Generated ${made.length} gap pages:`);
made.forEach((r) => console.log("  " + r));
