import { employees, currentUser } from "./data";
import type { HRLetter, LetterStatus } from "@/lib/letters";

/**
 * Seed HR letters for the Letters module. Employee name / department /
 * designation / email are resolved from the shared Acme employee master so the
 * records stay consistent with the rest of the app. The bodies mirror the
 * reference letter module's wording, restated for {COMPANY}.
 */

const COMPANY = "Acme Technologies Ltd.";
const HR = currentUser?.name ?? "HR Admin";

type Seed = {
  id: string;
  type: string;
  employeeId: string;
  subject: string;
  issueDate: string;
  effectiveDate: string;
  status: LetterStatus;
  body: string;
  fields: Record<string, string>;
};

const SEEDS: Seed[] = [
  {
    id: "LTR-2026-0001",
    type: "offer",
    employeeId: "e4",
    subject: "Offer of Employment",
    issueDate: "2026-08-10",
    effectiveDate: "2026-08-20",
    status: "Signed",
    body: `Following the selection process and our subsequent discussions, we are pleased to offer you employment with ${COMPANY} for the position of Software Engineer.`,
    fields: {
      presentAddress: "88 Elm Ave, Austin, TX",
      designation: "Software Engineer",
      department: "Engineering",
      employmentType: "Permanent",
      reportingTo: "Sarah Chen",
      dutyStation: "San Francisco",
      proposedJoiningDate: "2026-09-05",
      monthlyGrossSalary: "86,000",
      offerExpiryDate: "2026-08-31",
      signatoryName: HR,
      signatoryDesignation: "HR Manager",
    },
  },
  {
    id: "LTR-2026-0002",
    type: "appointment",
    employeeId: "e4",
    subject: "Appointment as Software Engineer",
    issueDate: "2026-09-05",
    effectiveDate: "2026-09-05",
    status: "Signed",
    body: `We are pleased to appoint you as Software Engineer in the Engineering of ${COMPANY} effective from 05 Sep 2026. Your appointment is made based on your acceptance of our Offer Letter dated 10 Aug 2026 and is governed by the following terms and conditions.`,
    fields: {
      presentAddress: "88 Elm Ave, Austin, TX",
      designation: "Software Engineer",
      department: "Engineering",
      startDate: "2026-09-05",
      offerLetterDate: "2026-08-10",
      reportingManager: "Sarah Chen",
      officeLocation: "San Francisco",
      salary: "86,000",
      signatoryName: HR,
      signatoryDesignation: "Managing Director",
    },
  },
  {
    id: "LTR-2026-0003",
    type: "confirmation",
    employeeId: "e3",
    subject: "Confirmation of Employment",
    issueDate: "2026-07-18",
    effectiveDate: "2026-07-18",
    status: "Signed",
    body: `We are pleased to inform you that, following the successful completion of your probationary period and a satisfactory performance evaluation, your employment with ${COMPANY} is hereby confirmed.`,
    fields: {
      confirmedDesignation: "Senior Software Engineer",
      department: "Engineering",
      reportingTo: "Sarah Chen",
      workLocation: "San Francisco",
      signatoryName: HR,
      signatoryDesignation: "Managing Director",
    },
  },
  {
    id: "LTR-2026-0004",
    type: "promotion",
    employeeId: "e6",
    subject: "Promotion and Revision of Compensation",
    issueDate: "2026-06-01",
    effectiveDate: "2026-07-01",
    status: "Sent",
    body: `We are pleased to inform you that, in recognition of your performance, commitment, and contribution to ${COMPANY}, Management has approved your promotion and revision of compensation with effect from 01 Jul 2026.`,
    fields: {
      currentDesignation: "Product Designer",
      newDesignation: "Design Lead",
      currentGrade: "G1 — Individual",
      newGrade: "G2 — Senior",
      currentReportingTo: "VP Product",
      newReportingTo: "VP Product",
      currentGrossSalary: "110,000",
      revGrossSalary: "132,000",
      revBasic: "66,000",
      revHouseRent: "33,000",
      revMedical: "13,200",
      revConveyance: "7,920",
      revOtherAllowance: "11,880",
      signatoryName: HR,
      signatoryDesignation: "Managing Director",
    },
  },
  {
    id: "LTR-2026-0005",
    type: "salary_increment",
    employeeId: "e10",
    subject: "Salary Revision",
    issueDate: "2026-04-01",
    effectiveDate: "2026-05-01",
    status: "Signed",
    body: `We are pleased to inform you that Management has approved a revision of your monthly salary in recognition of Exceptional Performance. The revised salary shall be effective from 01 May 2026.`,
    fields: {
      reasonForRevision: "Exceptional Performance",
      prevBasic: "49,000",
      revBasic: "55,000",
      prevHouseRent: "24,500",
      revHouseRent: "27,500",
      prevMedical: "9,800",
      revMedical: "11,000",
      prevConveyance: "4,900",
      revConveyance: "5,500",
      prevOtherAllowance: "9,800",
      revOtherAllowance: "11,000",
      prevGross: "98,000",
      revGross: "110,000",
      signatoryName: HR,
      signatoryDesignation: "Managing Director",
    },
  },
  {
    id: "LTR-2026-0006",
    type: "relieving",
    employeeId: "e8",
    subject: "Acceptance of Resignation",
    issueDate: "2026-05-20",
    effectiveDate: "2026-06-30",
    status: "Sent",
    body: `We acknowledge receipt of your resignation letter dated 20 May 2026. After due consideration, Management has accepted your resignation from the position of Sales Manager with effect from 30 Jun 2026.`,
    fields: {
      resignationDate: "2026-05-20",
      noticePeriod: "30 days",
      lastWorkingDay: "2026-06-30",
      reasonForLeaving: "Better opportunity",
      reportingManager: "CRO",
      signatoryName: HR,
      signatoryDesignation: "Human Resources",
    },
  },
  {
    id: "LTR-2026-0007",
    type: "warning",
    employeeId: "e11",
    subject: "Show Cause Notice",
    issueDate: "2026-03-05",
    effectiveDate: "2026-03-05",
    status: "Sent",
    body: `It has been reported that you were allegedly involved in the following incident(s), which, if established, may constitute misconduct and/or a breach of the Company's HR Policy, Code of Conduct and/or your terms of employment.`,
    fields: {
      incidentDate: "2026-03-01",
      incidentLocation: "Client site, Manchester",
      relevantPolicy: "Code of Conduct — Clause 7.2 (Company Property)",
      description: "Company laptop issued to you was not returned upon request despite two written reminders.",
      deadline: "2026-03-12",
      signatoryName: HR,
      signatoryDesignation: "Human Resources",
    },
  },
  {
    id: "LTR-2026-0008",
    type: "suspension",
    employeeId: "e9",
    subject: "Suspension Pending Investigation",
    issueDate: "2026-02-15",
    effectiveDate: "2026-02-16",
    status: "Draft",
    body: `Following a preliminary assessment of an alleged incident that may constitute serious misconduct, the Company has decided to place you under suspension pending completion of an investigation and/or domestic inquiry. This action is administrative in nature and shall not be construed as a finding of guilt.`,
    fields: {
      incidentDate: "2026-02-12",
      natureOfAllegation: "Unauthorised disclosure of campaign budget",
      reasonForSuspension: "To allow an impartial investigation to be completed",
      signatoryName: HR,
      signatoryDesignation: "Human Resources",
    },
  },
  {
    id: "LTR-2026-0009",
    type: "experience",
    employeeId: "e11",
    subject: "Experience Certificate",
    issueDate: "2026-06-30",
    effectiveDate: "2026-06-30",
    status: "Signed",
    body: `TO WHOM IT MAY CONCERN\n\nThis is to certify that Owen Wright was employed with us as a Sales Executive from 19 Apr 2022 to 30 Jun 2026.\n\nDuring their tenure, they demonstrated excellent professional commitment. We wish them success in their future endeavors.`,
    fields: {
      joiningDate: "2022-04-19",
      relievingDate: "2026-06-30",
      designation: "Sales Executive",
      responsibilities: "Managed enterprise accounts across the North region.",
      signatoryName: HR,
      signatoryDesignation: "Human Resources Department",
    },
  },
  {
    id: "LTR-2026-0010",
    type: "proof_of_employment",
    employeeId: "e2",
    subject: "Proof of Employment",
    issueDate: "2026-09-01",
    effectiveDate: "2026-09-01",
    status: "Signed",
    body: `This is to certify that ${findName("e2")} is a bona fide employee of ${COMPANY}, currently serving as Product Manager. This letter is issued upon the employee's request for whatever purpose it may serve.`,
    fields: {
      designation: "Product Manager",
      salary: "118,000",
      joiningDate: "2020-07-01",
      employmentType: "Permanent",
      signatoryName: HR,
      signatoryDesignation: "Human Resources Department",
    },
  },
];

function findName(id: string): string {
  return employees.find((e) => e.id === id)?.name ?? "Employee";
}

export const issuedLetters: HRLetter[] = SEEDS.map((s) => {
  const emp = employees.find((e) => e.id === s.employeeId);
  return {
    id: s.id,
    type: s.type,
    employeeId: s.employeeId,
    employeeIdCode: emp?.employeeId ?? "—",
    employeeName: emp?.name ?? "Employee",
    employeeEmail: emp?.email ?? "",
    employeeDepartment: emp?.department ?? "—",
    employeeDesignation: emp?.designation ?? "—",
    subject: s.subject,
    issueDate: s.issueDate,
    effectiveDate: s.effectiveDate,
    status: s.status,
    body: s.body,
    fields: s.fields,
    createdBy: HR,
    createdAt: s.issueDate,
  } satisfies HRLetter;
});
