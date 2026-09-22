import type { HRLetter } from "@/lib/letters";
import { pdate } from "@/components/shared/print/sheet";
import {
  COMPANY,
  fv,
  signatory,
  LetterPaper,
  LetterHead,
  Subject,
  Salutation,
  Body,
  H3,
  KVTable,
  BorderedText,
  BulletList,
  PageBreak,
  SignBlock,
  AckBlock,
} from "./paper";

/**
 * Disciplinary letter templates — the hrms-next port of the reference module's
 * show-cause / warning / suspension / inquiry letters. Wording preserved,
 * letterhead & signatory driven from the shared `company` mock.
 */

function ToHead({ letter, designation }: { letter: HRLetter; designation?: string }) {
  return (
    <div className="mb-4 text-[12px]">
      <div className="text-[11px] font-semibold uppercase tracking-wide text-neutral-500">To</div>
      <div className="font-bold text-neutral-900">{letter.employeeName}</div>
      <div className="text-neutral-700">
        <span className="font-semibold">Employee ID: </span>
        <span className="font-normal">{letter.employeeIdCode || "—"}</span>
      </div>
      <div className="text-neutral-700">
        <span className="font-semibold">Designation: </span>
        <span className="font-normal">{designation || letter.employeeDesignation || fv(letter, "designation") || "—"}</span>
      </div>
      <div className="text-neutral-700">
        <span className="font-semibold">Department: </span>
        <span className="font-normal">{letter.employeeDepartment || fv(letter, "department") || "—"}</span>
      </div>
    </div>
  );
}

const kv = (k: string, v: React.ReactNode) => (
  <p className="text-neutral-700">
    <span className="font-semibold">{k}: </span>
    <span className="font-normal">{v || "—"}</span>
  </p>
);

/* ------------------------------------------------------ Show Cause (warn) */
export function WarningLetter({ letter }: { letter: HRLetter }) {
  const deadline = fv(letter, "deadline");
  return (
    <LetterPaper>
      <LetterHead letter={letter} title="Show Cause Notice" />
      <ToHead letter={letter} />
      <Subject>Show Cause Notice</Subject>
      <Salutation letter={letter} />
      <Body text={letter.body} />

      <H3>Details of Alleged Misconduct</H3>
      {kv("Date & Time", fv(letter, "incidentDate"))}
      {kv("Location", fv(letter, "incidentLocation"))}
      <p className="mt-2 font-semibold">Description:</p>
      <BorderedText>{fv(letter, "description") || letter.body || "—"}</BorderedText>

      <H3>Relevant Policy / Rule</H3>
      <p className="mb-3 whitespace-pre-line">{fv(letter, "relevantPolicy") || "—"}</p>

      <H3>Explanation Required</H3>
      <p className="mb-2">You are hereby required to submit your written explanation as to why disciplinary action should not be taken against you regarding the above matter.</p>
      <p>
        Your written explanation must reach the Human Resources Department on or before <span className="font-semibold">{deadline || "—"}</span>. If you fail to submit your explanation within the stipulated time without a reasonable cause, the Company may proceed with the matter and make a decision based on the information available.
      </p>

      <PageBreak />
      <H3>No Presumption of Guilt</H3>
      <p className="mb-2">This Show Cause Notice is issued to provide you with an opportunity to explain your position. No final decision has been made regarding this matter.</p>
      <p className="mb-4">You are expected to continue performing your duties and comply with all Company policies during this process unless otherwise instructed.</p>
      <SignBlock letter={letter} designation={signatory(letter).designation === "Authorised Signatory" ? "Human Resources / Managing Director" : undefined} />
      <AckBlock letter={letter} title="Acknowledgement of Receipt" />
      <p className="-mt-24 mb-4">I acknowledge receipt of this Show Cause Notice.</p>
    </LetterPaper>
  );
}

/* ------------------------------------------------------- First Warning */
export function FirstWarningLetter({ letter }: { letter: HRLetter }) {
  return (
    <LetterPaper>
      <LetterHead letter={letter} title="First Written Warning Letter" />
      <ToHead letter={letter} />
      <Subject>First Written Warning</Subject>
      <Salutation letter={letter} />
      <Body text={letter.body} />

      <H3>Details of the Incident</H3>
      {kv("Date of Incident", fv(letter, "incidentDate"))}
      {kv("Location", fv(letter, "incidentLocation"))}
      <p className="mt-2 font-semibold">Description:</p>
      <BorderedText>{fv(letter, "description") || letter.body || "—"}</BorderedText>

      <H3>Previous Counseling (if any)</H3>
      <p className="mb-2 whitespace-pre-line">{fv(letter, "previousCounseling") || "—"}</p>
      <H3>Policy Breach</H3>
      <p className="mb-2 whitespace-pre-line">{fv(letter, "policyBreach") || "—"}</p>
      <H3>Required Improvement</H3>
      <p className="mb-2">You are expected to immediately correct your conduct and comply with all Company policies. Failure to demonstrate sustained improvement or repetition of similar misconduct may result in further disciplinary action, including a Final Written Warning, suspension pending investigation, domestic inquiry, or any other action permitted under the Company&apos;s HR Policy and applicable laws.</p>
      <p className="mb-4 font-semibold">Please treat this matter seriously and ensure that such incidents do not recur.</p>

      <PageBreak />
      <SignBlock letter={letter} designation={signatory(letter).designation === "Authorised Signatory" ? "Human Resources" : undefined} />
      <AckBlock letter={letter} title="Employee Acknowledgement" />
      <p className="-mt-24 mb-4">I acknowledge receipt of this First Written Warning Letter.</p>
    </LetterPaper>
  );
}

/* -------------------------------------------------------- Final Warning */
export function FinalWarningLetter({ letter }: { letter: HRLetter }) {
  const vc = fv(letter, "verbalCounselingDate");
  const fw = fv(letter, "firstWarningDate");
  const ex = fv(letter, "employeeExplanationDate");
  return (
    <LetterPaper>
      <LetterHead letter={letter} title="Final Written Warning Letter" />
      <ToHead letter={letter} />
      <Subject>Final Written Warning</Subject>
      <Salutation letter={letter} />
      <Body text={letter.body} />

      <H3>Details of Misconduct / Performance Concern</H3>
      {kv("Date(s) of Incident", fv(letter, "incidentDate"))}
      {kv("Location", fv(letter, "incidentLocation"))}
      <p className="mt-2 font-semibold">Description:</p>
      <BorderedText>{fv(letter, "description") || letter.body || "—"}</BorderedText>

      <H3>Previous Disciplinary Action</H3>
      <BulletList
        items={[
          <><span className="font-semibold">Verbal Counseling (if applicable):</span> {vc ? pdate(vc) : "—"}</>,
          <><span className="font-semibold">First Written Warning:</span> {fw ? pdate(fw) : "—"}</>,
          <><span className="font-semibold">Employee Explanation (if applicable):</span> {ex ? pdate(ex) : "—"}</>,
        ]}
      />
      <H3>Policy / Rule Violated</H3>
      <p className="mb-2 whitespace-pre-line">{fv(letter, "policyViolated") || "—"}</p>
      <H3>Required Corrective Action</H3>
      <p>You are required to demonstrate immediate and sustained improvement in your conduct, attendance, performance, and compliance with Company policies. Failure to do so, or any further misconduct of a similar or serious nature, may result in disciplinary action including suspension pending investigation, domestic inquiry, termination of employment, or any other action permitted under the Company&apos;s HR Policy and applicable laws.</p>

      <PageBreak />
      <H3>Employee Support</H3>
      <p className="mb-4">If you require clarification regarding the expectations outlined in this letter or need guidance to improve your performance or conduct, you are encouraged to discuss the matter with your Reporting Manager or the Human Resources Department.</p>
      <SignBlock letter={letter} designation={signatory(letter).designation === "Authorised Signatory" ? "Human Resources" : undefined} />
      <AckBlock letter={letter} title="Employee Acknowledgement" />
      <p className="-mt-24 mb-4">I acknowledge receipt of this Final Written Warning Letter.</p>
    </LetterPaper>
  );
}

/* ----------------------------------------------------------- Suspension */
export function SuspensionLetter({ letter }: { letter: HRLetter }) {
  const eff = letter.effectiveDate ? pdate(letter.effectiveDate) : "—";
  return (
    <LetterPaper>
      <LetterHead letter={letter} title="Suspension Pending Investigation" />
      <ToHead letter={letter} />
      <Subject>Suspension Pending Investigation</Subject>
      <Salutation letter={letter} />
      <Body text={letter.body} />

      <H3>Reason for Suspension</H3>
      {kv("Date of Incident", fv(letter, "incidentDate"))}
      {kv("Nature of Allegation", fv(letter, "natureOfAllegation"))}
      {kv("Reason for Suspension", fv(letter, "reasonForSuspension"))}

      <H3>Terms of Suspension</H3>
      <BulletList
        items={[
          <><span className="font-semibold">Effective Date:</span> {eff}</>,
          <><span className="font-semibold">Suspension Period:</span> Until further written notice or completion of the investigation.</>,
          "During suspension you shall remain available to cooperate fully with the investigation.",
          "You shall not enter Company premises or contact employees, customers or suppliers regarding this matter unless authorized.",
          "Salary and benefits during suspension shall be administered in accordance with the Company's HR Policy and applicable laws.",
        ]}
      />
      <H3>Further Process</H3>
      <p>You will be informed separately if a Show Cause Notice, Domestic Inquiry Notice, or any other disciplinary proceeding is initiated. You will be given a reasonable opportunity to present your explanation before any final decision is made.</p>

      <PageBreak />
      <SignBlock letter={letter} designation={signatory(letter).designation === "Authorised Signatory" ? "Human Resources" : undefined} />
      <AckBlock letter={letter} title="Employee Acknowledgement" />
      <p className="-mt-24 mb-4">I acknowledge receipt of this Suspension Pending Investigation Letter.</p>
    </LetterPaper>
  );
}

/* ------------------------------------------------------ Domestic Inquiry */
export function DomesticInquiryLetter({ letter }: { letter: HRLetter }) {
  const iq = fv(letter, "inquiryDate");
  return (
    <LetterPaper>
      <LetterHead letter={letter} title="Domestic Inquiry Notice" />
      <ToHead letter={letter} />
      <Subject>Notice to Attend Domestic Inquiry</Subject>
      <Salutation letter={letter} />
      <Body text={letter.body} />

      <H3>Details of Allegation</H3>
      {kv("Incident Date", fv(letter, "incidentDate"))}
      {kv("Location", fv(letter, "incidentLocation"))}
      <p className="mt-2 font-semibold">Summary of Allegation:</p>
      <BorderedText>{fv(letter, "summaryOfAllegation") || "—"}</BorderedText>

      <H3>Inquiry Schedule</H3>
      <KVTable
        rows={[
          ["Inquiry Date", iq ? pdate(iq) : "—"],
          ["Inquiry Time", fv(letter, "inquiryTime") || "—"],
          ["Venue", fv(letter, "inquiryVenue") || "—"],
          ["Inquiry Officer / Committee", fv(letter, "inquiryOfficer") || "—"],
        ]}
      />

      <H3>Employee Rights</H3>
      <BulletList
        items={[
          "You will be given a full and fair opportunity to present your explanation.",
          "You may produce documents or other evidence relevant to your defense.",
          "You may identify witnesses whose testimony is relevant to the inquiry, subject to the Inquiry Committee's discretion.",
          "The inquiry will be conducted impartially in accordance with the Company's HR Policy and applicable laws.",
        ]}
      />

      <PageBreak />
      <H3>Attendance</H3>
      <p className="mb-4">You are required to attend the inquiry at the scheduled date and time. If you fail to attend without a valid reason, the Inquiry Committee may proceed based on the available evidence.</p>
      <SignBlock letter={letter} designation={signatory(letter).designation === "Authorised Signatory" ? "Human Resources" : undefined} />
      <AckBlock letter={letter} title="Employee Acknowledgement" />
      <p className="-mt-24 mb-4">I acknowledge receipt of this Domestic Inquiry Notice.</p>
    </LetterPaper>
  );
}

/* ----------------------------------------------------- Inquiry Committee */
export function InquiryCommitteeLetter({ letter }: { letter: HRLetter }) {
  const due = fv(letter, "reportDueDate");
  return (
    <LetterPaper>
      <LetterHead letter={letter} title="Inquiry Committee Appointment Letter" />
      <div className="mb-4 text-[12px]">
        <div className="text-[11px] font-semibold uppercase tracking-wide text-neutral-500">To</div>
        <div className="font-bold text-neutral-900">{letter.employeeName}</div>
        <div className="text-neutral-700">
          <span className="font-semibold">Designation: </span>
          <span className="font-normal">{fv(letter, "committeeMemberDesignation") || letter.employeeDesignation || "—"}</span>
        </div>
      </div>
      <Subject>Appointment as Inquiry Officer / Member of Inquiry Committee</Subject>
      <Salutation letter={letter} />
      <Body text={letter.body} />

      <H3>Scope of Inquiry</H3>
      <BulletList
        items={[
          "Examine the allegations objectively.",
          "Review all relevant documents and evidence.",
          "Hear the employee and witnesses.",
          "Maintain impartiality and confidentiality.",
          "Submit a written inquiry report with findings and recommendations.",
        ]}
      />

      <H3>Inquiry Details</H3>
      <KVTable
        rows={[
          ["Employee", `${fv(letter, "accusedEmployeeName") || "—"} (ID: ${fv(letter, "accusedEmployeeId") || "—"})`],
          ["Allegation", fv(letter, "briefAllegation") || "—"],
          ["Committee Chair", fv(letter, "committeeChair") || "—"],
          ["Members", fv(letter, "committeeMembers") || "—"],
          ["Report Due Date", due ? pdate(due) : "—"],
        ]}
      />

      <H3>Confidentiality</H3>
      <p className="mb-4">All proceedings, documents, evidence and deliberations shall remain strictly confidential. The Committee shall conduct the inquiry in accordance with the Company&apos;s HR Policy and applicable laws while ensuring procedural fairness.</p>
      <SignBlock letter={letter} designation={signatory(letter).designation === "Authorised Signatory" ? "Human Resources" : undefined} />
    </LetterPaper>
  );
}

// Re-export COMPANY so the dispatcher can build the default-letter type name.
export { COMPANY };
