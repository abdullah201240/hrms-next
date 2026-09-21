import type { DoctypeConfig } from "@/lib/crud/types";
import {
  company,
  employees,
  leaveTypes,
  departments,
  designations,
  jobOpenings,
  goals,
} from "@/lib/mock/data";
import {
  holidayLists,
  leavePeriods,
  leavePolicies,
  leavePolicyAssignments,
  leaveAllocations,
  leaveEncashments,
  leaveBlockLists,
  salaryComponents,
  branches,
} from "@/lib/mock/data-2";
import {
  leaveLedgerEntries,
  leaveAdjustments,
  earnedLeaveSchedules,
  holidayListAssignments,
  employmentTypes,
} from "@/lib/mock/data-4";
import { AUTO_CONFIGS } from "@/lib/crud/registry.auto";

/* Option helpers pulled from the mock masters (link-field dropdown sources). */
const employeeNames = employees.map((e) => e.name);
const leaveTypeNames = leaveTypes.map((t) => t.name);
const holidayListNames = holidayLists.map((h) => h.name);
const periodNames = leavePeriods.map((p) => p.name);
const policyNames = leavePolicies.map((p) => p.name);
const componentNames = salaryComponents.map((c) => c.name);
const companyNames = [company.name];
const departmentNames = departments.map((d) => d.name);
const designationNames = designations.map((d) => d.name);
const branchNames = branches.map((b) => b.name);
const employmentTypeNames = employmentTypes.map((t) => t.name);
const DOC_STATUS = ["Draft", "Submitted"] as const;

const CONFIGS: DoctypeConfig[] = [
  {
    route: "/leave/types",
    label: "Leave Type",
    plural: "Leave Types",
    desc: "Configurable leave categories and their rules.",
    rows: leaveTypes,
    titleKey: "name",
    searchKeys: ["name", "code"],
    columns: [
      { key: "name", header: "Leave Type", sortable: true },
      { key: "code", header: "Code" },
      { key: "maxDays", header: "Max Days", align: "right", sortable: true },
      { key: "paid", header: "Paid", align: "center" },
      { key: "carryForward", header: "Carry Forward", align: "center" },
    ],
    sections: [
      {
        title: "Leave Type",
        fields: [
          { key: "name", label: "Leave Type Name", type: "data", req: true },
          { key: "code", label: "Code", type: "data" },
          { key: "maxDays", label: "Max Leaves Allowed", type: "float" },
          { key: "maxContinuousDays", label: "Max Continuous Days Allowed", type: "int" },
          { key: "applicableAfter", label: "Applicable After (Days)", type: "int" },
        ],
      },
      {
        title: "Rules",
        fields: [
          { key: "carryForward", label: "Is Carry Forwarded Leave", type: "check" },
          { key: "paid", label: "Paid", type: "check" },
          { key: "isLwp", label: "Is Leave Without Pay", type: "check" },
          { key: "isOptional", label: "Is Optional Leave", type: "check" },
          { key: "isCompensatory", label: "Is Compensatory Off", type: "check" },
          { key: "allowNegative", label: "Allow Negative Balance", type: "check" },
          { key: "includeHoliday", label: "Include Holidays", type: "check" },
          { key: "isPpl", label: "Partially Paid Leave", type: "check" },
          { key: "fractionDailySalary", label: "Fraction of Daily Salary Per Leave", type: "float" },
        ],
      },
      {
        title: "Encashment",
        fields: [
          { key: "allowEncashment", label: "Allow Encashment", type: "check" },
          { key: "earningComponent", label: "Encashment Amount Eligibility Component", type: "link", options: componentNames, addLabel: "Salary Component" },
          { key: "maxEncashable", label: "Max Encashable Leaves", type: "int" },
          { key: "nonEncashable", label: "Non-Encashable Leaves", type: "int" },
        ],
      },
      {
        title: "Earned Leave",
        fields: [
          { key: "isEarnedLeave", label: "Is Earned Leave", type: "check" },
          { key: "earnedLeaveFrequency", label: "Earned Leave Frequency", type: "select", options: ["Monthly", "Quarterly", "Half-Yearly", "Yearly"] },
          { key: "rounding", label: "Rounding", type: "select", options: ["0", "0.25", "0.5", "1.0"] },
          { key: "maximumCarryForwarded", label: "Maximum Carry Forwarded Leaves", type: "float" },
          { key: "allocateOnDay", label: "Allocate on Day", type: "select", options: ["First Day", "Last Day", "Date of Joining"] },
          { key: "allowOverAllocation", label: "Allow Over Allocation", type: "check" },
        ],
      },
    ],
  },
  {
    route: "/leave/holidays",
    label: "Holiday List",
    plural: "Holiday Lists",
    desc: "Weekly-off and public-holiday calendars applied to employees.",
    rows: holidayLists,
    titleKey: "name",
    searchKeys: ["name"],
    columns: [
      { key: "name", header: "Holiday List", sortable: true },
      { key: "from", header: "From Date" },
      { key: "to", header: "To Date" },
      { key: "totalHolidays", header: "Total Holidays", align: "right" },
      { key: "weeklyOff", header: "Weekly Off" },
    ],
    sections: [
      {
        title: "Holiday List",
        fields: [
          { key: "name", label: "Holiday List Name", type: "data", req: true },
          { key: "from", label: "From Date", type: "date", req: true },
          { key: "to", label: "To Date", type: "date", req: true },
          { key: "totalHolidays", label: "Total Holidays", type: "float" },
          { key: "weeklyOff", label: "Weekly Off", type: "select", options: ["Sunday", "Saturday", "Friday", "Thursday", "Wednesday", "Tuesday", "Monday", "None"] },
          { key: "description", label: "Description", type: "long", full: true },
        ],
      },
    ],
  },
  {
    route: "/leave/periods",
    label: "Leave Period",
    plural: "Leave Periods",
    desc: "Annual windows that leave allocations and balances are scoped to.",
    rows: leavePeriods,
    titleKey: "name",
    searchKeys: ["name"],
    columns: [
      { key: "name", header: "Leave Period", sortable: true },
      { key: "from", header: "From Date" },
      { key: "to", header: "To Date" },
      { key: "isAccual", header: "Accrual", align: "center" },
    ],
    sections: [
      {
        title: "Leave Period",
        fields: [
          { key: "name", label: "Name", type: "data", req: true },
          { key: "from", label: "From Date", type: "date", req: true },
          { key: "to", label: "To Date", type: "date", req: true },
          { key: "startDate", label: "Start Date Based On", type: "select", options: ["First Day of Leave Period", "Date of Joining", "1st January", "1st April"] },
          { key: "isAccual", label: "Is Accrual Leave Period", type: "check" },
        ],
      },
    ],
  },
  {
    route: "/leave/policies",
    label: "Leave Policy",
    plural: "Leave Policies",
    desc: "Group leave types with an annual allocation for assignment.",
    rows: leavePolicies,
    titleKey: "name",
    searchKeys: ["name"],
    columns: [
      { key: "name", header: "Leave Policy", sortable: true },
      { key: "applicableTo", header: "Applicable To" },
      { key: "annualAllocation", header: "Annual Allocation", align: "right" },
      { key: "docStatus", header: "Status", align: "center" },
    ],
    sections: [
      {
        title: "Leave Policy",
        fields: [
          { key: "name", label: "Leave Policy Name", type: "data", req: true },
          { key: "annualAllocation", label: "Annual Leave Allocation", type: "float" },
          { key: "applicableTo", label: "Applicable To (Department)", type: "data" },
          { key: "docStatus", label: "DocStatus", type: "select", options: DOC_STATUS },
        ],
      },
    ],
    childTables: [
      {
        title: "Leave Policy Detail",
        desc: "Leave types and annual days granted by this policy.",
        columns: [
          { label: "Leave Type" },
          { label: "Annual Days", type: "number" },
        ],
      },
    ],
  },
  {
    route: "/leave/policy-assignments",
    label: "Leave Policy Assignment",
    plural: "Leave Policy Assignments",
    desc: "Assign a leave policy and period to an employee.",
    rows: leavePolicyAssignments,
    titleKey: "employee",
    subtitleKey: "policy",
    searchKeys: ["employee", "policy"],
    columns: [
      { key: "employee", header: "Employee", sortable: true },
      { key: "policy", header: "Leave Policy" },
      { key: "leavePeriod", header: "Leave Period" },
      { key: "effectiveFrom", header: "Effective From" },
      { key: "status", header: "Status", align: "center" },
    ],
    sections: [
      {
        title: "Leave Policy Assignment",
        fields: [
          { key: "employee", label: "Employee", type: "link", options: employeeNames, addLabel: "Employee", req: true },
          { key: "policy", label: "Leave Policy", type: "link", options: policyNames, addLabel: "Leave Policy" },
          { key: "leavePeriod", label: "Leave Period", type: "link", options: periodNames, addLabel: "Leave Period" },
          { key: "effectiveFrom", label: "Effective From", type: "date" },
          { key: "status", label: "Status", type: "select", options: ["Active", "Inactive"] },
        ],
      },
    ],
  },
  {
    route: "/leave/allocations",
    label: "Leave Allocation",
    plural: "Leave Allocations",
    desc: "Grant leave balances to employees for a period.",
    rows: leaveAllocations,
    titleKey: "employee",
    subtitleKey: "leaveType",
    searchKeys: ["employee", "leaveType"],
    columns: [
      { key: "employee", header: "Employee", sortable: true },
      { key: "leaveType", header: "Leave Type" },
      { key: "newLeaves", header: "New Leaves", align: "right" },
      { key: "carryForward", header: "Carry Fwd", align: "right" },
      { key: "total", header: "Total", align: "right" },
      { key: "docStatus", header: "Status", align: "center" },
    ],
    sections: [
      {
        title: "Leave Allocation",
        fields: [
          { key: "employee", label: "Employee", type: "link", options: employeeNames, addLabel: "Employee", req: true },
          { key: "leaveType", label: "Leave Type", type: "link", options: leaveTypeNames, addLabel: "Leave Type", req: true },
          { key: "carryForward", label: "Carry Forward", type: "check" },
          { key: "newLeaves", label: "New Leaves Allocated", type: "float" },
          { key: "total", label: "Total Leaves Allocated", type: "float" },
          { key: "from", label: "From Date", type: "date" },
          { key: "to", label: "To Date", type: "date" },
          { key: "docStatus", label: "DocStatus", type: "select", options: DOC_STATUS },
          { key: "reason", label: "Reason for Allocation", type: "long", full: true },
        ],
      },
    ],
  },
  {
    route: "/leave/encashment",
    label: "Leave Encashment",
    plural: "Leave Encashments",
    desc: "Convert earned leave balances into payable days.",
    rows: leaveEncashments,
    titleKey: "employee",
    subtitleKey: "leaveType",
    searchKeys: ["employee", "leaveType"],
    columns: [
      { key: "employee", header: "Employee", sortable: true },
      { key: "leaveType", header: "Leave Type" },
      { key: "days", header: "Days", align: "right" },
      { key: "amount", header: "Amount", align: "right" },
      { key: "status", header: "Status", align: "center" },
    ],
    sections: [
      {
        title: "Leave Encashment",
        fields: [
          { key: "employee", label: "Employee", type: "link", options: employeeNames, addLabel: "Employee", req: true },
          { key: "leaveType", label: "Leave Type", type: "link", options: leaveTypeNames, addLabel: "Leave Type", req: true },
          { key: "days", label: "Number of Days", type: "float" },
          { key: "amount", label: "Total Amount", type: "float" },
          { key: "status", label: "Status", type: "select", options: ["Draft", "Approved", "Paid"] },
        ],
      },
    ],
  },
  {
    route: "/leave/block-list",
    label: "Block List",
    plural: "Block Lists",
    desc: "Dates blocked from being taken as leave for a company.",
    rows: leaveBlockLists,
    titleKey: "name",
    searchKeys: ["name", "company"],
    columns: [
      { key: "name", header: "Block List", sortable: true },
      { key: "blockDate", header: "Block Date" },
      { key: "company", header: "Company" },
      { key: "allEmployeeDay", header: "All Employees", align: "center" },
    ],
    sections: [
      {
        title: "Block List",
        fields: [
          { key: "name", label: "Block List Of Holiday Date", type: "data", req: true },
          { key: "blockDate", label: "Holiday Date", type: "date" },
          { key: "company", label: "Company", type: "link", options: companyNames, addLabel: "Company" },
          { key: "allEmployeeDay", label: "Is Inconsistent With Holiday List", type: "check" },
        ],
      },
    ],
  },
  {
    route: "/leave/ledger",
    label: "Leave Ledger Entry",
    plural: "Leave Ledger",
    desc: "Immutable running record of every leave transaction.",
    rows: leaveLedgerEntries,
    titleKey: "employee",
    subtitleKey: "leaveType",
    searchKeys: ["employee", "leaveType"],
    columns: [
      { key: "employee", header: "Employee", sortable: true },
      { key: "leaveType", header: "Leave Type" },
      { key: "transactionType", header: "Transaction" },
      { key: "leaves", header: "Leaves", align: "right" },
      { key: "isCredit", header: "Credit", align: "center" },
      { key: "ledgerFrom", header: "From Date" },
    ],
    sections: [
      {
        title: "Leave Ledger Entry",
        fields: [
          { key: "employee", label: "Employee", type: "link", options: employeeNames, addLabel: "Employee" },
          { key: "leaveType", label: "Leave Type", type: "link", options: leaveTypeNames, addLabel: "Leave Type" },
          { key: "transactionType", label: "Transaction Type", type: "select", options: ["Allocation", "Leave", "Leave Encashment", "Expired", "Adjustment"] },
          { key: "leaves", label: "Leaves", type: "float" },
          { key: "isCredit", label: "Is Credit", type: "check" },
          { key: "ledgerFrom", label: "From Date", type: "date" },
          { key: "ledgerTo", label: "To Date", type: "date" },
        ],
      },
    ],
  },
  {
    route: "/leave/earned-leave-schedule",
    label: "Earned Leave Schedule",
    plural: "Earned Leave Schedules",
    desc: "Accrual schedules that earn leave on a cadence.",
    rows: earnedLeaveSchedules,
    titleKey: "employee",
    subtitleKey: "leaveType",
    searchKeys: ["employee", "leaveType"],
    columns: [
      { key: "employee", header: "Employee", sortable: true },
      { key: "leaveType", header: "Leave Type" },
      { key: "accrualFrequency", header: "Frequency" },
      { key: "nextAccrualDate", header: "Next Accrual" },
      { key: "totalLeavesEarned", header: "Earned", align: "right" },
    ],
    sections: [
      {
        title: "Earned Leave Schedule",
        fields: [
          { key: "employee", label: "Employee", type: "link", options: employeeNames, addLabel: "Employee", req: true },
          { key: "leaveType", label: "Leave Type", type: "link", options: leaveTypeNames, addLabel: "Leave Type", req: true },
          { key: "accrualFrequency", label: "Accrual Frequency", type: "select", options: ["Monthly", "Quarterly", "Half-yearly", "Yearly"] },
          { key: "nextAccrualDate", label: "Next Accrual Date", type: "date" },
          { key: "totalLeavesEarned", label: "Total Leaves Earned", type: "float" },
        ],
      },
    ],
  },
  {
    route: "/leave/holiday-list-assignment",
    label: "Holiday List Assignment",
    plural: "Holiday List Assignments",
    desc: "Assign a holiday list to an employee.",
    rows: holidayListAssignments,
    titleKey: "employee",
    subtitleKey: "holidayList",
    searchKeys: ["employee", "holidayList"],
    columns: [
      { key: "employee", header: "Employee", sortable: true },
      { key: "holidayList", header: "Holiday List" },
      { key: "company", header: "Company" },
      { key: "status", header: "Status", align: "center" },
    ],
    sections: [
      {
        title: "Holiday List Assignment",
        fields: [
          { key: "employee", label: "Employee", type: "link", options: employeeNames, addLabel: "Employee", req: true },
          { key: "holidayList", label: "Holiday List", type: "link", options: holidayListNames, addLabel: "Holiday List" },
          { key: "company", label: "Company", type: "link", options: companyNames, addLabel: "Company" },
          { key: "status", label: "Status", type: "select", options: ["Active", "Inactive"] },
        ],
      },
    ],
  },
  {
    route: "/leave/adjustment",
    label: "Leave Adjustment",
    plural: "Leave Adjustments",
    desc: "Manual corrections to an employee's leave balance.",
    rows: leaveAdjustments,
    titleKey: "employee",
    subtitleKey: "leaveType",
    searchKeys: ["employee", "leaveType"],
    columns: [
      { key: "employee", header: "Employee", sortable: true },
      { key: "leaveType", header: "Leave Type" },
      { key: "adjustmentDate", header: "Date" },
      { key: "leavesAdjustded", header: "Leaves", align: "right" },
      { key: "docStatus", header: "Status", align: "center" },
    ],
    sections: [
      {
        title: "Leave Adjustment",
        fields: [
          { key: "employee", label: "Employee", type: "link", options: employeeNames, addLabel: "Employee", req: true },
          { key: "leaveType", label: "Leave Type", type: "link", options: leaveTypeNames, addLabel: "Leave Type", req: true },
          { key: "adjustmentDate", label: "Adjustment Date", type: "date" },
          { key: "leavesAdjustded", label: "Leaves Adjusted", type: "float" },
          { key: "docStatus", label: "DocStatus", type: "select", options: DOC_STATUS },
          { key: "remarks", label: "Remarks", type: "long", full: true },
        ],
      },
    ],
  },
  {
    route: "/recruitment/jobs",
    label: "Job Opening",
    plural: "Job Openings",
    desc: "Published positions and their hiring details.",
    rows: jobOpenings,
    titleKey: "title",
    subtitleKey: "department",
    searchKeys: ["title", "department", "location"],
    columns: [
      { key: "title", header: "Job Title", sortable: true },
      { key: "department", header: "Department", sortable: true },
      { key: "location", header: "Location" },
      { key: "type", header: "Type" },
      { key: "openings", header: "Openings", align: "center", sortable: true },
      { key: "postedOn", header: "Posted", sortable: true },
      { key: "status", header: "Status", align: "center" },
    ],
    sections: [
      {
        title: "Job Opening",
        fields: [
          { key: "title", label: "Job Title", type: "data", req: true },
          { key: "company", label: "Company", type: "link", options: companyNames, addLabel: "Company", req: true },
          { key: "status", label: "Status", type: "select", options: ["Open", "Closed", "On Hold"] },
          { key: "department", label: "Department", type: "link", options: departmentNames, addLabel: "Department" },
          { key: "designation", label: "Designation", type: "link", options: designationNames, addLabel: "Designation" },
          { key: "type", label: "Employment Type", type: "link", options: employmentTypeNames, addLabel: "Employment Type" },
          { key: "location", label: "Location", type: "link", options: branchNames, addLabel: "Branch" },
          { key: "openings", label: "Planned Vacancies", type: "int" },
          { key: "postedOn", label: "Posted On", type: "date" },
          { key: "closesOn", label: "Closes On", type: "date" },
        ],
      },
      {
        title: "Salary Range",
        fields: [
          { key: "currency", label: "Currency", type: "select", options: ["BDT"] },
          { key: "lowerRange", label: "Lower Range", type: "float" },
          { key: "upperRange", label: "Upper Range", type: "float" },
          { key: "publish", label: "Publish On Website", type: "check" },
          { key: "description", label: "Description", type: "long", full: true },
        ],
      },
    ],
  },
  {
    route: "/performance/goals",
    label: "Goal",
    plural: "Goals",
    desc: "Individual and team objectives tracked through the appraisal cycle.",
    rows: goals,
    titleKey: "title",
    subtitleKey: "employeeName",
    searchKeys: ["title", "employeeName", "department"],
    columns: [
      { key: "title", header: "Goal", sortable: true },
      { key: "employeeName", header: "Employee", sortable: true },
      { key: "department", header: "Department" },
      { key: "kra", header: "KRA" },
      { key: "status", header: "Status", align: "center" },
      { key: "dueOn", header: "Due Date" },
    ],
    sections: [
      {
        title: "Goal",
        fields: [
          { key: "title", label: "Goal Name", type: "data", req: true },
          { key: "employeeName", label: "Employee", type: "link", options: employeeNames, addLabel: "Employee", req: true },
          { key: "department", label: "Department", type: "link", options: departmentNames, addLabel: "Department" },
          { key: "kra", label: "KRA", type: "link", options: [], addLabel: "KRA" },
          { key: "company", label: "Company", type: "link", options: companyNames, addLabel: "Company" },
        ],
      },
      {
        title: "Progress",
        fields: [
          { key: "startDate", label: "Start Date", type: "date", req: true },
          { key: "dueOn", label: "End Date", type: "date" },
          { key: "status", label: "Status", type: "select", options: ["Pending", "In Progress", "Completed", "On Track", "At Risk", "Achieved"] },
          { key: "progress", label: "Progress (%)", type: "float" },
          { key: "isGroup", label: "Is Group", type: "check" },
          { key: "parentGoal", label: "Parent Goal", type: "link", options: goals.map((g) => g.title), addLabel: "Goal" },
          { key: "description", label: "Description", type: "long", full: true },
        ],
      },
    ],
  },
];

// Manual (hand-cloned) configs win over auto-derived ones on route collision.
const BY_ROUTE = new Map([...AUTO_CONFIGS, ...CONFIGS].map((c) => [c.route, c]));

export function getDoctype(route: string): DoctypeConfig {
  const c = BY_ROUTE.get(route);
  if (!c) throw new Error(`Unknown doctype: ${route}`);
  return c;
}

export function getRow(route: string, id: string): Record<string, unknown> | undefined {
  const c = BY_ROUTE.get(route);
  if (!c) return undefined;
  const idKey = c.idKey ?? "id";
  return c.rows.find((r) => String(r[idKey]) === id);
}

/** All registered routes — consumed by scripts/scaffold-crud.mjs. */
export const ALL_ROUTES = [...new Map([...AUTO_CONFIGS, ...CONFIGS].map((c) => [c.route, c])).keys()];
