// ============================================================================
// Mock HR data — extension 2 (recruitment, performance, tenure,
// reports). Pairs with data.ts + data-2.ts. UI-only; mirrors Frappe HR doctypes.
// ============================================================================
import type { ID } from "./data";

// --- Recruitment (extended) -------------------------------------------------

export type HiringStage = "Applied" | "Screening" | "Interview" | "Offer" | "Hired";
export interface PipelineApplicant { id: ID; applicantName: string; jobTitle: string; stage: HiringStage; rating: number; source: string; }
export const hiringPipeline: PipelineApplicant[] = [
  { id: "hp1", applicantName: "Ahmed Farouk", jobTitle: "Marketing Intern", stage: "Applied", rating: 0, source: "Website" },
  { id: "hp2", applicantName: "Samuel Ortiz", jobTitle: "Senior Backend Engineer", stage: "Screening", rating: 3, source: "Referral" },
  { id: "hp3", applicantName: "Rachel Kim", jobTitle: "Senior Backend Engineer", stage: "Interview", rating: 4, source: "Website" },
  { id: "hp4", applicantName: "Grace Liu", jobTitle: "Product Designer", stage: "Offer", rating: 5, source: "LinkedIn" },
  { id: "hp5", applicantName: "Chirag Mehta", jobTitle: "Senior Backend Engineer", stage: "Hired", rating: 5, source: "Referral" },
];

export interface InterviewRound { id: ID; name: string; interviewType: string; expectedDuration: number; }
export const interviewRounds: InterviewRound[] = [
  { id: "ir1", name: "Technical Screen", interviewType: "Technical", expectedDuration: 45 },
  { id: "ir2", name: "System Design", interviewType: "Technical", expectedDuration: 60 },
  { id: "ir3", name: "Managerial", interviewType: "HR", expectedDuration: 30 },
];

export interface Interview { id: ID; applicantName: ID | string; jobTitle: string; date: string; round: string; interviewers: string; status: "Pending" | "Cleared" | "Rejected"; }
export const interviews: Interview[] = [
  { id: "iv1", applicantName: "Rachel Kim", jobTitle: "Senior Backend Engineer", date: "2026-09-22 11:00", round: "Technical Screen", interviewers: "Sarah Chen, Aisha Khan", status: "Pending" },
  { id: "iv2", applicantName: "Samuel Ortiz", jobTitle: "Senior Backend Engineer", date: "2026-09-20 15:00", round: "System Design", interviewers: "Sarah Chen", status: "Rejected" },
  { id: "iv3", applicantName: "Grace Liu", jobTitle: "Product Designer", date: "2026-09-19 10:00", round: "Managerial", interviewers: "Elena Vox, Priya Nair", status: "Cleared" },
];

export interface JobOffer { id: ID; applicantName: string; jobTitle: string; offerDate: string; designation: string; status: "Draft" | "Offered" | "Accepted" | "Rejected"; base: number; }
export const jobOffers: JobOffer[] = [
  { id: "jo1", applicantName: "Grace Liu", jobTitle: "Product Designer", offerDate: "2026-09-20", designation: "Product Designer", status: "Offered", base: 118000 },
  { id: "jo2", applicantName: "Chirag Mehta", jobTitle: "Senior Backend Engineer", offerDate: "2026-09-15", designation: "Senior Software Engineer", status: "Accepted", base: 140000 },
];

export interface AppointmentLetter { id: ID; employeeName: string; company: string; designation: string; basicSalary: number; status: "Draft" | "Sent"; templName: string; }
export const appointmentLetters: AppointmentLetter[] = [
  { id: "al1", employeeName: "Chirag Mehta", company: "Acme", designation: "Senior Software Engineer", basicSalary: 7000, status: "Sent", templName: "Standard Appointment" },
];

export interface JobRequisition { id: ID; subject: string; department: ID | string; noOfPositions: number; requestedBy: string; expectedBy: string; status: "Open" | "Approved" | "Rejected"; }
export const jobRequisitions: JobRequisition[] = [
  { id: "jr1", subject: "2× Backend Engineers", department: "Engineering", noOfPositions: 2, requestedBy: "Sarah Chen", expectedBy: "2026-10-15", status: "Approved" },
  { id: "jr2", subject: "Data Analyst", department: "Finance", noOfPositions: 1, requestedBy: "Tom Becker", expectedBy: "2026-11-01", status: "Open" },
];

export interface StaffingPlan { id: ID; month: string; department: string; designation: string; employeesRequired: number; currentlyEmployed: number; status: "Active" | "Draft"; }
export const staffingPlans: StaffingPlan[] = [
  { id: "sp1", month: "October", department: "Engineering", designation: "Software Engineer", employeesRequired: 10, currentlyEmployed: 8, status: "Active" },
  { id: "sp2", month: "October", department: "Sales", designation: "Sales Executive", employeesRequired: 12, currentlyEmployed: 12, status: "Active" },
];

export interface EmployeeReferral { id: ID; applicantName: string; referringEmployee: string; jobTitle: string; status: "Pending" | "Applicable" | "Rejected"; }
export const employeeReferrals: EmployeeReferral[] = [
  { id: "er1", applicantName: "Samuel Ortiz", referringEmployee: "Aisha Khan", jobTitle: "Senior Backend Engineer", status: "Applicable" },
  { id: "er2", applicantName: "Nadia Rahman", referringEmployee: "Leo Martins", jobTitle: "Marketing Intern", status: "Pending" },
];

// --- Performance (extended) -------------------------------------------------

export interface AppraisalCycle { id: ID; name: string; company: string; appraisalTemplate: string; startDate: string; endDate: string; status: "Active" | "Complete"; kraAssessment: boolean; }
export const appraisalCycles: AppraisalCycle[] = [
  { id: "ac1", name: "H2 2026 Review", company: "Acme", appraisalTemplate: "Engineering Template", startDate: "2026-07-01", endDate: "2026-12-31", status: "Active", kraAssessment: true },
  { id: "ac2", name: "H1 2026 Review", company: "Acme", appraisalTemplate: "Company-wide Template", startDate: "2026-01-01", endDate: "2026-06-30", status: "Complete", kraAssessment: true },
];

export interface AppraisalTemplate { id: ID; name: string; description: string; totalScore: number; }
export const appraisalTemplates: AppraisalTemplate[] = [
  { id: "at1", name: "Engineering Template", description: "Code quality, delivery, ownership", totalScore: 100 },
  { id: "at2", name: "Company-wide Template", description: "Values, collaboration, impact", totalScore: 100 },
];

export interface KRA { id: ID; name: string; isCritical: boolean; description: string; }
export const kras: KRA[] = [
  { id: "kra1", name: "Delivery Predictability", isCritical: true, description: "Ship committed scope on schedule" },
  { id: "kra2", name: "Code Quality", isCritical: true, description: "Review coverage & defect rate" },
  { id: "kra3", name: "Mentorship", isCritical: false, description: "Coach junior engineers" },
];

export interface Promotion { id: ID; employee: string; batchSize: string; promotionDate: string; fromGrade: string; toGrade: string; status: "Draft" | "Approved"; }
export const promotions: Promotion[] = [
  { id: "pm1", employee: "Aisha Khan", batchSize: "H2 2026 Promotions", promotionDate: "2026-10-01", fromGrade: "T3 — Intermediate", toGrade: "T4 — Senior", status: "Approved" },
  { id: "pm2", employee: "Nina Patel", batchSize: "H2 2026 Promotions", promotionDate: "2026-10-01", fromGrade: "T2 — Associate", toGrade: "T3 — Intermediate", status: "Draft" },
];

export interface PerformanceFeedback { id: ID; employee: string; reviewedOn: string; reviewer: string; totalScore: number; status: "Draft" | "Submitted"; appraisal: string; }
export const performanceFeedbacks: PerformanceFeedback[] = [
  { id: "pf1", employee: "Aisha Khan", reviewedOn: "2026-09-18", reviewer: "Sarah Chen", totalScore: 88, status: "Submitted", appraisal: "H2 2026 Review" },
  { id: "pf2", employee: "Nina Patel", reviewedOn: "2026-09-20", reviewer: "Sarah Chen", totalScore: 0, status: "Draft", appraisal: "H2 2026 Review" },
];

// --- Tenure -----------------------------------------------------------------

export interface EmployeeOnboarding { id: ID; employeeName: string; company: string; dateOfJoining: string; jobOffer: string; status: "Pending" | "Complete"; boardingStatus: string; }
export const onboardings: EmployeeOnboarding[] = [
  { id: "on1", employeeName: "Chirag Mehta", company: "Acme", dateOfJoining: "2026-10-01", jobOffer: "JO-2026-0002", status: "Pending", boardingStatus: "In Process" },
  { id: "on2", employeeName: "Grace Liu", company: "Acme", dateOfJoining: "2026-10-05", jobOffer: "JO-2026-0001", status: "Pending", boardingStatus: "Not Started" },
];

export interface EmployeeSeparation { id: ID; employee: string; company: string; resignationLetterDate: string; dateOfJoining: string; leavingDate: string; status: "Draft" | "Submitted" | "Complete"; }
export const separations: EmployeeSeparation[] = [
  { id: "sep1", employee: "Dana Cole", company: "Acme", resignationLetterDate: "2026-09-01", dateOfJoining: "2019-12-02", leavingDate: "2026-10-15", status: "Submitted" },
  { id: "sep2", employee: "Owen Wright", company: "Acme", resignationLetterDate: "2026-08-20", dateOfJoining: "2022-04-19", leavingDate: "2026-09-15", status: "Complete" },
];

export interface ExitInterview { id: ID; employee: string; departureDate: string; reason: string; status: "Pending" | "Complete"; }
export const exitInterviews: ExitInterview[] = [
  { id: "ex1", employee: "Owen Wright", departureDate: "2026-09-15", reason: "Better opportunity", status: "Complete" },
  { id: "ex2", employee: "Dana Cole", departureDate: "2026-10-15", reason: "Relocation", status: "Pending" },
];

export interface EmployeeTransfer { id: ID; employee: string; transactionDate: string; fromDepartment: string; toDepartment: string; fromBranch: string; toBranch: string; status: "Draft" | "Submitted"; }
export const transfers: EmployeeTransfer[] = [
  { id: "tf1", employee: "Leo Martins", transactionDate: "2026-09-10", fromDepartment: "Marketing", toDepartment: "Product", fromBranch: "HQ — San Francisco", toBranch: "New York Office", status: "Submitted" },
];

export interface GrievanceType { id: ID; name: string; isSubmittable: boolean; }
export const grievanceTypes: GrievanceType[] = [
  { id: "gt1", name: "Workplace Conduct", isSubmittable: true },
  { id: "gt2", name: "Compensation", isSubmittable: true },
  { id: "gt3", name: "Policy Violation", isSubmittable: true },
];

export interface EmployeeGrievance { id: ID; subject: string; raisedBy: string; grievanceAgainst: string; type: string; status: "Open" | "Under Review" | "Resolved"; }
export const grievances: EmployeeGrievance[] = [
  { id: "eg1", subject: "Unclear leave policy", raisedBy: "Nina Patel", grievanceAgainst: "Department", type: "Policy Violation", status: "Open" },
  { id: "eg2", subject: "Team conflict mediation", raisedBy: "Owen Wright", grievanceAgainst: "Yuki Tanaka", type: "Workplace Conduct", status: "Resolved" },
];

export interface SkillMap { id: ID; employee: string; department: string; basedOn: string; totalSkills: number; }
export const skillMaps: SkillMap[] = [
  { id: "sm1", employee: "Aisha Khan", department: "Engineering", basedOn: "Designation", totalSkills: 6 },
  { id: "sm2", employee: "Yuki Tanaka", department: "Design", basedOn: "Employee Grade", totalSkills: 4 },
];

export interface TrainingProgram { id: ID; name: string; trainerName: string; trainerEmail: string; status: "Completed" | "Scheduled"; }
export const trainingPrograms: TrainingProgram[] = [
  { id: "tp1", name: "Secure Coding", trainerName: "External — OWASP", trainerEmail: "train@owasp.test", status: "Scheduled" },
  { id: "tp2", name: "Design Systems 101", trainerName: "Elena Vox", trainerEmail: "elena.vox@acme.test", status: "Completed" },
];

export interface TrainingEvent { id: ID; name: string; trainingProgram: string; startTime: string; endTime: string; level: string; attendees: number; status: "Scheduled" | "Completed"; }
export const trainingEvents: TrainingEvent[] = [
  { id: "tev1", name: "Secure Coding — Cohort 1", trainingProgram: "Secure Coding", startTime: "2026-10-12 09:00", endTime: "2026-10-12 16:00", level: "Intermediate", attendees: 14, status: "Scheduled" },
  { id: "tev2", name: "Design Systems — Session 1", trainingProgram: "Design Systems 101", startTime: "2026-09-08 10:00", endTime: "2026-09-08 12:00", level: "Beginner", attendees: 9, status: "Completed" },
];

// --- Reports catalog (mirrors the 28 real Frappe HR report doctypes) --------

export interface ReportDef {
  id: ID;
  slug: string;
  name: string;
  module: string;
  doctype: string;
  columns: string[];
}

export const reports: ReportDef[] = [
  { id: "r1", slug: "employee-leave-balance", name: "Employee Leave Balance", module: "Leaves", doctype: "Employee Leave Balance", columns: ["Employee", "Leave Type", "Total Allocated", "Leaves Requested", "Balance Leave"] },
  { id: "r2", slug: "employee-leave-balance-summary", name: "Employee Leave Balance Summary", module: "Leaves", doctype: "Employee", columns: ["Employee", "Opening Balance", "Planned", "Consumed", "Closing Balance"] },
  { id: "r3", slug: "employees-working-on-a-holiday", name: "Employees Working on a Holiday", module: "Leaves", doctype: "Attendance", columns: ["Employee", "Date", "Holiday", "Shift", "Status"] },
  { id: "r4", slug: "leave-ledger", name: "Leave Ledger", module: "Leaves", doctype: "Leave Ledger Entry", columns: ["Employee", "Leave Type", "Transaction Type", "Leaves", "From", "To"] },
  { id: "r5", slug: "monthly-attendance-sheet", name: "Monthly Attendance Sheet", module: "Shift & Attendance", doctype: "Attendance", columns: ["Employee", "Present Days", "Absent Days", "Leave Days", "Total Working Days"] },
  { id: "r6", slug: "shift-attendance", name: "Shift Attendance", module: "Shift & Attendance", doctype: "Attendance", columns: ["Employee", "Date", "Shift", "In Time", "Out Time", "Status"] },
  { id: "r7", slug: "employee-hours-utilization-based-on-timesheet", name: "Employee Hours Utilization Based On Timesheet", module: "Shift & Attendance", doctype: "Timesheet", columns: ["Employee", "Project", "Hours Logged", "Utilization %"] },
  { id: "r8", slug: "daily-work-summary-replies", name: "Daily Work Summary Replies", module: "Shift & Attendance", doctype: "Daily Work Summary", columns: ["Employee", "Date", "Reply Status"] },
  { id: "r9", slug: "salary-register", name: "Salary Register", module: "Payroll", doctype: "Salary Slip", columns: ["Employee", "Designation", "Basic", "Total Earnings", "Total Deductions", "Net Pay"] },
  { id: "r10", slug: "employee-ctc-break-up", name: "Employee CTC Break-up", module: "Payroll", doctype: "Employee", columns: ["Employee", "Component", "Amount"] },
  { id: "r14", slug: "provident-fund-deductions", name: "Provident Fund Deductions", module: "Payroll", doctype: "Salary Slip", columns: ["Employee", "Employee Share", "Employer Share"] },
  { id: "r15", slug: "salary-payments-based-on-payment-mode", name: "Salary Payments Based On Payment Mode", module: "Payroll", doctype: "Salary Slip", columns: ["Payment Mode", "No of Employees", "Amount"] },
  { id: "r16", slug: "salary-payments-via-ecs", name: "Salary Payments via ECS", module: "Payroll", doctype: "Salary Slip", columns: ["Employee", "Bank", "Account No", "Net Pay"] },
  { id: "r17", slug: "bank-remittance", name: "Bank Remittance", module: "Payroll", doctype: "Salary Slip", columns: ["Employee", "Bank", "Account Type", "Amount"] },
  { id: "r18", slug: "accrued-earnings-report", name: "Accrued Earnings Report", module: "Payroll", doctype: "Employee Benefit Application", columns: ["Employee", "Leave Type", "Accrued Days", "Amount"] },
  { id: "r19", slug: "employee-advance-summary", name: "Employee Advance Summary", module: "Payroll", doctype: "Employee Advance", columns: ["Employee", "Paid Amount", "Refund Amount", "Advance Balance"] },
  { id: "r20", slug: "unpaid-expense-claim", name: "Unpaid Expense Claim", module: "Expenses", doctype: "Expense Claim", columns: ["Employee", "Claim", "Category", "Amount", "Status"] },
  { id: "r21", slug: "vehicle-expenses", name: "Vehicle Expenses", module: "Expenses", doctype: "Vehicle Log", columns: ["Vehicle", "Type", "Date", "Amount"] },
  { id: "r22", slug: "recruitment-analytics", name: "Recruitment Analytics", module: "Recruitment", doctype: "Job Applicant", columns: ["Job Title", "Applicants", "Interviews", "Offers", "Hired"] },
  { id: "r23", slug: "appraisal-overview", name: "Appraisal Overview", module: "Performance", doctype: "Appraisal", columns: ["Employee", "Cycle", "Review Score", "Avg Points", "Status"] },
  { id: "r24", slug: "employee-information", name: "Employee Information", module: "Human Resources", doctype: "Employee", columns: ["Employee", "Department", "Designation", "Reports To", "Status"] },
  { id: "r25", slug: "employee-analytics", name: "Employee Analytics", module: "Human Resources", doctype: "Employee", columns: ["Department", "Employee Count", "Avg Tenure"] },
  { id: "r26", slug: "employee-birthday", name: "Employee Birthday", module: "Human Resources", doctype: "Employee", columns: ["Employee", "Date of Birth", "Department", "Months to Celebrate"] },
  { id: "r27", slug: "employee-exits", name: "Employee Exits", module: "Human Resources", doctype: "Employee", columns: ["Employee", "Leave Date", "Reason", "Status"] },
  { id: "r28", slug: "project-profitability", name: "Project Profitability", module: "Shift & Attendance", doctype: "Timesheet", columns: ["Project", "Sales Amount", "Expense Amount", "Profit", "Profit %"] },
];

export const reportBySlug = (slug: string) => reports.find((r) => r.slug === slug);

// --- Deterministic mock report rows (preview only) --------------------------
const NAMES = ["Aisha Khan", "Nina Patel", "Sarah Chen", "Tom Becker", "Diego Torres", "Grace Liu", "Leo Martins", "Priya Nair"];
const DEPTS = ["Engineering", "Product", "Sales", "Finance", "Design"];
const STATUS = ["Present", "Absent", "Leave", "Week Off"];
const PROJECTS = ["Billing Platform", "Mobile Beta", "Data Pipeline", "Design System"];
const BANKS = ["Chase", "HSBC", "Citibank", "Wells Fargo"];
const LEAVES = ["Earned Leave", "Casual Leave", "Privileged Leave"];
const money = (n: number) => "৳" + n.toLocaleString("en-US");

function cellFor(col: string, idx: number, row: number): string {
  const c = col.toLowerCase();
  const r = row;
  if (idx === 0 && /employee|job title|vehicle|department|payment mode/.test(c)) {
    if (/department/.test(c)) return DEPTS[r % DEPTS.length];
    if (/vehicle/.test(c)) return ["SF-2044", "NY-8821", "SF-1180"][r % 3];
    if (/job title/.test(c)) return ["Backend Engineer", "Product Designer", "Sales Exec"][r % 3];
    if (/payment mode/.test(c)) return ["Bank", "Cash", "UPI"][r % 3];
    return NAMES[r % NAMES.length];
  }
  if (/amount|pay|balance|earnings|deduction|basic|share|refund|net|cost|profit/.test(c)) return money(800 + ((r * 137 + idx * 53) % 9200));
  if (/%/.test(c)) return 60 + ((r * 7 + idx) % 40) + "%";
  if (/date|dob|birth/.test(c)) return ["2026-09-21", "2026-09-20", "2026-09-18", "2026-09-15", "2026-09-11", "2026-09-08"][r % 6];
  if (/time/.test(c)) return ["09:02", "18:15", "08:55", "17:40", "13:05", "21:00"][r % 6];
  if (/month/.test(c)) return ["Jul", "Aug", "Sep"][r % 3] + " 2026";
  if (/status|state|reply/.test(c)) return c.includes("reply") ? ["Received", "Pending"][r % 2] : (c.includes("leave") ? ["Approved", "Pending", "Draft"][r % 3] : STATUS[r % STATUS.length]);
  if (/leave type/.test(c)) return LEAVES[r % LEAVES.length];
  if (/project/.test(c)) return PROJECTS[r % PROJECTS.length];
  if (/bank|account/.test(c)) return /no$/.test(c) ? "••" + (1000 + r * 7) : BANKS[r % BANKS.length];
  if (/component|head/.test(c)) return ["Basic Salary", "House Rent", "Conveyance"][r % 3];
  if (/shift|type|category|reason|designation|reports to|cycle|mode|plan/.test(c)) return ["General", "Standard", "Q3 Review", "Resignation", "Senior Engineer"][r % 5];
  if (/day|hours|count|leaves|applicant|interview|offer|score|point|utilization|tenure|number|total|position|celebrate/.test(c)) return String(1 + ((r * 3 + idx * 2) % 24));
  return NAMES[r % NAMES.length];
}

export function reportRows(def: ReportDef, count = 6): string[][] {
  return Array.from({ length: count }, (_, row) =>
    def.columns.map((col, idx) => cellFor(col, idx, row)),
  );
}
