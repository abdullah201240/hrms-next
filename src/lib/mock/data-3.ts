// ============================================================================
// Mock HR data — extension 2 (recruitment, performance, tenure, tax & benefits,
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
  { id: "eg1", subject: "Unclear overtime policy", raisedBy: "Nina Patel", grievanceAgainst: "Department", type: "Policy Violation", status: "Open" },
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

// --- Tax & Benefits ---------------------------------------------------------

export interface ExemptionCategory { id: ID; name: string; maxAmount: number; }
export const exemptionCategories: ExemptionCategory[] = [
  { id: "ec1", name: "House Rent Allowance", maxAmount: 60000 },
  { id: "ec2", name: "Health Insurance", maxAmount: 25000 },
  { id: "ec3", name: "Investments (80C)", maxAmount: 150000 },
];

export interface ExemptionDeclaration { id: ID; employee: string; company: string; payrollPeriod: string; status: "Draft" | "Submitted"; declarations: { category: string; amount: number }[]; }
export const exemptionDeclarations: ExemptionDeclaration[] = [
  { id: "ed1", employee: "Aisha Khan", company: "Acme", payrollPeriod: "2026", status: "Submitted", declarations: [{ category: "House Rent Allowance", amount: 48000 }, { category: "Investments (80C)", amount: 120000 }] },
  { id: "ed2", employee: "Nina Patel", company: "Acme", payrollPeriod: "2026", status: "Draft", declarations: [{ category: "Health Insurance", amount: 24000 }] },
];

export interface ExemptionProof { id: ID; employee: string; category: string; declared: number; submitted: number; approved: number; status: "Submitted" | "Approved"; }
export const exemptionProofs: ExemptionProof[] = [
  { id: "ep1", employee: "Aisha Khan", category: "Investments (80C)", declared: 120000, submitted: 118000, approved: 118000, status: "Approved" },
  { id: "ep2", employee: "Aisha Khan", category: "House Rent Allowance", declared: 48000, submitted: 48000, approved: 0, status: "Submitted" },
];

export interface BenefitApplication { id: ID; employee: string; company: string; payrollPeriod: string; maxBeneficiaryAmount: number; status: "Draft" | "Approved"; }
export const benefitApplications: BenefitApplication[] = [
  { id: "ba1", employee: "Tom Becker", company: "Acme", payrollPeriod: "2026", maxBeneficiaryAmount: 10000, status: "Approved" },
];

export interface BenefitClaim { id: ID; benefitApplication: string; employee: string; expenseDate: string; amount: number; status: "Pending" | "Approved" | "Paid"; }
export const benefitClaims: BenefitClaim[] = [
  { id: "bc1", benefitApplication: "BA/2026/0001", employee: "Tom Becker", expenseDate: "2026-09-12", amount: 2400, status: "Approved" },
];

// --- Reports catalog --------------------------------------------------------

export interface ReportDef { id: ID; name: string; module: string; doctype: string; }
export const reports: ReportDef[] = [
  { id: "r1", name: "Leave Balance", module: "Leaves", doctype: "Leave Ledger Entry" },
  { id: "r2", name: "Leave Balance Summary", module: "Leaves", doctype: "Employee" },
  { id: "r3", name: "Employees Working on a Holiday", module: "Leaves", doctype: "Attendance" },
  { id: "r4", name: "Monthly Attendance Sheet", module: "Shift & Attendance", doctype: "Attendance" },
  { id: "r5", name: "Shift Attendance", module: "Shift & Attendance", doctype: "Attendance" },
  { id: "r6", name: "Employee Hours Utilization", module: "Shift & Attendance", doctype: "Timesheet" },
  { id: "r7", name: "Salary Register", module: "Payroll", doctype: "Salary Slip" },
  { id: "r8", name: "Employee CTC Break-up", module: "Payroll", doctype: "Employee" },
  { id: "r9", name: "Income Tax Deductions", module: "Payroll", doctype: "Salary Slip" },
  { id: "r10", name: "Unpaid Expense Claim", module: "Expenses", doctype: "Expense Claim" },
  { id: "r11", name: "Recruitment Analytics", module: "Recruitment", doctype: "Job Applicant" },
  { id: "r12", name: "Appraisal Overview", module: "Performance", doctype: "Appraisal" },
  { id: "r13", name: "Employee Exits", module: "Tenure", doctype: "Employee" },
  { id: "r14", name: "Employee Birthday", module: "Tenure", doctype: "Employee" },
  { id: "r15", name: "Employee Analytics", module: "Tenure", doctype: "Employee" },
  { id: "r16", name: "Income Tax Computation", module: "Tax & Benefits", doctype: "Salary Slip" },
  { id: "r17", name: "Accrued Earnings Report", module: "Tax & Benefits", doctype: "Employee Benefit Ledger" },
];
