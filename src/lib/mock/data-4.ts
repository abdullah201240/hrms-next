// ============================================================================
// Mock HR data — extension 3 (gap-closing admin doctypes + self-service
// notifications). Pairs with data.ts + data-2.ts + data-3.ts. UI-only.
// ============================================================================
import type { ID } from "./data";

// --- Leaves (depth) ---------------------------------------------------------

export interface LeaveLedgerEntry { id: ID; employee: string; leaveType: string; transactionType: "Allocation" | "Leave" | "Leave Encashment" | "Expired" | "Adjustment"; leaves: number; ledgerFrom: string; ledgerTo: string; isCredit: boolean; }
export const leaveLedgerEntries: LeaveLedgerEntry[] = [
  { id: "lle1", employee: "Aisha Khan", leaveType: "Earned Leave", transactionType: "Allocation", leaves: 15, ledgerFrom: "2026-07-01", ledgerTo: "2026-12-31", isCredit: true },
  { id: "lle2", employee: "Aisha Khan", leaveType: "Earned Leave", transactionType: "Leave", leaves: -3, ledgerFrom: "2026-08-04", ledgerTo: "2026-08-06", isCredit: false },
  { id: "lle3", employee: "Nina Patel", leaveType: "Casual Leave", transactionType: "Allocation", leaves: 12, ledgerFrom: "2026-07-01", ledgerTo: "2026-12-31", isCredit: true },
];

export interface LeaveAdjustment { id: ID; employee: string; leaveType: string; adjustmentDate: string; leavesAdjustded: number; remarks: string; docStatus: "Draft" | "Submitted"; }
export const leaveAdjustments: LeaveAdjustment[] = [
  { id: "la1", employee: "Tom Becker", leaveType: "Earned Leave", adjustmentDate: "2026-09-01", leavesAdjustded: 1, remarks: "Carry-forward correction", docStatus: "Submitted" },
];

export interface EarnedLeaveSchedule { id: ID; employee: string; leaveType: string; accrualFrequency: "Monthly" | "Quarterly" | "Half-yearly" | "Yearly"; nextAccrualDate: string; totalLeavesEarned: number; }
export const earnedLeaveSchedules: EarnedLeaveSchedule[] = [
  { id: "els1", employee: "Aisha Khan", leaveType: "Earned Leave", accrualFrequency: "Monthly", nextAccrualDate: "2026-10-01", totalLeavesEarned: 15 },
  { id: "els2", employee: "Diego Torres", leaveType: "Earned Leave", accrualFrequency: "Quarterly", nextAccrualDate: "2026-12-31", totalLeavesEarned: 6 },
];

// --- HR / Setup (depth) -----------------------------------------------------

export interface EmploymentType { id: ID; name: string; description: string; }
export const employmentTypes: EmploymentType[] = [
  { id: "et1", name: "Full-time", description: "Regular salaried employment" },
  { id: "et2", name: "Part-time", description: "Reduced weekly hours" },
  { id: "et3", name: "Contract", description: "Fixed-term contract staff" },
  { id: "et4", name: "Intern", description: "Training period, non-confirmable" },
];

export interface EmployeeTraining { id: ID; employee: string; trainingProgram: string; level: string; trainerName: string; score: number; status: "In Progress" | "Completed"; }
export const employeeTrainings: EmployeeTraining[] = [
  { id: "etr1", employee: "Aisha Khan", trainingProgram: "Secure Coding", level: "Intermediate", trainerName: "External — OWASP", score: 0, status: "In Progress" },
  { id: "etr2", employee: "Yuki Tanaka", trainingProgram: "Design Systems 101", level: "Beginner", trainerName: "Elena Vox", score: 92, status: "Completed" },
];

export interface EmployeeSkill { id: ID; employee: string; skill: string; proficiency: number; assessmentCount: number; }
export const employeeSkills: EmployeeSkill[] = [
  { id: "esk1", employee: "Aisha Khan", skill: "System Design", proficiency: 4, assessmentCount: 3 },
  { id: "esk2", employee: "Aisha Khan", skill: "Go", proficiency: 3, assessmentCount: 2 },
  { id: "esk3", employee: "Grace Liu", skill: "Figma", proficiency: 5, assessmentCount: 4 },
];

export interface EmployeeHealthInsurance { id: ID; policyNo: string; employee: string; insuranceProvider: string; planType: string; from: string; to: string; status: "Active" | "Expired"; }
export const employeeHealthInsurances: EmployeeHealthInsurance[] = [
  { id: "hi1", policyNo: "HIP-2026-0044", employee: "Aisha Khan", insuranceProvider: "AcmeCare", planType: "Family Floater", from: "2026-04-01", to: "2027-03-31", status: "Active" },
  { id: "hi2", policyNo: "HIP-2025-0912", employee: "Tom Becker", insuranceProvider: "AcmeCare", planType: "Individual", from: "2025-04-01", to: "2026-03-31", status: "Expired" },
];

export interface DailyWorkSummary { id: ID; name: string; template: string; group: string; recipients: number; enabled: boolean; }
export const dailyWorkSummaries: DailyWorkSummary[] = [
  { id: "dws1", name: "Engineering EOD", template: "Standard EOD", group: "Engineering", recipients: 30, enabled: true },
  { id: "dws2", name: "GTM Daily", template: "Sales Pipeline", group: "GTM", recipients: 21, enabled: false },
];

// --- Payroll (depth) --------------------------------------------------------

export interface Arrear { id: ID; employee: string; payrollPeriod: string; fromMonth: string; toMonth: string; totalArrearAmount: number; submitted: boolean; }
export const arrears: Arrear[] = [
  { id: "ar1", employee: "Nina Patel", payrollPeriod: "September 2026", fromMonth: "2026-07-01", toMonth: "2026-08-31", totalArrearAmount: 1200, submitted: true },
];

export interface PayrollCorrection { id: ID; employee: string; payrollEntry: string; month: string; submitted: boolean; }
export const payrollCorrections: PayrollCorrection[] = [
  { id: "pc1", employee: "Owen Wright", payrollEntry: "PAYROLL-ENT-2026-09-0012", month: "August 2026", submitted: true },
];

export interface EmployeeOtherIncome { id: ID; employee: string; incomeType: string; payStructureComponent: string; amount: number; note: string; }
export const employeeOtherIncomes: EmployeeOtherIncome[] = [
  { id: "oi1", employee: "Dana Cole", incomeType: "Stock Option Exercise", payStructureComponent: "Other Income", amount: 5400, note: "Q3 vest" },
];

export interface TaxableSalarySlab { id: ID; salarySlip: string; employee: string; fromAmount: number; toAmount: number; percentDeducted: number; }
export const taxableSalarySlabs: TaxableSalarySlab[] = [
  { id: "tss1", salarySlip: "SS-2026-09-0001", employee: "Aisha Khan", fromAmount: 0, toAmount: 12000, percentDeducted: 0 },
  { id: "tss2", salarySlip: "SS-2026-09-0001", employee: "Aisha Khan", fromAmount: 12000, toAmount: 40000, percentDeducted: 10 },
];

export interface EmployeeBenefitLedger { id: ID; employee: string; benefitApplication: string; expenseClaim: string; amountEligible: number; amountSanctioned: number; amountUtilized: number; }
export const employeeBenefitLedgers: EmployeeBenefitLedger[] = [
  { id: "bl1", employee: "Tom Becker", benefitApplication: "BA/2026/0001", expenseClaim: " exp-118", amountEligible: 10000, amountSanctioned: 8000, amountUtilized: 2400 },
];

export interface SalaryWithholdingCycle { id: ID; employee: string; fromDate: string; toDate: string; withholdingAmount: number; receivedAmount: number; status: "Draft" | "Submitted"; }
export const salaryWithholdingCycles: SalaryWithholdingCycle[] = [
  { id: "swc1", employee: "Owen Wright", fromDate: "2026-09-01", toDate: "2026-09-30", withholdingAmount: 900, receivedAmount: 0, status: "Submitted" },
];

// --- Expenses / Full & Final ------------------------------------------------

export interface FullAndFinalStatement { id: ID; employee: string; company: string; payrollDate: string; unsalariedAmount: number; salaryPayout: number; totalAmount: number; status: "Draft" | "Submitted" | "Paid"; }
export const fullAndFinalStatements: FullAndFinalStatement[] = [
  { id: "ff1", employee: "Owen Wright", company: "Acme", payrollDate: "2026-09-15", unsalariedAmount: 3200, salaryPayout: 6800, totalAmount: 10000, status: "Paid" },
  { id: "ff2", employee: "Dana Cole", company: "Acme", payrollDate: "2026-10-15", unsalariedAmount: 1500, salaryPayout: 9200, totalAmount: 10700, status: "Draft" },
];

export interface VehicleService { id: ID; licensePlate: string; employee: string; serviceDate: string; type: string; invoiceNo: string; amount: number; status: "Draft" | "Completed"; }
export const vehicleServices: VehicleService[] = [
  { id: "vs1", licensePlate: "NY-8821", employee: "Owen Wright", serviceDate: "2026-09-12", type: "Periodic Maintenance", invoiceNo: "SVC-2026-221", amount: 240, status: "Completed" },
];

// --- Self-service notifications --------------------------------------------

export interface Notification { id: ID; title: string; body: string; from: string; read: boolean; docType: string; when: string; }
export const notifications: Notification[] = [
  { id: "nt1", title: "Leave application approved", body: "Your Earned Leave for 4–6 Aug was approved by Sarah Chen.", from: "Sarah Chen", read: false, docType: "Leave Application", when: "2026-09-21 09:10" },
  { id: "nt2", title: "Salary slip released", body: "Your September 2026 salary slip is available.", from: "Payroll", read: false, docType: "Salary Slip", when: "2026-09-20 18:00" },
  { id: "nt3", title: "Expense claim pending", body: "Claim EXP/2026/0031 needs a receipt to proceed.", from: "Finance", read: true, docType: "Expense Claim", when: "2026-09-18 11:25" },
  { id: "nt4", title: "Shift request reminder", body: "Please confirm your shift change for 25–26 Sep.", from: "System", read: true, docType: "Shift Request", when: "2026-09-17 08:00" },
];

// --- HR Setup masters (Interview Type, Feedback Criteria, etc.) -------------

export interface InterviewType { id: ID; name: string; description: string; }
export const interviewTypes: InterviewType[] = [
  { id: "it1", name: "Technical Interview", description: "Hands-on skills assessment by the hiring team." },
  { id: "it2", name: "HR Screening", description: "Culture-fit and compensation expectations call." },
  { id: "it3", name: "Manager Round", description: "Team lead evaluation of overall role fit." },
];

export interface FeedbackCriteria { id: ID; name: string; category: "Technical" | "Behavioural" | "Performance" | "Administrative"; }
export const feedbackCriteria: FeedbackCriteria[] = [
  { id: "fc1", name: "Communication Skills", category: "Behavioural" },
  { id: "fc2", name: "Problem Solving", category: "Technical" },
  { id: "fc3", name: "Goal Achievement", category: "Performance" },
  { id: "fc4", name: "Documentation Quality", category: "Administrative" },
];

export interface HolidayListAssignment { id: ID; employee: string; holidayList: string; company: string; status: "Active" | "Inactive"; }
export const holidayListAssignments: HolidayListAssignment[] = [
  { id: "hla1", employee: "Aisha Khan", holidayList: "India Holidays 2026", company: "Acme", status: "Active" },
  { id: "hla2", employee: "Tom Becker", holidayList: "US Holidays 2026", company: "Acme", status: "Active" },
  { id: "hla3", employee: "Nina Patel", holidayList: "India Holidays 2026", company: "Acme", status: "Inactive" },
];

export interface JobOpeningTemplate { id: ID; name: string; description: string; }
export const jobOpeningTemplates: JobOpeningTemplate[] = [
  { id: "jot1", name: "Engineering — Standard", description: "Reusable description for senior/backend engineer openings." },
  { id: "jot2", name: "Customer Success", description: "CS open position template with shift expectations." },
];

export interface JobOfferTermTemplate { id: ID; name: string; offerTerm: string; weight: number; }
export const jobOfferTermTemplates: JobOfferTermTemplate[] = [
  { id: "jott1", name: "Probation Period", offerTerm: "Employment Type", weight: 100 },
  { id: "jott2", name: "Notice Period", offerTerm: "Terms", weight: 100 },
  { id: "jott3", name: "Relocation Support", offerTerm: "Benefits", weight: 50 },
];

export interface AppointmentLetterTemplate { id: ID; name: string; company: string; basedOn: "Date of Joining" | "Confirmation"; }
export const appointmentLetterTemplates: AppointmentLetterTemplate[] = [
  { id: "alt1", name: "Standard Appointment Letter", company: "Acme", basedOn: "Date of Joining" },
  { id: "alt2", name: "Confirmation Letter", company: "Acme", basedOn: "Confirmation" },
];

export interface TrainingFeedback { id: ID; employee: string; trainingEvent: string; trainerName: string; rating: number; status: "Pending" | "Complete"; }
export const trainingFeedback: TrainingFeedback[] = [
  { id: "tf1", employee: "Aisha Khan", trainingEvent: "TRN-EVT-2026-05", trainerName: "Rahul Verma", rating: 90, status: "Complete" },
  { id: "tf2", employee: "Owen Wright", trainingEvent: "TRN-EVT-2026-07", trainerName: "External Vendor", rating: 75, status: "Pending" },
];
