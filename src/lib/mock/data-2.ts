// ============================================================================
// Mock HR data — extension 1 (org setup, leaves, shift & attendance, payroll,
// expenses). Pairs with data.ts. UI-only; shapes mirror Frappe HR doctypes.
// ============================================================================
import type { ID } from "./data";

// --- HR / Setup -------------------------------------------------------------

export interface Branch { id: ID; name: string; city: string; company: string; head: string; }
export const branches: Branch[] = [
  { id: "br1", name: "HQ — San Francisco", city: "San Francisco", company: "Acme", head: "Sarah Chen" },
  { id: "br2", name: "New York Office", city: "New York", company: "Acme", head: "Dana Cole" },
  { id: "br3", name: "Remote Hub", city: "Distributed", company: "Acme", head: "Priya Nair" },
];

export interface EmployeeGroup { id: ID; name: string; description: string; strength: number; }
export const employeeGroups: EmployeeGroup[] = [
  { id: "eg1", name: "Engineering", description: "Product & platform engineers", strength: 42 },
  { id: "eg2", name: "GTM", description: "Sales, marketing & success", strength: 28 },
  { id: "eg3", name: "Corporate", description: "HR, finance, legal", strength: 14 },
];

export interface EmployeeGrade { id: ID; name: string; level: number; minSalary: number; maxSalary: number; defaultComponent: string; }
export const employeeGrades: EmployeeGrade[] = [
  { id: "gr1", name: "T2 — Associate", level: 2, minSalary: 70000, maxSalary: 100000, defaultComponent: "Standard" },
  { id: "gr2", name: "T3 — Intermediate", level: 3, minSalary: 95000, maxSalary: 130000, defaultComponent: "Standard" },
  { id: "gr3", name: "T4 — Senior", level: 4, minSalary: 130000, maxSalary: 170000, defaultComponent: "Senior" },
  { id: "gr4", name: "M1 — Manager", level: 5, minSalary: 140000, maxSalary: 185000, defaultComponent: "Management" },
];

export interface OrgNode { id: ID; name: string; designation: string; reportsTo?: ID; directReports: number; }
export const orgChart: OrgNode[] = [
  { id: "og-ceo", name: "Ava Stone", designation: "CEO", directReports: 4 },
  { id: "og-vpe", name: "Sarah Chen", designation: "VP Engineering", reportsTo: "og-ceo", directReports: 12 },
  { id: "og-vpp", name: "Marcus Reed", designation: "VP Product", reportsTo: "og-ceo", directReports: 6 },
  { id: "og-coo", name: "Priya Nair", designation: "COO", reportsTo: "og-ceo", directReports: 8 },
  { id: "og-cro", name: "Dana Cole", designation: "CRO", reportsTo: "og-ceo", directReports: 21 },
];

// --- Leaves -----------------------------------------------------------------

export interface HolidayList { id: ID; name: string; from: string; to: string; totalHolidays: number; weeklyOff: string; }
export const holidayLists: HolidayList[] = [
  { id: "hl1", name: "Holidays 2026", from: "2026-01-01", to: "2026-12-31", totalHolidays: 12, weeklyOff: "Sunday" },
  { id: "hl2", name: "Holidays 2027", from: "2027-01-01", to: "2027-12-31", totalHolidays: 11, weeklyOff: "Sunday" },
];

export interface LeavePeriod { id: ID; name: string; from: string; to: string; startDate: string; isAccual: boolean; }
export const leavePeriods: LeavePeriod[] = [
  { id: "lp1", name: "Jan–Jun 2026", from: "2026-01-01", to: "2026-06-30", startDate: "2026-01-01", isAccual: true },
  { id: "lp2", name: "Jul–Dec 2026", from: "2026-07-01", to: "2026-12-31", startDate: "2026-07-01", isAccual: true },
];

export interface LeavePolicy { id: ID; name: string; applicableTo: string; docStatus: "Draft" | "Submitted"; annualAllocation: number; }
export const leavePolicies: LeavePolicy[] = [
  { id: "lpo1", name: "Standard Policy", applicableTo: "All Employees", docStatus: "Submitted", annualAllocation: 30 },
  { id: "lpo2", name: "Probation Policy", applicableTo: "On Probation", docStatus: "Submitted", annualAllocation: 12 },
];

export interface LeavePolicyAssignment { id: ID; employee: string; policy: string; leavePeriod: string; effectiveFrom: string; status: "Active" | "Inactive"; }
export const leavePolicyAssignments: LeavePolicyAssignment[] = [
  { id: "lpa1", employee: "Aisha Khan", policy: "Standard Policy", leavePeriod: "Jul–Dec 2026", effectiveFrom: "2026-07-01", status: "Active" },
  { id: "lpa2", employee: "Diego Torres", policy: "Probation Policy", leavePeriod: "Jul–Dec 2026", effectiveFrom: "2026-07-01", status: "Active" },
];

export interface LeaveAllocation { id: ID; employee: string; leaveType: string; newLeaves: number; carryForward: number; total: number; from: string; to: string; docStatus: "Draft" | "Submitted"; }
export const leaveAllocations: LeaveAllocation[] = [
  { id: "alc1", employee: "Aisha Khan", leaveType: "Earned Leave", newLeaves: 15, carryForward: 2, total: 17, from: "2026-07-01", to: "2026-12-31", docStatus: "Submitted" },
  { id: "alc2", employee: "Nina Patel", leaveType: "Casual Leave", newLeaves: 12, carryForward: 0, total: 12, from: "2026-07-01", to: "2026-12-31", docStatus: "Submitted" },
];

export interface LeaveBlockList { id: ID; name: string; blockDate: string; allEmployeeDay: boolean; company: string; }
export const leaveBlockLists: LeaveBlockList[] = [
  { id: "bl1", name: "Year-end blackout", blockDate: "2026-12-24", allEmployeeDay: true, company: "Acme" },
  { id: "bl2", name: "Product launch", blockDate: "2026-11-10", allEmployeeDay: false, company: "Acme" },
];

export interface LeaveEncashment { id: ID; employee: string; leaveType: string; days: number; amount: number; status: "Draft" | "Approved" | "Paid"; }
export const leaveEncashments: LeaveEncashment[] = [
  { id: "enc1", employee: "Tom Becker", leaveType: "Earned Leave", days: 5, amount: 1200, status: "Approved" },
  { id: "enc2", employee: "Sarah Chen", leaveType: "Privileged Leave", days: 2, amount: 640, status: "Draft" },
];

// --- Shift & Attendance -----------------------------------------------------

export interface ShiftType { id: ID; name: string; start: string; end: string; hours: number; holidayList: string; }
export const shiftTypes: ShiftType[] = [
  { id: "st1", name: "General", start: "09:00", end: "18:00", hours: 9, holidayList: "Holidays 2026" },
  { id: "st2", name: "Early", start: "06:00", end: "14:00", hours: 8, holidayList: "Holidays 2026" },
  { id: "st3", name: "Late", start: "13:00", end: "21:00", hours: 8, holidayList: "Holidays 2026" },
];

export interface ShiftLocation { id: ID; name: string; checkinRadius: number; latitude: number; longitude: number; }
export const shiftLocations: ShiftLocation[] = [
  { id: "sloc1", name: "HQ Campus", checkinRadius: 200, latitude: 37.7897, longitude: -122.3972 },
  { id: "sloc2", name: "NYC Office", checkinRadius: 150, latitude: 40.7128, longitude: -74.006 },
];

export interface ShiftSchedule { id: ID; name: string; shiftType: string; location: string; frequency: "Daily" | "Weekly"; employeesAssigned: number; enabled: boolean; }
export const shiftSchedules: ShiftSchedule[] = [
  { id: "sch1", name: "Eng General Schedule", shiftType: "General", location: "HQ Campus", frequency: "Weekly", employeesAssigned: 30, enabled: true },
  { id: "sch2", name: "Support Rotating", shiftType: "Late", location: "NYC Office", frequency: "Weekly", employeesAssigned: 8, enabled: true },
];

export interface ShiftAssignment { id: ID; employee: string; shiftType: string; status: "Active" | "Inactive"; fromDate: string; toDate: string; }
export const shiftAssignments: ShiftAssignment[] = [
  { id: "sa1", employee: "Aisha Khan", shiftType: "General", status: "Active", fromDate: "2026-07-01", toDate: "2026-12-31" },
  { id: "sa2", employee: "Leo Martins", shiftType: "Late", status: "Active", fromDate: "2026-07-01", toDate: "2026-12-31" },
];

export interface EmployeeCheckin { id: ID; employee: string; device: string; logType: "IN" | "OUT"; time: string; shift: string; lateEntry: boolean; }
export const employeeCheckins: EmployeeCheckin[] = [
  { id: "ci1", employee: "Aisha Khan", device: "Web", logType: "IN", time: "2026-09-21 09:02", shift: "General", lateEntry: true },
  { id: "ci2", employee: "Aisha Khan", device: "Web", logType: "OUT", time: "2026-09-21 18:15", shift: "General", lateEntry: false },
  { id: "ci3", employee: "Nina Patel", device: "Mobile", logType: "IN", time: "2026-09-21 08:55", shift: "General", lateEntry: false },
];

export type RequestDocStatus = "Draft" | "Pending" | "Approved" | "Rejected" | "Compensatory";
export interface ShiftRequest { id: ID; employee: string; from: string; to: string; shiftType: string; reason: string; status: RequestDocStatus; }
export const shiftRequests: ShiftRequest[] = [
  { id: "sr1", employee: "Nina Patel", from: "2026-09-25", to: "2026-09-26", shiftType: "Early", reason: "Personal commitment", status: "Pending" },
  { id: "sr2", employee: "Yuki Tanaka", from: "2026-09-22", to: "2026-09-22", shiftType: "General", reason: "Client timezone", status: "Approved" },
];

export interface AttendanceRequest { id: ID; employee: string; from: string; to: string; reason: "Work From Home" | "On Duty" | "Half Day"; workFromHome: boolean; status: RequestDocStatus; }
export const attendanceRequests: AttendanceRequest[] = [
  { id: "ar1", employee: "Diego Torres", from: "2026-09-23", to: "2026-09-23", reason: "Work From Home", workFromHome: true, status: "Pending" },
  { id: "ar2", employee: "Elena Vox", from: "2026-09-19", to: "2026-09-19", reason: "On Duty", workFromHome: false, status: "Approved" },
];

export interface CompensatoryLeaveRequest { id: ID; employee: string; workDate: string; from: string; to: string; reason: string; status: RequestDocStatus; }
export const compensatoryLeaveRequests: CompensatoryLeaveRequest[] = [
  { id: "clr1", employee: "Tom Becker", workDate: "2026-09-13", from: "2026-09-14", to: "2026-09-14", reason: "Worked on weekly off", status: "Approved" },
];

export interface OvertimeType { id: ID; name: string; forDailyWage: boolean; maxOvertimeHours: number; hoursPerSlip: number; }
export const overtimeTypes: OvertimeType[] = [
  { id: "ot1", name: "Standard Overtime", forDailyWage: false, maxOvertimeHours: 2, hoursPerSlip: 1.5 },
  { id: "ot2", name: "Weekend Overtime", forDailyWage: true, maxOvertimeHours: 4, hoursPerSlip: 3 },
];

export interface OvertimeSlip { id: ID; employee: string; payrollPeriod: string; overtimeType: string; overtimeHours: number; amount: number; status: "Draft" | "Approved"; }
export const overtimeSlips: OvertimeSlip[] = [
  { id: "os1", employee: "Aisha Khan", payrollPeriod: "September 2026", overtimeType: "Standard Overtime", overtimeHours: 6, amount: 340, status: "Approved" },
  { id: "os2", employee: "Owen Wright", payrollPeriod: "September 2026", overtimeType: "Weekend Overtime", overtimeHours: 8, amount: 410, status: "Draft" },
];

export interface Timesheet { id: ID; employee: string; project: string; fromDate: string; toDate: string; totalHours: number; status: "Draft" | "Submitted" | "Completed"; }
export const timesheets: Timesheet[] = [
  { id: "ts1", employee: "Nina Patel", project: "Billing Platform", fromDate: "2026-09-14", toDate: "2026-09-20", totalHours: 38, status: "Submitted" },
  { id: "ts2", employee: "Aisha Khan", project: "Mobile Beta", fromDate: "2026-09-14", toDate: "2026-09-20", totalHours: 42, status: "Completed" },
];

// --- Payroll (extended) -----------------------------------------------------

export interface SalaryComponent { id: ID; name: string; type: "Earning" | "Deduction"; formula: string; basedOn: string; dependsOnPaymentDays: boolean; }
export const salaryComponents: SalaryComponent[] = [
  { id: "sc1", name: "Basic Salary", type: "Earning", formula: "base * 0.5", basedOn: "Grade Default Amount", dependsOnPaymentDays: true },
  { id: "sc2", name: "House Rent Allowance", type: "Earning", formula: "base * 0.2", basedOn: "Salary Component", dependsOnPaymentDays: true },
  { id: "sc3", name: "Provident Fund", type: "Deduction", formula: "Basic Salary * 0.12", basedOn: "Salary Component", dependsOnPaymentDays: false },
  { id: "sc4", name: "Income Tax", type: "Deduction", formula: "", basedOn: "Based On Taxable Salary", dependsOnPaymentDays: false },
];

export interface SalaryStructureAssignment { id: ID; employee: string; salaryStructure: string; base: number; amount: number; payrollCompany: string; fromDate: string; currency: string; }
export const salaryStructureAssignments: SalaryStructureAssignment[] = [
  { id: "ssa1", employee: "Aisha Khan", salaryStructure: "Engineering — Senior", base: 138000, amount: 12500, payrollCompany: "Acme", fromDate: "2026-01-01", currency: "BDT" },
  { id: "ssa2", employee: "Sarah Chen", salaryStructure: "Engineering — Senior", base: 168000, amount: 14000, payrollCompany: "Acme", fromDate: "2026-01-01", currency: "BDT" },
];

export interface AdditionalSalary { id: ID; employee: string; component: string; amount: number; from: string; to: string; overwrite: boolean; }
export const additionalSalaries: AdditionalSalary[] = [
  { id: "as1", employee: "Dana Cole", component: "Commission", amount: 2400, from: "2026-09-01", to: "2026-09-30", overwrite: false },
  { id: "as2", employee: "Leo Martins", component: "Special Allowance", amount: 800, from: "2026-09-01", to: "2026-09-30", overwrite: true },
];

export interface PayrollPeriod { id: ID; name: string; startDate: string; endDate: string; company: string; }
export const payrollPeriods: PayrollPeriod[] = [
  { id: "pp1", name: "2026", startDate: "2026-01-01", endDate: "2026-12-31", company: "Acme" },
];

export interface IncomeTaxSlab { id: ID; name: string; fromAmount: number; toAmount: number; percentDeducted: number; company: string; }
export const incomeTaxSlabs: IncomeTaxSlab[] = [
  { id: "its1", name: "Slab 0%", fromAmount: 0, toAmount: 12000, percentDeducted: 0, company: "Acme" },
  { id: "its2", name: "Slab 10%", fromAmount: 12000, toAmount: 40000, percentDeducted: 10, company: "Acme" },
  { id: "its3", name: "Slab 22%", fromAmount: 40000, toAmount: 99999999, percentDeducted: 22, company: "Acme" },
];

export interface EmployeeCostCenter { id: ID; employee: string; department: string; costCenter: string; percentage: number; }
export const employeeCostCenters: EmployeeCostCenter[] = [
  { id: "cc1", employee: "Aisha Khan", department: "Engineering", costCenter: "CC-ENG-01", percentage: 100 },
  { id: "cc2", employee: "Sarah Chen", department: "Engineering", costCenter: "CC-ENG-MGMT", percentage: 100 },
];

export interface RetentionBonus { id: ID; employee: string; bonusPaymentPlan: string; bonusAmount: number; bonusPaymentDate: string; payoutStatus: "Not Paid" | "Paid"; }
export const retentionBonuses: RetentionBonus[] = [
  { id: "rb1", employee: "Nina Patel", bonusPaymentPlan: "Annual Retention", bonusAmount: 5000, bonusPaymentDate: "2026-12-31", payoutStatus: "Not Paid" },
];

export interface EmployeeIncentive { id: ID; employee: string; payoutDate: string; amount: number; note: string; }
export const employeeIncentives: EmployeeIncentive[] = [
  { id: "ei1", employee: "Dana Cole", payoutDate: "2026-09-30", amount: 1500, note: "Q3 quota exceeded" },
  { id: "ei2", employee: "Grace Liu", payoutDate: "2026-09-30", amount: 700, note: "Design excellence" },
];

export interface Gratuity { id: ID; employee: string; gratuityRule: string; currentGratuityAmount: number; status: "Draft" | "Paid"; }
export const gratuities: Gratuity[] = [
  { id: "gt1", employee: "Tom Becker", gratuityRule: "Standard Gratuity", currentGratuityAmount: 24000, status: "Draft" },
];

export interface SalaryWithholding { id: ID; employee: string; fromDate: string; toDate: string; amount: number; status: "Withheld" | "Released"; }
export const salaryWithholdings: SalaryWithholding[] = [
  { id: "sw1", employee: "Owen Wright", fromDate: "2026-09-01", toDate: "2026-09-30", amount: 900, status: "Withheld" },
];

// --- Expenses (extended) ----------------------------------------------------

export interface ExpenseClaimType { id: ID; name: string; description: string; needsReceipt: boolean; }
export const expenseClaimTypes: ExpenseClaimType[] = [
  { id: "xct1", name: "Travel", description: "Flights, trains, taxi, mileage", needsReceipt: true },
  { id: "xct2", name: "Meals", description: "Client & team meals", needsReceipt: true },
  { id: "xct3", name: "Software", description: "Tools & subscriptions", needsReceipt: false },
  { id: "xct4", name: "Equipment", description: "Hardware & peripherals", needsReceipt: true },
];

export interface EmployeeAdvance { id: ID; purpose: string; employee: string; advanceDate: string; amount: number; paidAmount: number; status: "Draft" | "Approved" | "Paid" | "Claimed"; }
export const employeeAdvances: EmployeeAdvance[] = [
  { id: "ea1", purpose: "ADV/2026/0007", employee: "Diego Torres", advanceDate: "2026-09-10", amount: 800, paidAmount: 800, status: "Paid" },
  { id: "ea2", purpose: "ADV/2026/0008", employee: "Elena Vox", advanceDate: "2026-09-18", amount: 500, paidAmount: 0, status: "Approved" },
];

export interface PurposeOfTravel { id: ID; name: string; }
export const purposesOfTravel: PurposeOfTravel[] = [
  { id: "pot1", name: "Customer Visit" }, { id: "pot2", name: "Training" }, { id: "pot3", name: "Meeting" }, { id: "pot4", name: "Project Work" },
];

export interface TravelRequest { id: ID; employee: string; purpose: string; modeOfTravel: string; travelDate: string; status: "Draft" | "Approved" | "Rejected"; amount: number; }
export const travelRequests: TravelRequest[] = [
  { id: "tr1", employee: "Dana Cole", purpose: "Customer Visit", modeOfTravel: "Flight", travelDate: "2026-09-28", status: "Approved", amount: 640 },
  { id: "tr2", employee: "Sarah Chen", purpose: "Meeting", modeOfTravel: "Cab", travelDate: "2026-09-24", status: "Draft", amount: 80 },
];

export interface VehicleLog { id: ID; licensePlate: string; employee: string; type: "In" | "Out"; date: string; logType: "Service" | "Trip"; }
export const vehicleLogs: VehicleLog[] = [
  { id: "vl1", licensePlate: "SF-2044", employee: "Dana Cole", type: "Out", date: "2026-09-17 08:30", logType: "Trip" },
  { id: "vl2", licensePlate: "SF-2044", employee: "Dana Cole", type: "In", date: "2026-09-17 18:10", logType: "Trip" },
  { id: "vl3", licensePlate: "NY-8821", employee: "Owen Wright", type: "Out", date: "2026-09-12 09:00", logType: "Service" },
];
