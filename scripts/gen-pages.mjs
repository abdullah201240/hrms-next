// Generates flat, borderless DataTable list pages for Frappe HR parity routes.
// Run: node scripts/gen-pages.mjs
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const ROOT = join(process.cwd(), "src/app/(app)");

// Column descriptor -> { ... } string
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
  // --- Shift & Attendance ---
  { route: "attendance/shift-types", component: "ShiftTypesPage", title: "Shift Types", desc: "Defined working shift patterns.", mod: "data-2", rows: "shiftTypes", type: "ShiftType", search: ["name"], cols: [
    { key: "name", header: "Shift Type", render: "bold", sortable: true },
    { key: "start", header: "Start" }, { key: "end", header: "End" },
    { key: "hours", header: "Hours", align: "center", sortable: true },
    { key: "holidayList", header: "Holiday List", render: "muted" } ] },
  { route: "attendance/shift-locations", component: "ShiftLocationsPage", title: "Shift Locations", desc: "Geofenced check-in points.", mod: "data-2", rows: "shiftLocations", type: "ShiftLocation", search: ["name"], cols: [
    { key: "name", header: "Location", render: "bold", sortable: true },
    { key: "checkinRadius", header: "Radius (m)", align: "center", sortable: true },
    { key: "latitude", header: "Latitude", render: "muted" }, { key: "longitude", header: "Longitude", render: "muted" } ] },
  { route: "attendance/shift-schedules", component: "ShiftSchedulesPage", title: "Shift Schedules", desc: "Recurring shift assignment plans.", mod: "data-2", rows: "shiftSchedules", type: "ShiftSchedule", search: ["name", "shiftType"], cols: [
    { key: "name", header: "Schedule", render: "bold", sortable: true },
    { key: "shiftType", header: "Shift Type" }, { key: "location", header: "Location" },
    { key: "frequency", header: "Frequency", align: "center" },
    { key: "employeesAssigned", header: "Employees", align: "center", sortable: true },
    { key: "enabled", header: "Enabled", render: "bool", align: "center" } ] },
  { route: "attendance/shift-assignments", component: "ShiftAssignmentsPage", title: "Shift Assignments", desc: "Employees assigned to shift types.", mod: "data-2", rows: "shiftAssignments", type: "ShiftAssignment", search: ["employee", "shiftType"], cols: [
    { key: "employee", header: "Employee", render: "bold", sortable: true },
    { key: "shiftType", header: "Shift Type" },
    { key: "fromDate", header: "From", render: "date", sortable: true },
    { key: "toDate", header: "To", render: "date", sortable: true },
    { key: "status", header: "Status", render: "status" } ] },
  { route: "attendance/checkin", component: "EmployeeCheckinPage", title: "Employee Checkin", desc: "Raw check-in / check-out logs.", mod: "data-2", rows: "employeeCheckins", type: "EmployeeCheckin", search: ["employee", "device"], cols: [
    { key: "employee", header: "Employee", render: "bold", sortable: true },
    { key: "logType", header: "Type", align: "center" }, { key: "time", header: "Time" },
    { key: "shift", header: "Shift" }, { key: "device", header: "Device", render: "muted" },
    { key: "lateEntry", header: "Late", render: "bool", align: "center" } ] },
  { route: "attendance/shift-requests", component: "ShiftRequestsPage", title: "Shift Requests", desc: "Employee requests to change shift.", mod: "data-2", rows: "shiftRequests", type: "ShiftRequest", search: ["employee", "reason"], cols: [
    { key: "employee", header: "Employee", render: "bold", sortable: true },
    { key: "from", header: "From", render: "date", sortable: true },
    { key: "to", header: "To", render: "date", sortable: true },
    { key: "shiftType", header: "Requested Shift" },
    { key: "reason", header: "Reason", render: "muted", hide: true },
    { key: "status", header: "Status", render: "status" } ] },
  { route: "attendance/attendance-requests", component: "AttendanceRequestsPage", title: "Attendance Requests", desc: "Work-from-home / on-duty requests.", mod: "data-2", rows: "attendanceRequests", type: "AttendanceRequest", search: ["employee", "reason"], cols: [
    { key: "employee", header: "Employee", render: "bold", sortable: true },
    { key: "from", header: "From", render: "date", sortable: true },
    { key: "to", header: "To", render: "date", sortable: true },
    { key: "reason", header: "Reason" },
    { key: "workFromHome", header: "WFH", render: "bool", align: "center" },
    { key: "status", header: "Status", render: "status" } ] },
  { route: "attendance/compensatory-leave", component: "CompensatoryLeavePage", title: "Compensatory Leave Requests", desc: "Leave earned for working on off days.", mod: "data-2", rows: "compensatoryLeaveRequests", type: "CompensatoryLeaveRequest", search: ["employee", "reason"], cols: [
    { key: "employee", header: "Employee", render: "bold", sortable: true },
    { key: "workDate", header: "Worked On", render: "date", sortable: true },
    { key: "from", header: "Leave From", render: "date" },
    { key: "to", header: "Leave To", render: "date" },
    { key: "reason", header: "Reason", render: "muted", hide: true },
    { key: "status", header: "Status", render: "status" } ] },
  { route: "attendance/timesheets", component: "TimesheetsPage", title: "Timesheets", desc: "Project time logged by employees.", mod: "data-2", rows: "timesheets", type: "Timesheet", search: ["employee", "project"], cols: [
    { key: "employee", header: "Employee", render: "bold", sortable: true },
    { key: "project", header: "Project" },
    { key: "fromDate", header: "From", render: "date" },
    { key: "toDate", header: "To", render: "date" },
    { key: "totalHours", header: "Hours", align: "center", sortable: true },
    { key: "status", header: "Status", render: "status" } ] },

  // --- Payroll ---

  // --- Expenses ---
  { route: "expenses/types", component: "ExpenseClaimTypesPage", title: "Expense Claim Types", desc: "Categories of reimbursable expense.", mod: "data-2", rows: "expenseClaimTypes", type: "ExpenseClaimType", search: ["name", "description"], cols: [
    { key: "name", header: "Type", render: "bold", sortable: true },
    { key: "description", header: "Description", render: "muted" },
    { key: "needsReceipt", header: "Receipt", render: "bool", align: "center" } ] },
  { route: "expenses/travel-requests", component: "TravelRequestsPage", title: "Travel Requests", desc: "Employee travel approvals.", mod: "data-2", rows: "travelRequests", type: "TravelRequest", search: ["employee", "purpose"], cols: [
    { key: "employee", header: "Employee", render: "bold", sortable: true },
    { key: "purpose", header: "Purpose" },
    { key: "modeOfTravel", header: "Mode", align: "center" },
    { key: "travelDate", header: "Date", render: "date", sortable: true },
    { key: "amount", header: "Est. Cost", render: "money", align: "right", sortable: true },
    { key: "status", header: "Status", render: "status" } ] },
  { route: "expenses/vehicle-logs", component: "VehicleLogsPage", title: "Vehicle Logs", desc: "Company vehicle in/out logs.", mod: "data-2", rows: "vehicleLogs", type: "VehicleLog", search: ["licensePlate", "employee"], cols: [
    { key: "licensePlate", header: "Vehicle", render: "bold", sortable: true },
    { key: "employee", header: "Driver" },
    { key: "type", header: "In/Out", align: "center" },
    { key: "date", header: "When" },
    { key: "logType", header: "Log Type", render: "muted" } ] },

  // --- Recruitment ---
  { route: "recruitment/interviews", component: "InterviewsPage", title: "Interviews", desc: "Scheduled and completed interviews.", mod: "data-3", rows: "interviews", type: "Interview", search: ["applicantName", "jobTitle"], cols: [
    { key: "applicantName", header: "Applicant", render: "bold", sortable: true },
    { key: "jobTitle", header: "Job Title" },
    { key: "round", header: "Round" },
    { key: "date", header: "Scheduled", sortable: true },
    { key: "interviewers", header: "Interviewers", render: "muted", hide: true },
    { key: "status", header: "Status", render: "status" } ] },
  { route: "recruitment/offers", component: "JobOffersPage", title: "Job Offers", desc: "Offers extended to candidates.", mod: "data-3", rows: "jobOffers", type: "JobOffer", search: ["applicantName", "jobTitle"], cols: [
    { key: "applicantName", header: "Candidate", render: "bold", sortable: true },
    { key: "designation", header: "Designation" },
    { key: "offerDate", header: "Offer Date", render: "date", sortable: true },
    { key: "base", header: "Base", render: "money", align: "right", sortable: true },
    { key: "status", header: "Status", render: "status" } ] },
  { route: "recruitment/appointment-letters", component: "AppointmentLettersPage", title: "Appointment Letters", desc: "Formal appointment letter records.", mod: "data-3", rows: "appointmentLetters", type: "AppointmentLetter", search: ["employeeName", "designation"], cols: [
    { key: "employeeName", header: "Employee", render: "bold", sortable: true },
    { key: "designation", header: "Designation" },
    { key: "basicSalary", header: "Basic", render: "money", align: "right", sortable: true },
    { key: "templName", header: "Template", render: "muted", hide: true },
    { key: "status", header: "Status", render: "status" } ] },
  { route: "recruitment/requisitions", component: "JobRequisitionsPage", title: "Job Requisitions", desc: "Departmental hiring requests.", mod: "data-3", rows: "jobRequisitions", type: "JobRequisition", search: ["subject", "department"], cols: [
    { key: "subject", header: "Requisition", render: "bold", sortable: true },
    { key: "department", header: "Department" },
    { key: "noOfPositions", header: "Positions", align: "center", sortable: true },
    { key: "requestedBy", header: "Requested By", hide: true },
    { key: "expectedBy", header: "Expected", render: "date" },
    { key: "status", header: "Status", render: "status" } ] },
  { route: "recruitment/staffing-plans", component: "StaffingPlansPage", title: "Staffing Plans", desc: "Planned vs current headcount.", mod: "data-3", rows: "staffingPlans", type: "StaffingPlan", search: ["department", "designation"], cols: [
    { key: "month", header: "Month", render: "bold", sortable: true },
    { key: "department", header: "Department" },
    { key: "designation", header: "Designation" },
    { key: "employeesRequired", header: "Required", align: "center", sortable: true },
    { key: "currentlyEmployed", header: "Current", align: "center", sortable: true },
    { key: "status", header: "Status", render: "status" } ] },
  { route: "recruitment/referrals", component: "EmployeeReferralsPage", title: "Employee Referrals", desc: "Candidate referrals by employees.", mod: "data-3", rows: "employeeReferrals", type: "EmployeeReferral", search: ["applicantName", "referringEmployee"], cols: [
    { key: "applicantName", header: "Candidate", render: "bold", sortable: true },
    { key: "referringEmployee", header: "Referred By" },
    { key: "jobTitle", header: "Job Title", render: "muted" },
    { key: "status", header: "Status", render: "status" } ] },

  // --- Performance ---
  { route: "performance/cycles", component: "AppraisalCyclesPage", title: "Appraisal Cycles", desc: "Periodic review cycles.", mod: "data-3", rows: "appraisalCycles", type: "AppraisalCycle", search: ["name", "appraisalTemplate"], cols: [
    { key: "name", header: "Cycle", render: "bold", sortable: true },
    { key: "appraisalTemplate", header: "Template" },
    { key: "startDate", header: "Start", render: "date", sortable: true },
    { key: "endDate", header: "End", render: "date", sortable: true },
    { key: "kraAssessment", header: "KRA", render: "bool", align: "center", hide: true },
    { key: "status", header: "Status", render: "status" } ] },
  { route: "performance/templates", component: "AppraisalTemplatesPage", title: "Appraisal Templates", desc: "Scoring templates for reviews.", mod: "data-3", rows: "appraisalTemplates", type: "AppraisalTemplate", search: ["name", "description"], cols: [
    { key: "name", header: "Template", render: "bold", sortable: true },
    { key: "description", header: "Description", render: "muted" },
    { key: "totalScore", header: "Max Score", align: "center", sortable: true } ] },
  { route: "performance/kra", component: "KraPage", title: "Key Result Areas", desc: "KRAs used in appraisals.", mod: "data-3", rows: "kras", type: "KRA", search: ["name", "description"], cols: [
    { key: "name", header: "KRA", render: "bold", sortable: true },
    { key: "description", header: "Description", render: "muted" },
    { key: "isCritical", header: "Critical", render: "bool", align: "center" } ] },
  { route: "performance/promotions", component: "PromotionsPage", title: "Promotions", desc: "Employee grade promotions.", mod: "data-3", rows: "promotions", type: "Promotion", search: ["employee", "batchSize"], cols: [
    { key: "employee", header: "Employee", render: "bold", sortable: true },
    { key: "promotionDate", header: "Effective", render: "date", sortable: true },
    { key: "fromGrade", header: "From Grade" },
    { key: "toGrade", header: "To Grade" },
    { key: "status", header: "Status", render: "status" } ] },
  { route: "performance/feedback", component: "PerformanceFeedbackPage", title: "Performance Feedback", desc: "Reviewer feedback on appraisals.", mod: "data-3", rows: "performanceFeedbacks", type: "PerformanceFeedback", search: ["employee", "reviewer"], cols: [
    { key: "employee", header: "Employee", render: "bold", sortable: true },
    { key: "reviewer", header: "Reviewer" },
    { key: "reviewedOn", header: "Reviewed On", render: "date", sortable: true },
    { key: "totalScore", header: "Score", align: "center", sortable: true },
    { key: "status", header: "Status", render: "status" } ] },

  // --- Tenure ---
  { route: "tenure/onboarding", component: "OnboardingPage", title: "Employee Onboarding", desc: "New-hire onboarding records.", mod: "data-3", rows: "onboardings", type: "EmployeeOnboarding", search: ["employeeName", "jobOffer"], cols: [
    { key: "employeeName", header: "New Hire", render: "bold", sortable: true },
    { key: "dateOfJoining", header: "Joining", render: "date", sortable: true },
    { key: "jobOffer", header: "Job Offer", render: "muted", hide: true },
    { key: "boardingStatus", header: "Boarding" },
    { key: "status", header: "Status", render: "status" } ] },
  { route: "tenure/separations", component: "SeparationsPage", title: "Employee Separation", desc: "Resignation and exit records.", mod: "data-3", rows: "separations", type: "EmployeeSeparation", search: ["employee"], cols: [
    { key: "employee", header: "Employee", render: "bold", sortable: true },
    { key: "resignationLetterDate", header: "Resignation", render: "date", sortable: true },
    { key: "leavingDate", header: "Leaving", render: "date", sortable: true },
    { key: "dateOfJoining", header: "Joined", render: "date", hide: true },
    { key: "status", header: "Status", render: "status" } ] },
  { route: "tenure/exit-interviews", component: "ExitInterviewsPage", title: "Exit Interviews", desc: "Departure interview records.", mod: "data-3", rows: "exitInterviews", type: "ExitInterview", search: ["employee", "reason"], cols: [
    { key: "employee", header: "Employee", render: "bold", sortable: true },
    { key: "departureDate", header: "Departure", render: "date", sortable: true },
    { key: "reason", header: "Reason", render: "muted" },
    { key: "status", header: "Status", render: "status" } ] },
  { route: "tenure/transfers", component: "TransfersPage", title: "Employee Transfers", desc: "Department / branch transfers.", mod: "data-3", rows: "transfers", type: "EmployeeTransfer", search: ["employee"], cols: [
    { key: "employee", header: "Employee", render: "bold", sortable: true },
    { key: "transactionDate", header: "Date", render: "date", sortable: true },
    { key: "fromDepartment", header: "From Dept" },
    { key: "toDepartment", header: "To Dept" },
    { key: "toBranch", header: "To Branch", render: "muted", hide: true },
    { key: "status", header: "Status", render: "status" } ] },
  { route: "tenure/grievances", component: "GrievancesPage", title: "Employee Grievances", desc: "Grievance cases and their status.", mod: "data-3", rows: "grievances", type: "EmployeeGrievance", search: ["subject", "raisedBy"], cols: [
    { key: "subject", header: "Grievance", render: "bold", sortable: true },
    { key: "raisedBy", header: "Raised By" },
    { key: "grievanceAgainst", header: "Against", hide: true },
    { key: "type", header: "Type" },
    { key: "status", header: "Status", render: "status" } ] },
  { route: "tenure/skill-maps", component: "SkillMapsPage", title: "Employee Skill Maps", desc: "Skill profiles per employee.", mod: "data-3", rows: "skillMaps", type: "SkillMap", search: ["employee", "department"], cols: [
    { key: "employee", header: "Employee", render: "bold", sortable: true },
    { key: "department", header: "Department" },
    { key: "basedOn", header: "Based On", render: "muted" },
    { key: "totalSkills", header: "Skills", align: "center", sortable: true } ] },
  { route: "tenure/training-programs", component: "TrainingProgramsPage", title: "Training Programs", desc: "Reusable training programs.", mod: "data-3", rows: "trainingPrograms", type: "TrainingProgram", search: ["name", "trainerName"], cols: [
    { key: "name", header: "Program", render: "bold", sortable: true },
    { key: "trainerName", header: "Trainer" },
    { key: "trainerEmail", header: "Email", render: "muted", hide: true },
    { key: "status", header: "Status", render: "status" } ] },
  { route: "tenure/training-events", component: "TrainingEventsPage", title: "Training Events", desc: "Scheduled training sessions.", mod: "data-3", rows: "trainingEvents", type: "TrainingEvent", search: ["name", "trainingProgram"], cols: [
    { key: "name", header: "Event", render: "bold", sortable: true },
    { key: "trainingProgram", header: "Program" },
    { key: "startTime", header: "Start" },
    { key: "level", header: "Level", align: "center", hide: true },
    { key: "attendees", header: "Attendees", align: "center", sortable: true },
    { key: "status", header: "Status", render: "status" } ] },
];

const made = specs.map(page);
console.log(`Generated ${made.length} pages:`);
made.forEach((r) => console.log("  " + r));
