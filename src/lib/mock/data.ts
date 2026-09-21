// ============================================================================
// Mock HR data — UI-only layer. No DB wiring yet (schema/auth come later).
// Shapes intentionally mirror the planned Prisma models so swapping in real
// data later is a drop-in replacement.
// ============================================================================

export type ID = string;

export interface Company {
  id: ID;
  name: string;
  abbreviation: string;
  email: string;
  phone: string;
  address: string;
  timezone: string;
  currency: string;
}

export interface Department {
  id: ID;
  name: string;
  head: string;
  employeeCount: number;
  parent?: string;
}

export interface Designation {
  id: ID;
  name: string;
  department: string;
  grade: string;
  reportsTo?: string;
}

export type EmployeeStatus = "Active" | "On Probation" | "Notice Period" | "Inactive";

export interface Employee {
  id: ID;
  employeeId: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  designation: string;
  reportsTo: string;
  joinDate: string;
  status: EmployeeStatus;
  workLocation: string;
  baseSalary: number;
  avatarColor: string;
  role: "employee" | "hr" | "admin" | "approver";
  // Extended profile fields mirroring the Frappe HR Employee form.
  salutation?: string;
  firstName?: string;
  lastName?: string;
  gender?: string;
  dateOfBirth?: string;
  maritalStatus?: string;
  bloodGroup?: string;
  company?: string;
  branch?: string;
  grade?: string;
  holidayList?: string;
  salaryMode?: string;
  salaryCurrency?: string;
  ctc?: number;
  bankName?: string;
  bankAcno?: string;
  companyEmail?: string;
  personalEmail?: string;
  userId?: string;
  offerDate?: string;
  confirmationDate?: string;
  contractEndDate?: string;
  retirementDate?: string;
  noticeDays?: number;
  attendanceDeviceId?: string;
  permanentAddress?: string;
  currentAddress?: string;
  emergencyContactName?: string;
  emergencyPhone?: string;
  relation?: string;
  bio?: string;
}

export interface LeaveType {
  id: ID;
  name: string;
  code: string;
  maxDays: number;
  paid: boolean;
  carryForward: boolean;
}

export type LeaveStatus = "Pending" | "Approved" | "Rejected" | "Cancelled";

export interface LeaveApplication {
  id: ID;
  employeeId: string;
  employeeName: string;
  leaveType: string;
  from: string;
  to: string;
  days: number;
  reason: string;
  status: LeaveStatus;
  appliedOn: string;
  approver: string;
}

export interface LeaveBalance {
  leaveType: string;
  entitled: number;
  used: number;
  pending: number;
  remaining: number;
}

export type AttendanceStatus = "Present" | "Absent" | "Half Day" | "Leave" | "Week Off";

export interface AttendanceRecord {
  id: ID;
  date: string;
  employeeId: string;
  employeeName: string;
  status: AttendanceStatus;
  checkIn: string;
  checkOut: string;
  lateBy: string;
  workHours: number;
}

export interface SalaryComponent {
  name: string;
  amount: number;
  type?: "earning" | "deduction";
}

export interface SalaryStructure {
  id: ID;
  name: string;
  department: string;
  designation: string;
  currency: string;
  earnings: SalaryComponent[];
  deductions: SalaryComponent[];
}

export interface SalarySlip {
  id: ID;
  employeeId: string;
  employeeName: string;
  month: string;
  gross: number;
  deductions: number;
  net: number;
  status: "Paid" | "Draft" | "Processing";
  publishedOn?: string;
}

export type ExpenseStatus = "Draft" | "Pending" | "Approved" | "Rejected" | "Paid";

export interface ExpenseClaim {
  id: ID;
  claimId: string;
  employeeId: string;
  employeeName: string;
  category: string;
  description: string;
  amount: number;
  currency: string;
  date: string;
  status: ExpenseStatus;
  approver: string;
}

export interface JobOpening {
  id: ID;
  title: string;
  department: string;
  location: string;
  type: "Full-time" | "Part-time" | "Contract" | "Internship";
  openings: number;
  status: "Open" | "Closed" | "On Hold";
  postedOn: string;
}

export type ApplicationStatus = "Applied" | "Screening" | "Interview" | "Offered" | "Hired" | "Rejected";

export interface JobApplication {
  id: ID;
  applicantName: string;
  email: string;
  jobTitle: string;
  appliedOn: string;
  status: ApplicationStatus;
  source: string;
  rating: number;
}

export type AppraisalStatus = "Not Started" | "In Progress" | "Awaiting Review" | "Completed";

export interface Appraisal {
  id: ID;
  employeeId: string;
  employeeName: string;
  cycle: string;
  department: string;
  selfRating: number;
  managerRating: number;
  finalScore: number;
  status: AppraisalStatus;
  dueOn: string;
}

export interface Goal {
  id: ID;
  title: string;
  employeeName: string;
  department: string;
  kpi: string;
  target: number;
  current: number;
  unit: string;
  status: "On Track" | "At Risk" | "Achieved" | "Pending";
  dueOn: string;
}

// --- Static reference data ---------------------------------------------------

export const company: Company = {
  id: "c1",
  name: "Acme Technologies Ltd.",
  abbreviation: "Acme",
  email: "hr@acme.test",
  phone: "+1 202 555 0100",
  address: "500 Market Street, San Francisco, CA",
  timezone: "America/Los_Angeles",
  currency: "BDT",
};

export const departments: Department[] = [
  { id: "d1", name: "Engineering", head: "Sarah Chen", employeeCount: 42 },
  { id: "d2", name: "Product", head: "Marcus Reed", employeeCount: 12 },
  { id: "d3", name: "Design", head: "Elena Vox", employeeCount: 9 },
  { id: "d4", name: "Human Resources", head: "Priya Nair", employeeCount: 6 },
  { id: "d5", name: "Finance", head: "Tom Becker", employeeCount: 8 },
  { id: "d6", name: "Sales", head: "Dana Cole", employeeCount: 21 },
  { id: "d7", name: "Marketing", head: "Leo Martins", employeeCount: 7 },
];

export const designations: Designation[] = [
  { id: "g1", name: "Software Engineer", department: "Engineering", grade: "T3", reportsTo: "Engineering Manager" },
  { id: "g2", name: "Senior Software Engineer", department: "Engineering", grade: "T4", reportsTo: "Engineering Manager" },
  { id: "g3", name: "Engineering Manager", department: "Engineering", grade: "M1", reportsTo: "VP Engineering" },
  { id: "g4", name: "Product Manager", department: "Product", grade: "M1", reportsTo: "VP Product" },
  { id: "g5", name: "Product Designer", department: "Design", grade: "T3", reportsTo: "Design Lead" },
  { id: "g6", name: "HR Executive", department: "Human Resources", grade: "T2", reportsTo: "HR Manager" },
  { id: "g7", name: "Accountant", department: "Finance", grade: "T3", reportsTo: "Finance Manager" },
  { id: "g8", name: "Sales Executive", department: "Sales", grade: "T2", reportsTo: "Sales Manager" },
];

const palette = ["#c62828", "#1565c0", "#2e7d32", "#ef6c00", "#6a1b9a", "#00838f", "#ad1457", "#4527a0"];
const pick = (i: number) => palette[i % palette.length];

const EMPLOYEE_BASE: Employee[] = [
  { id: "e1", employeeId: "EMP-0001", name: "Sarah Chen", email: "sarah.chen@acme.test", phone: "+1 202 555 0111", department: "Engineering", designation: "Engineering Manager", reportsTo: "VP Engineering", joinDate: "2019-03-11", status: "Active", workLocation: "San Francisco", baseSalary: 168000, avatarColor: pick(0), role: "admin" },
  { id: "e2", employeeId: "EMP-0002", name: "Marcus Reed", email: "marcus.reed@acme.test", phone: "+1 202 555 0112", department: "Product", designation: "Product Manager", reportsTo: "VP Product", joinDate: "2020-07-01", status: "Active", workLocation: "Remote", baseSalary: 142000, avatarColor: pick(1), role: "approver" },
  { id: "e3", employeeId: "EMP-0003", name: "Aisha Khan", email: "aisha.khan@acme.test", phone: "+1 202 555 0113", department: "Engineering", designation: "Senior Software Engineer", reportsTo: "Sarah Chen", joinDate: "2021-01-18", status: "Active", workLocation: "San Francisco", baseSalary: 138000, avatarColor: pick(2), role: "employee" },
  { id: "e4", employeeId: "EMP-0004", name: "Diego Torres", email: "diego.torres@acme.test", phone: "+1 202 555 0114", department: "Engineering", designation: "Software Engineer", reportsTo: "Sarah Chen", joinDate: "2022-09-05", status: "On Probation", workLocation: "Remote", baseSalary: 104000, avatarColor: pick(3), role: "employee" },
  { id: "e5", employeeId: "EMP-0005", name: "Priya Nair", email: "priya.nair@acme.test", phone: "+1 202 555 0115", department: "Human Resources", designation: "HR Manager", reportsTo: "COO", joinDate: "2018-05-21", status: "Active", workLocation: "San Francisco", baseSalary: 126000, avatarColor: pick(4), role: "hr" },
  { id: "e6", employeeId: "EMP-0006", name: "Elena Vox", email: "elena.vox@acme.test", phone: "+1 202 555 0116", department: "Design", designation: "Design Lead", reportsTo: "VP Product", joinDate: "2020-11-30", status: "Active", workLocation: "Remote", baseSalary: 132000, avatarColor: pick(5), role: "employee" },
  { id: "e7", employeeId: "EMP-0007", name: "Tom Becker", email: "tom.becker@acme.test", phone: "+1 202 555 0117", department: "Finance", designation: "Finance Manager", reportsTo: "CFO", joinDate: "2017-08-14", status: "Active", workLocation: "San Francisco", baseSalary: 148000, avatarColor: pick(6), role: "employee" },
  { id: "e8", employeeId: "EMP-0008", name: "Dana Cole", email: "dana.cole@acme.test", phone: "+1 202 555 0118", department: "Sales", designation: "Sales Manager", reportsTo: "CRO", joinDate: "2019-12-02", status: "Notice Period", workLocation: "Remote", baseSalary: 120000, avatarColor: pick(7), role: "employee" },
  { id: "e9", employeeId: "EMP-0009", name: "Leo Martins", email: "leo.martins@acme.test", phone: "+1 202 555 0119", department: "Marketing", designation: "Marketing Lead", reportsTo: "CMO", joinDate: "2021-06-15", status: "Active", workLocation: "Remote", baseSalary: 112000, avatarColor: pick(1), role: "employee" },
  { id: "e10", employeeId: "EMP-0010", name: "Nina Patel", email: "nina.patel@acme.test", phone: "+1 202 555 0120", department: "Engineering", designation: "Software Engineer", reportsTo: "Sarah Chen", joinDate: "2023-02-27", status: "Active", workLocation: "San Francisco", baseSalary: 98000, avatarColor: pick(2), role: "employee" },
  { id: "e11", employeeId: "EMP-0011", name: "Owen Wright", email: "owen.wright@acme.test", phone: "+1 202 555 0121", department: "Sales", designation: "Sales Executive", reportsTo: "Dana Cole", joinDate: "2022-04-19", status: "Inactive", workLocation: "Remote", baseSalary: 76000, avatarColor: pick(3), role: "employee" },
  { id: "e12", employeeId: "EMP-0012", name: "Yuki Tanaka", email: "yuki.tanaka@acme.test", phone: "+1 202 555 0122", department: "Design", designation: "Product Designer", reportsTo: "Elena Vox", joinDate: "2023-09-01", status: "On Probation", workLocation: "Remote", baseSalary: 92000, avatarColor: pick(4), role: "employee" },
];

// Extended profile records keyed by employee id — mirror the Frappe Employee form.
const EMPLOYEE_PROFILES: Record<string, Partial<Employee>> = {
  e1: { salutation: "Ms.", firstName: "Sarah", lastName: "Chen", gender: "Female", dateOfBirth: "1988-04-12", maritalStatus: "Married", bloodGroup: "O+", company: "Acme Technologies Ltd.", branch: "San Francisco", grade: "G4 — Senior Management", holidayList: "2026 Holidays", salaryMode: "Bank", salaryCurrency: "BDT", ctc: 218000, bankName: "City Bank", bankAcno: "•••• 4021", companyEmail: "sarah.chen@acme.test", personalEmail: "sarah.c@gmail.com", userId: "sarah.chen@acme.test", offerDate: "2019-02-01", confirmationDate: "2019-09-11", noticeDays: 60, attendanceDeviceId: "BIO-0001", permanentAddress: "42 Pine St, San Francisco, CA", currentAddress: "42 Pine St, San Francisco, CA", emergencyContactName: "Daniel Chen", emergencyPhone: "+1 202 555 0901", relation: "Spouse", bio: "Engineering leader with 12+ years building distributed platforms." },
  e2: { salutation: "Mr.", firstName: "Marcus", lastName: "Reed", gender: "Male", dateOfBirth: "1986-11-02", maritalStatus: "Single", bloodGroup: "A+", company: "Acme Technologies Ltd.", branch: "London", grade: "G3 — Management", holidayList: "2026 Holidays", salaryMode: "Bank", salaryCurrency: "BDT", ctc: 185000, bankName: "HSBC", bankAcno: "•••• 7788", companyEmail: "marcus.reed@acme.test", personalEmail: "m.reed@outlook.com", userId: "marcus.reed@acme.test", offerDate: "2020-06-01", confirmationDate: "2021-01-01", noticeDays: 60, attendanceDeviceId: "BIO-0002", permanentAddress: "12 Baker St, London", currentAddress: "12 Baker St, London", emergencyContactName: "Alice Reed", emergencyPhone: "+44 20 5550 118", relation: "Sibling", bio: "Product leader focused on roadmap execution." },
  e3: { salutation: "Ms.", firstName: "Aisha", lastName: "Khan", gender: "Female", dateOfBirth: "1993-07-19", maritalStatus: "Married", bloodGroup: "B+", company: "Acme Technologies Ltd.", branch: "Dhaka", grade: "G2 — Senior", holidayList: "2026 Holidays", salaryMode: "Bank", salaryCurrency: "BDT", ctc: 179000, bankName: "BRAC Bank", bankAcno: "•••• 1290", companyEmail: "aisha.khan@acme.test", personalEmail: "aisha.khan@gmail.com", userId: "aisha.khan@acme.test", offerDate: "2020-12-01", confirmationDate: "2021-07-18", noticeDays: 45, attendanceDeviceId: "BIO-0003", permanentAddress: "House 22, Road 7, Dhanmondi, Dhaka", currentAddress: "House 22, Road 7, Dhanmondi, Dhaka", emergencyContactName: "Rahim Khan", emergencyPhone: "+880 1700 000003", relation: "Parent", bio: "Senior engineer specialising in backend systems." },
  e4: { salutation: "Mr.", firstName: "Diego", lastName: "Torres", gender: "Male", dateOfBirth: "1996-02-28", maritalStatus: "Single", bloodGroup: "AB+", company: "Acme Technologies Ltd.", branch: "San Francisco", grade: "G1 — Individual", holidayList: "2026 Holidays", salaryMode: "Bank", salaryCurrency: "BDT", ctc: 135000, bankName: "Chase", bankAcno: "•••• 5567", companyEmail: "diego.torres@acme.test", personalEmail: "diego.t@yahoo.com", userId: "diego.torres@acme.test", offerDate: "2022-08-01", noticeDays: 30, attendanceDeviceId: "BIO-0004", permanentAddress: "88 Elm Ave, Austin, TX", currentAddress: "88 Elm Ave, Austin, TX", emergencyContactName: "Maria Torres", emergencyPhone: "+1 202 555 0904", relation: "Parent", bio: "Software engineer, payments team." },
  e5: { salutation: "Ms.", firstName: "Priya", lastName: "Nair", gender: "Female", dateOfBirth: "1985-09-09", maritalStatus: "Married", bloodGroup: "O-", company: "Acme Technologies Ltd.", branch: "Dhaka", grade: "G3 — Management", holidayList: "2026 Holidays", salaryMode: "Bank", salaryCurrency: "BDT", ctc: 164000, bankName: "Eastern Bank", bankAcno: "•••• 3311", companyEmail: "priya.nair@acme.test", personalEmail: "priya.nair@gmail.com", userId: "priya.nair@acme.test", offerDate: "2018-04-01", confirmationDate: "2018-11-21", noticeDays: 60, attendanceDeviceId: "BIO-0005", permanentAddress: "Gulshan Avenue, Dhaka", currentAddress: "Gulshan Avenue, Dhaka", emergencyContactName: "Arjun Nair", emergencyPhone: "+880 1700 000005", relation: "Spouse", bio: "HR manager driving people operations." },
  e6: { salutation: "Ms.", firstName: "Elena", lastName: "Vox", gender: "Female", dateOfBirth: "1990-12-15", maritalStatus: "Single", bloodGroup: "A-", company: "Acme Technologies Ltd.", branch: "London", grade: "G2 — Senior", holidayList: "2026 Holidays", salaryMode: "Bank", salaryCurrency: "BDT", ctc: 171000, bankName: "Barclays", bankAcno: "•••• 9021", companyEmail: "elena.vox@acme.test", personalEmail: "elena.vox@gmail.com", userId: "elena.vox@acme.test", offerDate: "2020-10-15", confirmationDate: "2021-05-30", noticeDays: 45, attendanceDeviceId: "BIO-0006", permanentAddress: "5 River Rd, London", currentAddress: "5 River Rd, London", emergencyContactName: "Sofia Vox", emergencyPhone: "+44 20 5550 122", relation: "Sibling", bio: "Design lead for the product org." },
  e7: { salutation: "Mr.", firstName: "Tom", lastName: "Becker", gender: "Male", dateOfBirth: "1983-06-21", maritalStatus: "Married", bloodGroup: "B-", company: "Acme Technologies Ltd.", branch: "San Francisco", grade: "G3 — Management", holidayList: "2026 Holidays", salaryMode: "Bank", salaryCurrency: "BDT", ctc: 192000, bankName: "Wells Fargo", bankAcno: "•••• 1180", companyEmail: "tom.becker@acme.test", personalEmail: "tom.becker@gmail.com", userId: "tom.becker@acme.test", offerDate: "2017-07-01", confirmationDate: "2018-02-14", noticeDays: 60, attendanceDeviceId: "BIO-0007", permanentAddress: "300 Market St, San Francisco, CA", currentAddress: "300 Market St, San Francisco, CA", emergencyContactName: "Grace Becker", emergencyPhone: "+1 202 555 0907", relation: "Spouse", bio: "Finance manager overseeing budgeting." },
  e8: { salutation: "Ms.", firstName: "Dana", lastName: "Cole", gender: "Female", dateOfBirth: "1991-03-30", maritalStatus: "Divorced", bloodGroup: "O+", company: "Acme Technologies Ltd.", branch: "London", grade: "G2 — Senior", holidayList: "2026 Holidays", salaryMode: "Bank", salaryCurrency: "BDT", ctc: 156000, bankName: "HSBC", bankAcno: "•••• 6642", companyEmail: "dana.cole@acme.test", personalEmail: "dana.cole@gmail.com", userId: "dana.cole@acme.test", offerDate: "2019-11-01", confirmationDate: "2020-06-02", noticeDays: 30, attendanceDeviceId: "BIO-0008", permanentAddress: "77 Oak Ln, London", currentAddress: "77 Oak Ln, London", emergencyContactName: "Ivy Cole", emergencyPhone: "+44 20 5550 128", relation: "Parent", bio: "Sales manager, enterprise accounts." },
  e9: { salutation: "Mr.", firstName: "Leo", lastName: "Martins", gender: "Male", dateOfBirth: "1994-08-08", maritalStatus: "Single", bloodGroup: "A+", company: "Acme Technologies Ltd.", branch: "Dhaka", grade: "G2 — Senior", holidayList: "2026 Holidays", salaryMode: "Bank", salaryCurrency: "BDT", ctc: 146000, bankName: "City Bank", bankAcno: "•••• 2205", companyEmail: "leo.martins@acme.test", personalEmail: "leo.martins@gmail.com", userId: "leo.martins@acme.test", offerDate: "2021-05-01", confirmationDate: "2021-12-15", noticeDays: 45, attendanceDeviceId: "BIO-0009", permanentAddress: "Banani DOHS, Dhaka", currentAddress: "Banani DOHS, Dhaka", emergencyContactName: "Ruth Martins", emergencyPhone: "+880 1700 000009", relation: "Sibling", bio: "Marketing lead, growth and brand." },
  e10: { salutation: "Ms.", firstName: "Nina", lastName: "Patel", gender: "Female", dateOfBirth: "1997-01-11", maritalStatus: "Single", bloodGroup: "B+", company: "Acme Technologies Ltd.", branch: "San Francisco", grade: "G1 — Individual", holidayList: "2026 Holidays", salaryMode: "Bank", salaryCurrency: "BDT", ctc: 127000, bankName: "Chase", bankAcno: "•••• 8890", companyEmail: "nina.patel@acme.test", personalEmail: "nina.patel@gmail.com", userId: "nina.patel@acme.test", offerDate: "2023-01-15", noticeDays: 30, attendanceDeviceId: "BIO-0010", permanentAddress: "14 Cedar St, San Jose, CA", currentAddress: "14 Cedar St, San Jose, CA", emergencyContactName: "Kiran Patel", emergencyPhone: "+1 202 555 0910", relation: "Parent", bio: "Software engineer, frontend." },
  e11: { salutation: "Mr.", firstName: "Owen", lastName: "Wright", gender: "Male", dateOfBirth: "1995-05-17", maritalStatus: "Married", bloodGroup: "O+", company: "Acme Technologies Ltd.", branch: "London", grade: "G1 — Individual", holidayList: "2026 Holidays", salaryMode: "Bank", salaryCurrency: "BDT", ctc: 98000, bankName: "Barclays", bankAcno: "•••• 3345", companyEmail: "owen.wright@acme.test", personalEmail: "owen.wright@gmail.com", userId: "owen.wright@acme.test", offerDate: "2022-03-01", confirmationDate: "2022-10-19", noticeDays: 30, attendanceDeviceId: "BIO-0011", permanentAddress: "9 Maple Ave, Manchester", currentAddress: "9 Maple Ave, Manchester", emergencyContactName: "Helen Wright", emergencyPhone: "+44 20 5550 131", relation: "Spouse", bio: "Sales executive." },
  e12: { salutation: "Ms.", firstName: "Yuki", lastName: "Tanaka", gender: "Female", dateOfBirth: "1998-10-05", maritalStatus: "Single", bloodGroup: "AB-", company: "Acme Technologies Ltd.", branch: "Dhaka", grade: "G1 — Individual", holidayList: "2026 Holidays", salaryMode: "Bank", salaryCurrency: "BDT", ctc: 119000, bankName: "BRAC Bank", bankAcno: "•••• 7712", companyEmail: "yuki.tanaka@acme.test", personalEmail: "yuki.tanaka@gmail.com", userId: "yuki.tanaka@acme.test", offerDate: "2023-08-01", noticeDays: 30, attendanceDeviceId: "BIO-0012", permanentAddress: "Uttara Sector 7, Dhaka", currentAddress: "Uttara Sector 7, Dhaka", emergencyContactName: "Hiro Tanaka", emergencyPhone: "+880 1700 000012", relation: "Parent", bio: "Product designer." },
};

export const employees: Employee[] = EMPLOYEE_BASE.map((e) => ({ ...e, ...EMPLOYEE_PROFILES[e.id] }));

// The signed-in user (UI stands in for future auth session)
export const currentUser = employees[4]; // Priya Nair — HR

export const leaveTypes: LeaveType[] = [
  { id: "l1", name: "Casual Leave", code: "CL", maxDays: 12, paid: true, carryForward: false },
  { id: "l2", name: "Sick Leave", code: "SL", maxDays: 8, paid: true, carryForward: false },
  { id: "l3", name: "Earned Leave", code: "EL", maxDays: 15, paid: true, carryForward: true },
  { id: "l4", name: "Privileged Leave", code: "PL", maxDays: 7, paid: true, carryForward: false },
  { id: "l5", name: "Unpaid Leave", code: "UL", maxDays: 30, paid: false, carryForward: false },
];

export const leaveApplications: LeaveApplication[] = [
  { id: "la1", employeeId: "EMP-0003", employeeName: "Aisha Khan", leaveType: "Casual Leave", from: "2026-09-24", to: "2026-09-25", days: 2, reason: "Personal errands", status: "Pending", appliedOn: "2026-09-19", approver: "Sarah Chen" },
  { id: "la2", employeeId: "EMP-0004", employeeName: "Diego Torres", leaveType: "Sick Leave", from: "2026-09-21", to: "2026-09-22", days: 2, reason: "Fever and recovery", status: "Pending", appliedOn: "2026-09-20", approver: "Sarah Chen" },
  { id: "la3", employeeId: "EMP-0010", employeeName: "Nina Patel", leaveType: "Earned Leave", from: "2026-10-05", to: "2026-10-12", days: 6, reason: "Family vacation", status: "Pending", appliedOn: "2026-09-18", approver: "Sarah Chen" },
  { id: "la4", employeeId: "EMP-0006", employeeName: "Elena Vox", leaveType: "Privileged Leave", from: "2026-09-10", to: "2026-09-11", days: 2, reason: "Relocation", status: "Approved", appliedOn: "2026-09-02", approver: "Marcus Reed" },
  { id: "la5", employeeId: "EMP-0009", employeeName: "Leo Martins", leaveType: "Casual Leave", from: "2026-09-08", to: "2026-09-08", days: 1, reason: "Personal day", status: "Rejected", appliedOn: "2026-09-05", approver: "Dana Cole" },
  { id: "la6", employeeId: "EMP-0012", employeeName: "Yuki Tanaka", leaveType: "Sick Leave", from: "2026-09-15", to: "2026-09-16", days: 2, reason: "Medical checkup", status: "Approved", appliedOn: "2026-09-12", approver: "Elena Vox" },
];

export const leaveBalances: LeaveBalance[] = [
  { leaveType: "Casual Leave", entitled: 12, used: 4, pending: 1, remaining: 7 },
  { leaveType: "Sick Leave", entitled: 8, used: 2, pending: 1, remaining: 5 },
  { leaveType: "Earned Leave", entitled: 15, used: 6, pending: 0, remaining: 9 },
  { leaveType: "Privileged Leave", entitled: 7, used: 1, pending: 0, remaining: 6 },
  { leaveType: "Unpaid Leave", entitled: 30, used: 0, pending: 0, remaining: 30 },
];

export const attendanceRecords: AttendanceRecord[] = [
  { id: "a1", date: "2026-09-21", employeeId: "EMP-0003", employeeName: "Aisha Khan", status: "Present", checkIn: "09:02", checkOut: "18:15", lateBy: "2m", workHours: 9.2 },
  { id: "a2", date: "2026-09-21", employeeId: "EMP-0004", employeeName: "Diego Torres", status: "Leave", checkIn: "—", checkOut: "—", lateBy: "—", workHours: 0 },
  { id: "a3", date: "2026-09-21", employeeId: "EMP-0010", employeeName: "Nina Patel", status: "Present", checkIn: "08:55", checkOut: "17:40", lateBy: "0m", workHours: 8.75 },
  { id: "a4", date: "2026-09-21", employeeId: "EMP-0006", employeeName: "Elena Vox", status: "Absent", checkIn: "—", checkOut: "—", lateBy: "—", workHours: 0 },
  { id: "a5", date: "2026-09-21", employeeId: "EMP-0009", employeeName: "Leo Martins", status: "Half Day", checkIn: "09:10", checkOut: "13:05", lateBy: "10m", workHours: 3.9 },
  { id: "a6", date: "2026-09-20", employeeId: "EMP-0003", employeeName: "Aisha Khan", status: "Present", checkIn: "09:00", checkOut: "18:05", lateBy: "0m", workHours: 9.0 },
  { id: "a7", date: "2026-09-20", employeeId: "EMP-0010", employeeName: "Nina Patel", status: "Present", checkIn: "09:34", checkOut: "18:20", lateBy: "34m", workHours: 8.75 },
  { id: "a8", date: "2026-09-20", employeeId: "EMP-0012", employeeName: "Yuki Tanaka", status: "Present", checkIn: "09:05", checkOut: "17:55", lateBy: "5m", workHours: 8.8 },
];

export const salaryStructures: SalaryStructure[] = [
  {
    id: "ss1", name: "Engineering — Senior", department: "Engineering", designation: "Senior Software Engineer", currency: "BDT",
    earnings: [ { name: "Basic Salary", amount: 8400 }, { name: "House Rent Allowance", amount: 2600 }, { name: "Special Allowance", amount: 1500 } ],
    deductions: [ { name: "Health Insurance", amount: 200 }, { name: "Provident Fund", amount: 600 } ],
  },
  {
    id: "ss2", name: "Engineering — Standard", department: "Engineering", designation: "Software Engineer", currency: "BDT",
    earnings: [ { name: "Basic Salary", amount: 6200 }, { name: "House Rent Allowance", amount: 1900 }, { name: "Special Allowance", amount: 1100 } ],
    deductions: [ { name: "Health Insurance", amount: 200 }, { name: "Provident Fund", amount: 450 } ],
  },
  {
    id: "ss3", name: "Sales — Executive", department: "Sales", designation: "Sales Executive", currency: "BDT",
    earnings: [ { name: "Basic Salary", amount: 4800 }, { name: "Commission", amount: 1200 }, { name: "Conveyance", amount: 350 } ],
    deductions: [ { name: "Health Insurance", amount: 150 }, { name: "Provident Fund", amount: 320 } ],
  },
];

export const salarySlips: SalarySlip[] = [
  { id: "sl1", employeeId: "EMP-0003", employeeName: "Aisha Khan", month: "September 2026", gross: 12500, deductions: 800, net: 11700, status: "Processing" },
  { id: "sl2", employeeId: "EMP-0001", employeeName: "Sarah Chen", month: "September 2026", gross: 14000, deductions: 900, net: 13100, status: "Processing" },
  { id: "sl3", employeeId: "EMP-0010", employeeName: "Nina Patel", month: "September 2026", gross: 9200, deductions: 650, net: 8550, status: "Draft" },
  { id: "sl4", employeeId: "EMP-0003", employeeName: "Aisha Khan", month: "August 2026", gross: 12500, deductions: 800, net: 11700, status: "Paid", publishedOn: "2026-08-31" },
  { id: "sl5", employeeId: "EMP-0008", employeeName: "Dana Cole", month: "August 2026", gross: 10000, deductions: 700, net: 9300, status: "Paid", publishedOn: "2026-08-31" },
];

export const expenseCategories = ["Travel", "Meals", "Software", "Equipment", "Accommodation", "Training", "Other"];

export const expenseClaims: ExpenseClaim[] = [
  { id: "x1", claimId: "EXP-0001", employeeId: "EMP-0008", employeeName: "Dana Cole", category: "Travel", description: "Client visit — flights", amount: 640, currency: "BDT", date: "2026-09-17", status: "Pending", approver: "Tom Becker" },
  { id: "x2", claimId: "EXP-0002", employeeId: "EMP-0003", employeeName: "Aisha Khan", category: "Software", description: "IDE license renewal", amount: 120, currency: "BDT", date: "2026-09-16", status: "Pending", approver: "Sarah Chen" },
  { id: "x3", claimId: "EXP-0003", employeeId: "EMP-0006", employeeName: "Elena Vox", category: "Equipment", description: "Drawing tablet", amount: 380, currency: "BDT", date: "2026-09-12", status: "Approved", approver: "Marcus Reed" },
  { id: "x4", claimId: "EXP-0004", employeeId: "EMP-0009", employeeName: "Leo Martins", category: "Meals", description: "Team offsite lunch", amount: 210, currency: "BDT", date: "2026-09-10", status: "Rejected", approver: "Sarah Chen" },
  { id: "x5", claimId: "EXP-0005", employeeId: "EMP-0010", employeeName: "Nina Patel", category: "Travel", description: "Airport taxi", amount: 55, currency: "BDT", date: "2026-09-05", status: "Paid", approver: "Sarah Chen" },
];

export const jobOpenings: JobOpening[] = [
  { id: "j1", title: "Senior Backend Engineer", department: "Engineering", location: "San Francisco", type: "Full-time", openings: 2, status: "Open", postedOn: "2026-09-01" },
  { id: "j2", title: "Product Designer", department: "Design", location: "Remote", type: "Full-time", openings: 1, status: "Open", postedOn: "2026-09-08" },
  { id: "j3", title: "HR Executive", department: "Human Resources", location: "San Francisco", type: "Full-time", openings: 1, status: "On Hold", postedOn: "2026-08-20" },
  { id: "j4", title: "Marketing Intern", department: "Marketing", location: "Remote", type: "Internship", openings: 3, status: "Open", postedOn: "2026-09-14" },
  { id: "j5", title: "Accountant", department: "Finance", location: "San Francisco", type: "Part-time", openings: 1, status: "Closed", postedOn: "2026-07-11" },
];

export const jobApplications: JobApplication[] = [
  { id: "ja1", applicantName: "Rachel Kim", email: "rachel.kim@mail.test", jobTitle: "Senior Backend Engineer", appliedOn: "2026-09-05", status: "Interview", source: "Website", rating: 4 },
  { id: "ja2", applicantName: "Samuel Ortiz", email: "samuel.ortiz@mail.test", jobTitle: "Senior Backend Engineer", appliedOn: "2026-09-07", status: "Screening", source: "Referral", rating: 3 },
  { id: "ja3", applicantName: "Grace Liu", email: "grace.liu@mail.test", jobTitle: "Product Designer", appliedOn: "2026-09-10", status: "Offered", source: "LinkedIn", rating: 5 },
  { id: "ja4", applicantName: "Ahmed Farouk", email: "ahmed.farouk@mail.test", jobTitle: "Marketing Intern", appliedOn: "2026-09-15", status: "Applied", source: "Website", rating: 0 },
  { id: "ja5", applicantName: "Beth Nolan", email: "beth.nolan@mail.test", jobTitle: "Product Designer", appliedOn: "2026-09-09", status: "Rejected", source: "Job Board", rating: 2 },
  { id: "ja6", applicantName: "Chirag Mehta", email: "chirag.mehta@mail.test", jobTitle: "Senior Backend Engineer", appliedOn: "2026-09-12", status: "Hired", source: "Referral", rating: 5 },
];

export const appraisals: Appraisal[] = [
  { id: "ap1", employeeId: "EMP-0003", employeeName: "Aisha Khan", cycle: "H2 2026", department: "Engineering", selfRating: 4, managerRating: 4, finalScore: 88, status: "Awaiting Review", dueOn: "2026-09-30" },
  { id: "ap2", employeeId: "EMP-0010", employeeName: "Nina Patel", cycle: "H2 2026", department: "Engineering", selfRating: 3, managerRating: 0, finalScore: 0, status: "In Progress", dueOn: "2026-09-30" },
  { id: "ap3", employeeId: "EMP-0009", employeeName: "Leo Martins", cycle: "H2 2026", department: "Marketing", selfRating: 5, managerRating: 4, finalScore: 92, status: "Completed", dueOn: "2026-09-15" },
  { id: "ap4", employeeId: "EMP-0012", employeeName: "Yuki Tanaka", cycle: "H2 2026", department: "Design", selfRating: 0, managerRating: 0, finalScore: 0, status: "Not Started", dueOn: "2026-10-15" },
];

export const goals: Goal[] = [
  { id: "go1", title: "Reduce API p95 latency", employeeName: "Aisha Khan", department: "Engineering", kpi: "Latency", target: 200, current: 240, unit: "ms", status: "At Risk", dueOn: "2026-12-31" },
  { id: "go2", title: "Ship mobile beta", employeeName: "Sarah Chen", department: "Engineering", kpi: "Milestones", target: 6, current: 5, unit: "done", status: "On Track", dueOn: "2026-11-30" },
  { id: "go3", title: "Hire 5 engineers", employeeName: "Priya Nair", department: "Human Resources", kpi: "Hires", target: 5, current: 5, unit: "hired", status: "Achieved", dueOn: "2026-09-30" },
  { id: "go4", title: "Q3 revenue target", employeeName: "Dana Cole", department: "Sales", kpi: "Revenue", target: 900000, current: 640000, unit: "BDT", status: "At Risk", dueOn: "2026-09-30" },
  { id: "go5", title: "Launch brand campaign", employeeName: "Leo Martins", department: "Marketing", kpi: "Reach", target: 250000, current: 260000, unit: "views", status: "Achieved", dueOn: "2026-09-20" },
];

// --- Helpers -----------------------------------------------------------------

export const fmtMoney = (n: number, _currency = "BDT") =>
  `৳${new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(n)}`;

export const fmtDate = (iso: string) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" });
};

export const getEmployee = (id: string) => employees.find((e) => e.id === id || e.employeeId === id);
