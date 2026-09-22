import type { HRLetter } from "@/lib/letters";
import { pdate } from "@/components/shared/print/sheet";
import {
  COMPANY,
  COMPANY_ADDR,
  fill,
  fv,
  signatory,
  LetterPaper,
  LetterHead,
  Subject,
  Salutation,
  Body,
  H3,
  KVTable,
  CmpTable,
  Clauses,
  BulletList,
  BorderedText,
  PageBreak,
  SignBlock,
  AckBlock,
} from "./paper";

/**
 * Employment-related letter templates — a faithful hrms-next port of the
 * reference HR letter module (offer, appointment, confirmation, promotion,
 * salary revision, relieving and the generic default letter). The wording is
 * preserved; the letterhead and signatory are driven from the shared `company`
 * mock so every document reads as Acme Technologies Ltd.
 */

function To({ name, lines }: { name: string; lines: React.ReactNode[] }) {
  return (
    <div className="mb-4 text-[12px]">
      <div className="text-[11px] font-semibold uppercase tracking-wide text-neutral-500">To</div>
      <div className="font-bold text-neutral-900">{name}</div>
      {lines.map((l, i) => (
        <div key={i} className="text-neutral-700">
          {l}
        </div>
      ))}
    </div>
  );
}

const lbl = (k: string, v: React.ReactNode) => (
  <span>
    <span className="font-semibold">{k}: </span>
    <span className="font-normal">{v || "—"}</span>
  </span>
);

/* ------------------------------------------------------------------ Offer */
export function OfferLetter({ letter }: { letter: HRLetter }) {
  const designation = fv(letter, "designation") || letter.employeeDesignation;
  const joining = fv(letter, "proposedJoiningDate");
  const expiry = fv(letter, "offerExpiryDate");
  return (
    <LetterPaper>
      <LetterHead letter={letter} />
      <To name={letter.employeeName} lines={[<span className="whitespace-pre-line">{fv(letter, "presentAddress") || "—"}</span>]} />
      <Subject>Offer of Employment</Subject>
      <Salutation letter={letter} />
      <Body text={letter.body} />

      <KVTable
        rows={[
          ["Position", designation || "—"],
          ["Department", fv(letter, "department") || letter.employeeDepartment || "—"],
          ["Employment Type", fv(letter, "employmentType") || "—"],
          ["Reporting To", fv(letter, "reportingTo") || "—"],
          ["Duty Station", fv(letter, "dutyStation") || "—"],
          ["Proposed Joining Date", joining ? pdate(joining) : "—"],
          ["Monthly Gross Salary", `BDT ${fv(letter, "monthlyGrossSalary") || "—"}`],
        ]}
      />

      <p className="mb-1">This offer is subject to the following conditions:</p>
      <ol className="mb-4 list-decimal space-y-1 pl-6">
        <li>Submission of all required documents and satisfactory verification thereof.</li>
        <li>Successful completion of the pre-employment medical examination (where applicable).</li>
        <li>Acceptance of the Company&apos;s Appointment Letter and compliance with all applicable Company policies, rules, and regulations.</li>
        <li>Completion of all joining formalities on or before the joining date.</li>
      </ol>
      <p className="mb-3">
        This Offer of Employment shall remain valid until <span className="font-semibold">{expiry ? pdate(expiry) : "—"}</span>. Kindly confirm your acceptance by signing and returning a copy of this letter on or before the above date.
      </p>
      <p className="mb-3">Upon acceptance, a formal Appointment Letter containing the detailed terms and conditions of your employment will be issued on your joining date.</p>
      <p className="mb-3">We look forward to welcoming you to {COMPANY} and wish you a successful and rewarding career with us.</p>

      <PageBreak />
      <SignBlock letter={letter} designation={signatory(letter).designation === "Authorised Signatory" ? "Managing Director" : undefined} />
      <AckBlock
        letter={letter}
        title="Acceptance of Offer"
      />
      <p className="-mt-24 mb-4 max-w-[150mm] whitespace-pre-line">
        {`I, ${letter.employeeName}, hereby accept the above Offer of Employment and agree to join ${COMPANY} on ${joining ? pdate(joining) : "—"}.`}
      </p>
    </LetterPaper>
  );
}

/* ----------------------------------------------------------- Appointment */
export function AppointmentLetter({ letter }: { letter: HRLetter }) {
  const designation = fv(letter, "designation") || letter.employeeDesignation || "—";
  const department = fv(letter, "department") || letter.employeeDepartment || "—";
  const startDate = fv(letter, "startDate") || (letter.effectiveDate ? pdate(letter.effectiveDate) : "—");
  const offerLetterDate = fv(letter, "offerLetterDate") || "—";
  const reportingManager = fv(letter, "reportingManager") || "—";
  const officeLocation = fv(letter, "officeLocation") || "—";
  const salary = fv(letter, "salary") || "—";
  return (
    <LetterPaper>
      <LetterHead letter={letter} title="Appointment Letter" />
      <To
        name={letter.employeeName}
        lines={[lbl("Employee ID", letter.employeeIdCode), lbl("Present Address", fv(letter, "presentAddress") || "—")]}
      />
      <Subject>Appointment as {designation}</Subject>
      <Salutation letter={letter} />
      <p className="mb-4">
        We are pleased to appoint you as <span className="font-semibold">{designation}</span> in the{" "}
        <span className="font-semibold">{department}</span> of {COMPANY} effective from{" "}
        <span className="font-semibold">{startDate}</span>. Your appointment is made based on your acceptance of our Offer Letter dated{" "}
        <span className="font-semibold">{offerLetterDate}</span> and is governed by the following terms and conditions.
      </p>

      <Clauses
        items={[
          { heading: "Position", body: `You are appointed as ${designation} and will report to ${reportingManager} or any other person designated by the Company from time to time.` },
          { heading: "Place of Posting", body: `Your initial duty station shall be ${officeLocation}. The Company reserves the right to transfer you to any office, project site, or affiliated organization within the country whenever business requirements so demand.` },
          { heading: "Probation", body: "You will remain on probation for six (6) months from your date of joining. Upon satisfactory completion of probation and subject to Management approval, your employment may be confirmed in writing. The Company reserves the right to extend the probation period or discontinue your employment during probation in accordance with the Company's HR Policy and applicable laws." },
          { heading: "Working Hours", body: "Your working hours shall be in accordance with the Company's office schedule. You may be required to work beyond normal office hours whenever business requirements so necessitate." },
          { heading: "Compensation", body: `You shall receive a Gross Monthly Salary of BDT ${salary}. Salary shall be paid through bank transfer in accordance with the Company's payroll schedule.` },
          { heading: "Leave", body: "You shall be entitled to leave and holidays in accordance with the Company's HR Policy and applicable laws." },
          { heading: "Performance Evaluation", body: "Your performance shall be evaluated periodically under the Company's Performance Management System. Confirmation, salary revision, promotion and other employment benefits shall be based on performance, organizational requirements and Management approval." },
          { heading: "Provident Fund and Gratuity", body: "The Employee may become eligible to participate in the Company's Provident Fund and Gratuity Schemes in accordance with the respective approved Trust Deeds, Company Policies, applicable laws, and the eligibility criteria prescribed therein. The Company reserves the right to amend, revise, suspend, or discontinue such schemes to the extent permitted by applicable laws. Detailed provisions governing these schemes shall be communicated separately upon their implementation and as they become applicable to the Employee." },
          { heading: "Confidentiality", body: "You shall maintain strict confidentiality regarding all confidential information acquired during your employment, both during and after separation from the Company." },
          { heading: "Code of Conduct", body: "You shall comply with the Company's HR Policy, Code of Conduct and all other policies, procedures and lawful instructions issued from time to time." },
          { heading: "Company Property", body: "All Company property issued to you shall remain the property of the Company and must be returned upon request or upon cessation of employment." },
          { heading: "Separation from Employment", body: "Either party may terminate this employment in accordance with the Company's HR Policy and applicable laws." },
          { heading: "Governing Policies", body: "Your employment shall be governed by the Company's HR Policy, Rules & Regulations and applicable laws." },
        ]}
      />
      <p className="mb-2">We welcome you to {COMPANY} and wish you a successful and rewarding career with us.</p>

      <SignBlock letter={letter} designation={signatory(letter).designation === "Authorised Signatory" ? "Managing Director" : undefined} />
      <PageBreak />
      <AckBlock letter={letter} title="Employee's Acceptance" />
      <p className="-mt-24 mb-4 max-w-[150mm]">
        I, <span className="font-semibold">{letter.employeeName}</span>, hereby acknowledge that I have read, understood and accepted the terms and conditions of this Appointment Letter and agree to comply with the Company&apos;s policies, rules and regulations.
      </p>
    </LetterPaper>
  );
}

/* --------------------------------------------------------- Confirmation */
export function ConfirmationLetter({ letter }: { letter: HRLetter }) {
  const confirmed = fv(letter, "confirmedDesignation") || letter.employeeDesignation || "—";
  return (
    <LetterPaper>
      <LetterHead letter={letter} title="Confirmation Letter" />
      <To
        name={letter.employeeName}
        lines={[
          lbl("Employee ID", letter.employeeIdCode),
          lbl("Designation", letter.employeeDesignation || confirmed),
          lbl("Department", letter.employeeDepartment || fv(letter, "department")),
        ]}
      />
      <Subject>Confirmation of Employment</Subject>
      <Salutation letter={letter} />
      <Body text={letter.body} />
      <p className="mb-2">Your employment particulars are as follows:</p>
      <KVTable
        rows={[
          ["Effective Date of Confirmation", letter.effectiveDate ? pdate(letter.effectiveDate) : "—"],
          ["Designation", confirmed],
          ["Department", fv(letter, "department") || letter.employeeDepartment || "—"],
          ["Reporting To", fv(letter, "reportingTo") || "—"],
          ["Work Location", fv(letter, "workLocation") || "—"],
        ]}
      />
      <H3>Terms of Employment</H3>
      <p className="mb-2">From the effective date of this confirmation, your employment shall continue as a confirmed employee subject to the Company&apos;s HR Policy, rules, regulations and applicable laws.</p>
      <H3>Performance Expectations</H3>
      <p className="mb-2">You are expected to continue maintaining high standards of integrity, discipline, attendance, professionalism and performance in the discharge of your duties.</p>
      <H3>Provident Fund &amp; Gratuity</H3>
      <p className="mb-2">The Employee may become eligible to participate in the Company&apos;s Provident Fund and Gratuity Schemes in accordance with the respective approved Trust Deeds, Company Policies, applicable laws, and the eligibility criteria prescribed therein. Detailed provisions shall be communicated separately as and when the schemes become effective and applicable to the Employee.</p>

      <PageBreak />
      <H3>Other Benefits</H3>
      <p className="mb-2">You shall continue to enjoy employee benefits in accordance with the Company&apos;s HR Policy and any amendments made from time to time.</p>
      <p className="mb-4 font-semibold text-blue-700">
        Congratulations on your confirmation. We appreciate your contribution and look forward to your continued commitment and success with {COMPANY}.
      </p>
      <SignBlock letter={letter} designation={signatory(letter).designation === "Authorised Signatory" ? "Managing Director" : undefined} />
      <AckBlock letter={letter} title="Employee Acknowledgement" />
      <p className="-mt-24 mb-4">I acknowledge receipt of this Confirmation Letter and accept the terms stated herein.</p>
    </LetterPaper>
  );
}

/* ------------------------------------------------------------ Promotion */
export function PromotionLetter({ letter }: { letter: HRLetter }) {
  const f = (k: string) => fv(letter, k) || "—";
  const eff = letter.effectiveDate ? pdate(letter.effectiveDate) : "—";
  return (
    <LetterPaper>
      <LetterHead letter={letter} title="Promotion Letter" />
      <To
        name={letter.employeeName}
        lines={[
          lbl("Employee ID", letter.employeeIdCode),
          lbl("Current Designation", f("currentDesignation")),
          lbl("Department", letter.employeeDepartment || "—"),
        ]}
      />
      <Subject>Promotion and Revision of Compensation</Subject>
      <Salutation letter={letter} />
      <Body text={letter.body} />

      <CmpTable
        cols={["Particular", "Current", "Revised"]}
        rows={[
          { label: "Designation", a: f("currentDesignation"), b: f("newDesignation") },
          { label: "Grade", a: f("currentGrade"), b: f("newGrade") },
          { label: "Reporting To", a: f("currentReportingTo"), b: f("newReportingTo") },
          { label: "Gross Monthly Salary", a: `BDT ${f("currentGrossSalary")}`, b: `BDT ${f("revGrossSalary")}`, bold: true },
        ]}
      />

      <H3>Revised Monthly Salary Structure</H3>
      <KVTable
        rows={[
          ["Basic Salary", f("revBasic")],
          ["House Rent Allowance", f("revHouseRent")],
          ["Medical Allowance", f("revMedical")],
          ["Conveyance Allowance", f("revConveyance")],
          ["Other Allowance", f("revOtherAllowance")],
          ["Gross Monthly Salary", <span className="font-bold">{f("revGrossSalary")}</span>],
        ]}
      />

      <H3>Terms</H3>
      <BulletList
        items={[
          <>This promotion and salary revision shall be effective from <span className="font-semibold">{eff}</span>.</>,
          "All other terms and conditions of your Appointment Letter remain unchanged.",
          "Your duties and responsibilities shall be in accordance with your new designation and any instructions issued by Management.",
          "Your future performance will continue to be reviewed under the Company's Performance Management System.",
        ]}
      />

      <PageBreak />
      <p className="mb-4">Congratulations on your well-deserved promotion. We wish you continued success in your new role.</p>
      <SignBlock letter={letter} designation={signatory(letter).designation === "Authorised Signatory" ? "Managing Director" : undefined} />
      <AckBlock letter={letter} title="Employee Acknowledgement" />
      <p className="-mt-24 mb-4">I acknowledge receipt and acceptance of this Promotion and Salary Revision Letter.</p>
    </LetterPaper>
  );
}

/* ------------------------------------------------------ Salary Revision */
export function SalaryLetter({ letter }: { letter: HRLetter }) {
  const f = (k: string) => fv(letter, k) || "—";
  const eff = letter.effectiveDate ? pdate(letter.effectiveDate) : "—";
  return (
    <LetterPaper>
      <LetterHead letter={letter} title="Salary Revision Letter" />
      <To
        name={letter.employeeName}
        lines={[
          lbl("Employee ID", letter.employeeIdCode),
          lbl("Designation", letter.employeeDesignation || fv(letter, "designation")),
          lbl("Department", letter.employeeDepartment || "—"),
        ]}
      />
      <Subject>Salary Revision</Subject>
      <Salutation letter={letter} />
      <Body text={letter.body} />

      <CmpTable
        cols={["Particular", "Previous (BDT)", "Revised (BDT)"]}
        rows={[
          { label: "Basic Salary", a: f("prevBasic"), b: f("revBasic") },
          { label: "House Rent Allowance", a: f("prevHouseRent"), b: f("revHouseRent") },
          { label: "Medical Allowance", a: f("prevMedical"), b: f("revMedical") },
          { label: "Conveyance Allowance", a: f("prevConveyance"), b: f("revConveyance") },
          { label: "Other Allowance(s)", a: f("prevOtherAllowance"), b: f("revOtherAllowance") },
          { label: "Gross Monthly Salary", a: f("prevGross"), b: f("revGross"), bold: true },
        ]}
      />

      <H3>Terms and Conditions</H3>
      <BulletList
        items={[
          <>The revised salary shall be effective from <span className="font-semibold">{eff}</span>.</>,
          "Your designation, reporting relationship, duties and responsibilities shall remain unchanged unless otherwise notified by the Company.",
          "All other terms and conditions of your employment shall remain unchanged.",
          "This salary revision supersedes your previous salary structure from the effective date.",
        ]}
      />
      <p className="mb-4">We appreciate your dedication and valuable contribution to {COMPANY} and wish you continued success.</p>

      <PageBreak />
      <SignBlock letter={letter} designation={signatory(letter).designation === "Authorised Signatory" ? "Managing Director" : undefined} />
      <AckBlock letter={letter} title="Employee Acknowledgement" />
      <p className="-mt-24 mb-4">I acknowledge receipt of this Salary Revision Letter.</p>
    </LetterPaper>
  );
}

/* ------------------------------------------------------------ Relieving */
export function RelievingLetter({ letter }: { letter: HRLetter }) {
  const res = fv(letter, "resignationDate");
  const lwd = fv(letter, "lastWorkingDay");
  return (
    <LetterPaper>
      <LetterHead letter={letter} title="Resignation Acceptance Letter" />
      <To
        name={letter.employeeName}
        lines={[
          lbl("Designation", letter.employeeDesignation || fv(letter, "designation")),
          lbl("Department", letter.employeeDepartment || "—"),
        ]}
      />
      <Subject>Acceptance of Resignation</Subject>
      <Salutation letter={letter} />
      <Body text={letter.body} />

      <H3>Separation Details</H3>
      <KVTable
        rows={[
          ["Resignation Date", res ? pdate(res) : "—"],
          ["Notice Period", fv(letter, "noticePeriod") || "—"],
          ["Last Working Day", lwd ? pdate(lwd) : "—"],
          ["Reason for Leaving", fv(letter, "reasonForLeaving") || "—"],
          ["Reporting Manager", fv(letter, "reportingManager") || "—"],
        ]}
      />

      <H3>Handover and Clearance</H3>
      <p className="mb-2">You are required to complete the handover of all duties, files, records, passwords, documents, and Company assets to your Reporting Manager or the person nominated by Management. All departmental clearances must be completed before your final settlement is processed.</p>
      <H3>Full &amp; Final Settlement</H3>
      <p className="mb-2">Your Full &amp; Final Settlement shall be processed after successful completion of the clearance formalities and subject to Company policy and applicable laws. Any outstanding dues payable by either party shall be adjusted accordingly.</p>

      <PageBreak />
      <H3>Exit Formalities</H3>
      <p className="mb-2">Subject to satisfactory completion of all exit formalities, the Company will issue applicable employment documents such as the Experience Certificate and No Objection Certificate (where applicable).</p>
      <p className="mb-4 font-semibold">We sincerely appreciate your contribution to the Company and wish you success in your future endeavors.</p>
      <SignBlock letter={letter} designation={signatory(letter).designation === "Authorised Signatory" ? "Human Resources" : undefined} />
      <AckBlock letter={letter} title="Employee Acknowledgement" />
      <p className="-mt-24 mb-4">I acknowledge receipt of this Resignation Acceptance Letter.</p>
    </LetterPaper>
  );
}

/* -------------------------------------------------------------- Default */
export function DefaultLetter({ letter, typeName }: { letter: HRLetter; typeName: string }) {
  const s = signatory(letter);
  const entries = Object.entries(letter.fields || {}).filter(([k]) => !k.startsWith("signatory"));
  return (
    <LetterPaper>
      <div className="mb-6 flex items-start justify-between gap-8 border-b-2 border-neutral-800 pb-5">
        <div>
          <div className="text-2xl font-extrabold uppercase tracking-tight text-neutral-900">{COMPANY}</div>
          <div className="mt-1 text-[11px] text-neutral-500">{COMPANY_ADDR}</div>
        </div>
        <div className="text-right text-[11px] text-neutral-500">
          <div className="font-bold uppercase text-neutral-800">{typeName}</div>
          <div className="mt-1">Date: {pdate(letter.issueDate)}</div>
          <div>Ref: {letter.id}</div>
        </div>
      </div>

      <div className="text-[12.5px] leading-relaxed text-neutral-800">
        <p className="font-bold text-neutral-900">{letter.employeeName}</p>
        <p className="text-neutral-500">{letter.employeeDepartment !== "—" ? `${letter.employeeDepartment} Department` : ""}</p>
        <p className="mt-3 text-[14px] font-bold text-neutral-900">Subject: {letter.subject}</p>
        <p className="mt-3">Dear {letter.employeeName},</p>
        {letter.body
          .split("\n")
          .filter(Boolean)
          .map((p, i) => (
            <p key={i} className="mt-2">
              {fill(p)}
            </p>
          ))}

        {entries.length > 0 ? (
          <table className="mt-4 w-full border-collapse text-[12px]">
            <tbody>
              {entries.map(([k, v]) => (
                <tr key={k}>
                  <td className="w-[40%] border border-neutral-300 bg-neutral-50 px-3 py-1.5 capitalize text-neutral-500">
                    {k.replace(/([A-Z])/g, " $1").trim()}
                  </td>
                  <td className="border border-neutral-300 px-3 py-1.5 font-semibold text-neutral-900">{v || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : null}

        {letter.effectiveDate ? (
          <p className="mt-3 text-[11px] text-neutral-500">
            Effective Date: <strong className="text-neutral-900">{pdate(letter.effectiveDate)}</strong>
          </p>
        ) : null}

        <div className="mt-12 grid grid-cols-2 gap-8">
          <div>
            <p className="text-neutral-500">Sincerely,</p>
            <div className="flex h-14 items-end">
              <span className="font-serif italic text-neutral-400">{s.name}</span>
            </div>
            <div className="w-48 border-t border-neutral-300 pt-2">
              <p className="text-[11px] font-bold text-neutral-900">{s.name}</p>
              <p className="text-[10px] text-neutral-500">{s.designation === "Authorised Signatory" ? "Human Resources Department" : s.designation}</p>
              <p className="text-[10px] text-neutral-500">{COMPANY} — HR Management</p>
            </div>
          </div>
          <div className="flex flex-col items-end justify-end text-right">
            <p className="text-neutral-500">Acknowledged By:</p>
            <div className="h-14" />
            <div className="w-48 border-t border-neutral-300 pt-2 text-left">
              <p className="text-[11px] font-bold text-neutral-900">{letter.employeeName}</p>
              <p className="text-[10px] text-neutral-500">Employee Signature &amp; Date</p>
            </div>
          </div>
        </div>
      </div>
    </LetterPaper>
  );
}
