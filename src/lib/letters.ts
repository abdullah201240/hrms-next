import type { LucideIcon } from "lucide-react";
import {
  FileCheck,
  UserCheck,
  CheckCircle2,
  Calendar,
  TrendingUp,
  ArrowRightLeft,
  Coins,
  AlertTriangle,
  Ban,
  Award,
  LogOut,
  ShieldCheck,
} from "lucide-react";

/**
 * Letters domain config — the hrms-next port of the reference HR letter module.
 * All 17 letter types, their categories, colours, dynamic template fields, the
 * default subject and the opening body paragraph are reproduced here so the
 * create form and the print templates share a single source of truth.
 */

export type LetterCategory = "hiring" | "employment" | "discipline" | "exit" | "general";
export type LetterStatus = "Draft" | "Sent" | "Signed" | "Archived";

export interface HRLetter {
  id: string;
  type: string;
  employeeId: string;
  employeeIdCode: string;
  employeeName: string;
  employeeEmail: string;
  employeeDepartment: string;
  employeeDesignation: string;
  subject: string;
  issueDate: string;
  effectiveDate: string;
  status: LetterStatus;
  body: string;
  fields: Record<string, string>;
  createdBy: string;
  createdAt: string;
}

export interface LetterTypeConfig {
  id: string;
  name: string;
  category: LetterCategory;
  icon: LucideIcon;
  /** Tailwind text colour for the icon (used on chips / badges). */
  color: string;
  /** Tailwind tinted background for the icon chip. */
  bgColor: string;
  description: string;
  templateFields: string[];
  /** Which print template renders this type (defaults to the generic letter). */
  template: LetterTemplateKey;
}

export type LetterTemplateKey =
  | "offer"
  | "appointment"
  | "confirmation"
  | "promotion"
  | "salary"
  | "relieving"
  | "warning"
  | "first-warning"
  | "final-warning"
  | "suspension"
  | "domestic-inquiry"
  | "inquiry-committee"
  | "default";

export const LETTER_CATEGORIES: LetterCategory[] = ["hiring", "employment", "discipline", "exit", "general"];

export function getCategoryLabel(cat: LetterCategory): string {
  switch (cat) {
    case "hiring":
      return "Hiring & Offers";
    case "employment":
      return "Employment Terms";
    case "discipline":
      return "Disciplinary";
    case "exit":
      return "Separation & Offboarding";
    default:
      return "General Records";
  }
}

export function getCategoryShort(cat: LetterCategory): string {
  switch (cat) {
    case "hiring":
      return "Hiring";
    case "employment":
      return "Employment";
    case "discipline":
      return "Discipline";
    case "exit":
      return "Exit";
    default:
      return "General";
  }
}

/** camelCase field key → "Human Readable" label (mirrors the reference renderer). */
export function labelize(field: string): string {
  return field
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (c) => c.toUpperCase())
    .trim();
}

/** The 17 letter types, grouped in the sidebar order hiring → general. */
export const LETTER_TYPES: LetterTypeConfig[] = [
  {
    id: "offer",
    name: "Offer Letter",
    category: "hiring",
    icon: FileCheck,
    color: "text-emerald-600",
    bgColor: "bg-emerald-500/10",
    description: "Job offer with terms and conditions",
    templateFields: ["presentAddress", "designation", "department", "employmentType", "reportingTo", "dutyStation", "proposedJoiningDate", "monthlyGrossSalary", "offerExpiryDate"],
    template: "offer",
  },
  {
    id: "appointment",
    name: "Appointment Letter",
    category: "hiring",
    icon: UserCheck,
    color: "text-sky-600",
    bgColor: "bg-sky-500/10",
    description: "Official appointment confirmation",
    templateFields: ["presentAddress", "designation", "department", "startDate", "offerLetterDate", "reportingManager", "officeLocation", "salary"],
    template: "appointment",
  },
  {
    id: "confirmation",
    name: "Confirmation Letter",
    category: "employment",
    icon: CheckCircle2,
    color: "text-emerald-600",
    bgColor: "bg-emerald-500/10",
    description: "Post-probation employment confirmation",
    templateFields: ["confirmedDesignation", "department", "reportingTo", "workLocation"],
    template: "confirmation",
  },
  {
    id: "probation_extension",
    name: "Probation Extension",
    category: "employment",
    icon: Calendar,
    color: "text-amber-600",
    bgColor: "bg-amber-500/10",
    description: "Extend probation period",
    templateFields: ["reason", "extensionDuration", "newEndDate"],
    template: "default",
  },
  {
    id: "promotion",
    name: "Promotion Letter",
    category: "employment",
    icon: TrendingUp,
    color: "text-violet-600",
    bgColor: "bg-violet-500/10",
    description: "Employee promotion notification",
    templateFields: ["currentDesignation", "newDesignation", "currentGrade", "newGrade", "currentReportingTo", "newReportingTo", "currentGrossSalary", "revGrossSalary", "revBasic", "revHouseRent", "revMedical", "revConveyance", "revOtherAllowance"],
    template: "promotion",
  },
  {
    id: "transfer",
    name: "Transfer Letter",
    category: "employment",
    icon: ArrowRightLeft,
    color: "text-blue-600",
    bgColor: "bg-blue-500/10",
    description: "Role or location transfer",
    templateFields: ["fromLocation", "toLocation", "fromRole", "toRole", "effectiveDate"],
    template: "default",
  },
  {
    id: "salary_increment",
    name: "Salary Revision",
    category: "employment",
    icon: Coins,
    color: "text-emerald-600",
    bgColor: "bg-emerald-500/10",
    description: "Salary revision notification",
    templateFields: ["reasonForRevision", "prevBasic", "revBasic", "prevHouseRent", "revHouseRent", "prevMedical", "revMedical", "prevConveyance", "revConveyance", "prevOtherAllowance", "revOtherAllowance", "prevGross", "revGross"],
    template: "salary",
  },
  {
    id: "warning",
    name: "Show Cause Notice",
    category: "discipline",
    icon: AlertTriangle,
    color: "text-amber-600",
    bgColor: "bg-amber-500/10",
    description: "Disciplinary show cause notice",
    templateFields: ["incidentDate", "incidentLocation", "relevantPolicy", "description", "deadline"],
    template: "warning",
  },
  {
    id: "first_warning",
    name: "First Written Warning",
    category: "discipline",
    icon: AlertTriangle,
    color: "text-amber-600",
    bgColor: "bg-amber-500/10",
    description: "First written warning letter",
    templateFields: ["incidentDate", "incidentLocation", "description", "previousCounseling", "policyBreach"],
    template: "first-warning",
  },
  {
    id: "final_warning",
    name: "Final Written Warning",
    category: "discipline",
    icon: AlertTriangle,
    color: "text-amber-600",
    bgColor: "bg-amber-500/10",
    description: "Final written warning letter",
    templateFields: ["previousWarningDate", "incidentDate", "incidentLocation", "description", "verbalCounselingDate", "firstWarningDate", "employeeExplanationDate", "policyViolated"],
    template: "final-warning",
  },
  {
    id: "suspension",
    name: "Suspension Pending Investigation",
    category: "discipline",
    icon: Ban,
    color: "text-amber-600",
    bgColor: "bg-amber-500/10",
    description: "Suspension pending investigation letter",
    templateFields: ["incidentDate", "natureOfAllegation", "reasonForSuspension"],
    template: "suspension",
  },
  {
    id: "domestic_inquiry",
    name: "Domestic Inquiry Notice",
    category: "discipline",
    icon: ShieldCheck,
    color: "text-amber-600",
    bgColor: "bg-amber-500/10",
    description: "Notice to attend domestic inquiry",
    templateFields: ["explanationDate", "incidentDate", "incidentLocation", "summaryOfAllegation", "inquiryDate", "inquiryTime", "inquiryVenue", "inquiryOfficer"],
    template: "domestic-inquiry",
  },
  {
    id: "inquiry_committee",
    name: "Inquiry Committee Appointment",
    category: "discipline",
    icon: ShieldCheck,
    color: "text-amber-600",
    bgColor: "bg-amber-500/10",
    description: "Inquiry committee appointment letter",
    templateFields: ["committeeMemberDesignation", "accusedEmployeeName", "accusedEmployeeId", "briefAllegation", "committeeChair", "committeeMembers", "reportDueDate"],
    template: "inquiry-committee",
  },
  {
    id: "termination",
    name: "Termination Letter",
    category: "discipline",
    icon: Ban,
    color: "text-red-600",
    bgColor: "bg-red-500/10",
    description: "Employment termination notice",
    templateFields: ["reason", "lastWorkingDay", "severanceDetails"],
    template: "default",
  },
  {
    id: "experience",
    name: "Experience Letter",
    category: "exit",
    icon: Award,
    color: "text-indigo-600",
    bgColor: "bg-indigo-500/10",
    description: "Employment experience certificate",
    templateFields: ["joiningDate", "relievingDate", "designation", "responsibilities"],
    template: "default",
  },
  {
    id: "relieving",
    name: "Resignation Acceptance",
    category: "exit",
    icon: LogOut,
    color: "text-slate-600",
    bgColor: "bg-slate-500/10",
    description: "Resignation acceptance and relieving",
    templateFields: ["resignationDate", "noticePeriod", "lastWorkingDay", "reasonForLeaving", "reportingManager"],
    template: "relieving",
  },
  {
    id: "proof_of_employment",
    name: "Proof of Employment",
    category: "general",
    icon: ShieldCheck,
    color: "text-teal-600",
    bgColor: "bg-teal-500/10",
    description: "Employment verification document",
    templateFields: ["designation", "salary", "joiningDate", "employmentType"],
    template: "default",
  },
];

export function getLetterType(typeId: string): LetterTypeConfig | undefined {
  return LETTER_TYPES.find((t) => t.id === typeId);
}

/** Fields whose input should be a date picker. */
export function isDateField(field: string): boolean {
  const f = field.toLowerCase();
  return (f.includes("date") || f.includes("deadline")) && field !== "incidentDate" && field !== "deadline";
}

/** Designation-style fields rendered as free text here (no designation master in the letters module). */
export function designationLikeFields(): string[] {
  return ["designation", "confirmedDesignation", "oldDesignation", "newDesignation", "fromRole", "toRole", "currentDesignation"];
}

/** The subject auto-filled when a type is chosen (mirrors the reference form). */
export function defaultSubject(cfg: LetterTypeConfig): string {
  switch (cfg.id) {
    case "relieving":
      return "Acceptance of Resignation";
    case "confirmation":
      return "Confirmation of Employment";
    case "offer":
      return "Offer of Employment";
    case "inquiry_committee":
      return "Appointment as Inquiry Officer / Member of Inquiry Committee";
    case "domestic_inquiry":
      return "Notice to Attend Domestic Inquiry";
    case "suspension":
      return "Suspension Pending Investigation";
    case "final_warning":
      return "Final Written Warning";
    case "first_warning":
      return "First Written Warning";
    case "salary_increment":
      return "Salary Revision";
    case "promotion":
      return "Promotion and Revision of Compensation";
    default:
      return `Official Correspondence: ${cfg.name}`;
  }
}

/**
 * The opening body paragraph pre-filled for a type. `empName` and `effDate`
 * are the resolved employee name / effective date; `f` is the fields bag so
 * placeholders can pull from what the user has typed so far.
 */
export function defaultBody(cfg: LetterTypeConfig, empName: string, effDate: string, f: Record<string, string>): string {
  const name = empName || "[Employee Name]";
  const long = (iso: string) => (iso ? new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "");
  switch (cfg.id) {
    case "offer":
      return `Following the selection process and our subsequent discussions, we are pleased to offer you employment with {COMPANY} for the position of ${f.designation || "[Designation]"}.`;
    case "appointment":
      return `We are pleased to appoint you as ${f.designation || "[Designation]"} in the ${f.department || "[Department Name]"} of {COMPANY} effective from ${f.startDate || "[Joining Date]"}. Your appointment is made based on your acceptance of our Offer Letter dated ${f.offerLetterDate || "[Offer Letter Date]"} and is governed by the following terms and conditions.`;
    case "confirmation":
      return `We are pleased to inform you that, following the successful completion of your probationary period and a satisfactory performance evaluation, your employment with {COMPANY} is hereby confirmed.`;
    case "relieving":
      return `We acknowledge receipt of your resignation letter dated ${f.resignationDate || "[Resignation Date]"}. After due consideration, Management has accepted your resignation from the position of ${f.designation || "[Designation]"} with effect from ${f.lastWorkingDay || "[Last Working Date]"}.`;
    case "inquiry_committee":
      return `You are hereby appointed as the Inquiry Officer / a member of the Inquiry Committee to conduct a domestic inquiry regarding the alleged misconduct involving ${f.accusedEmployeeName || "[Employee Name]"}, Employee ID ${f.accusedEmployeeId || "[ID]"}.`;
    case "domestic_inquiry":
      return `Following the preliminary investigation into the alleged misconduct and after consideration of your written explanation dated ${long(f.explanationDate) || "[Explanation Date]"} (or your failure to submit an explanation within the stipulated time), Management has decided to conduct a Domestic Inquiry to determine the facts of the matter before any disciplinary decision is made.`;
    case "suspension":
      return `Following a preliminary assessment of an alleged incident that may constitute serious misconduct, the Company has decided to place you under suspension pending completion of an investigation and/or domestic inquiry. This action is administrative in nature and shall not be construed as a finding of guilt.`;
    case "final_warning":
      return `Despite previous counseling and/or the First Written Warning issued on ${long(f.previousWarningDate) || "[Date]"}, it has been observed that satisfactory improvement has not been achieved, or a similar incident has reoccurred. Accordingly, this letter serves as your Final Written Warning.`;
    case "first_warning":
      return `This letter serves as a First Written Warning regarding the matter described below.`;
    case "warning":
      return `It has been reported that you were allegedly involved in the following incident(s), which, if established, may constitute misconduct and/or a breach of the Company's HR Policy, Code of Conduct and/or your terms of employment.`;
    case "promotion":
      return `We are pleased to inform you that, in recognition of your performance, commitment, and contribution to {COMPANY}, Management has approved your promotion and revision of compensation with effect from ${long(effDate) || "[Effective Date]"}.`;
    case "salary_increment":
      return `We are pleased to inform you that Management has approved a revision of your monthly salary in recognition of ${f.reasonForRevision || "[Annual Performance / Exceptional Performance / Market Salary Adjustment / Retention / Special Achievement / Other]"}. The revised salary shall be effective from ${long(effDate) || "[Effective Date]"}.`;
    case "experience":
      return `TO WHOM IT MAY CONCERN\n\nThis is to certify that ${name} was employed with us as a ${f.designation || "[Designation]"} from ${f.joiningDate || "[Joining Date]"} to ${f.relievingDate || "[Relieving Date]"}.\n\nDuring their tenure, they demonstrated excellent professional commitment. We wish them success in their future endeavors.`;
    default:
      return `Dear ${name},\n\nThis letter is to confirm official updates regarding your employment records at {COMPANY}.\n\nPlease feel free to contact HR if you have any questions.`;
  }
}
