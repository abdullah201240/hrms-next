import { company } from "@/lib/mock/data";
import { pdate } from "@/components/shared/print/sheet";
import type { HRLetter } from "@/lib/letters";

/**
 * Letter print primitives — the bespoke paper used by the Letters module. It
 * reuses the shared A4 sheet metrics (see print/sheet.tsx) so a printed letter
 * matches the look of every other hrms-next document, but adds the building
 * blocks a formal HR letter needs: a "Private & Confidential" masthead, a
 * recipient block, a blue subject line, numbered clause sections, bordered
 * particulars tables, and signature / acknowledgement footers.
 *
 * All letterhead / signatory text is driven from the shared `company` mock so
 * the letters read as the actual hrms-next company (Acme Technologies Ltd.),
 * not the reference system's hard-coded name. `{COMPANY}` tokens inside stored
 * bodies are substituted at render time via {@link fill}.
 */

export const COMPANY = company.name;
export const COMPANY_ADDR = company.address;

/** Replace the {COMPANY} placeholder used by the reference default bodies. */
export function fill(text: string): string {
  return (text ?? "").replace(/\{COMPANY\}/g, COMPANY);
}

/** Surname = last whitespace-delimited token of a full name. */
export function lastName(name: string): string {
  const parts = (name ?? "").trim().split(/\s+/);
  return parts[parts.length - 1] || name || "";
}

/** Read a template field, trimmed; empty string when absent. */
export function fv(letter: HRLetter, key: string): string {
  return (letter.fields[key] ?? "").trim();
}

/** Signatory defaults to whoever created the letter. */
export function signatory(letter: HRLetter): { name: string; designation: string } {
  return {
    name: fv(letter, "signatoryName") || letter.createdBy || "Authorised Signatory",
    designation: fv(letter, "signatoryDesignation") || "Authorised Signatory",
  };
}

/** A4 paper wrapper (same width/typography as PrintSheet, multi-page friendly). */
export function LetterPaper({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-[210mm] bg-white px-[14mm] py-[12mm] text-[12.5px] leading-relaxed text-neutral-900">
      {children}
    </div>
  );
}

/** Force a new physical page when printing (and a clear gap on screen). */
export function PageBreak() {
  return <div className="my-8 border-t border-dashed border-neutral-200 print:my-0 print:border-0 print:break-before-page print:pt-2" />;
}

export function Rule({ className = "bg-neutral-300" }: { className?: string }) {
  return <div className={`h-px ${className}`} />;
}

/** "Private & Confidential" + Ref. No. / Date row, then optional centered title. */
export function LetterHead({ letter, title }: { letter: HRLetter; title?: string }) {
  return (
    <header className="mb-5">
      <div className="flex items-start justify-between gap-8">
        <div className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
          Private &amp; Confidential
        </div>
        <div className="text-right text-[11px] text-neutral-500">
          <div>
            Ref. No.: <span className="font-mono text-neutral-700">{letter.id}</span>
          </div>
          <div>Date: {pdate(letter.issueDate)}</div>
        </div>
      </div>
      {title ? (
        <div className="mt-4 text-center text-[15px] font-bold uppercase tracking-[0.12em] text-neutral-900">
          {title}
        </div>
      ) : null}
      <Rule className="mt-4 bg-neutral-800" />
    </header>
  );
}

/** "To" recipient block used by most letter types. */
export function Recipient({ letter, address }: { letter: HRLetter; address?: string }) {
  return (
    <div className="mb-4 mt-1">
      <div className="text-[11px] uppercase tracking-wide text-neutral-500">To</div>
      <div className="font-semibold text-neutral-900">{letter.employeeName}</div>
      <div className="text-neutral-600">Employee ID: {letter.employeeIdCode}</div>
      {letter.employeeDesignation && letter.employeeDesignation !== "—" ? (
        <div className="text-neutral-600">{letter.employeeDesignation}</div>
      ) : null}
      {letter.employeeDepartment && letter.employeeDepartment !== "—" ? (
        <div className="text-neutral-600">{letter.employeeDepartment}</div>
      ) : null}
      {address ? <div className="text-neutral-600">{address}</div> : null}
      <div className="text-neutral-500">{COMPANY}</div>
    </div>
  );
}

export function Subject({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-3 text-neutral-800">
      <span className="font-semibold">Subject: </span>
      <span className="font-semibold text-blue-700">{children}</span>
    </p>
  );
}

export function Salutation({ letter, variant = "mr" }: { letter: HRLetter; variant?: "mr" | "full" }) {
  const text = variant === "full" ? `Dear ${letter.employeeName},` : `Dear Mr./Ms. ${lastName(letter.employeeName)},`;
  return <p className="mb-3">{text}</p>;
}

/** Free paragraph body honouring line breaks (the {COMPANY} token is filled). */
export function Body({ text }: { text: string }) {
  return <p className="mb-4 whitespace-pre-line">{fill(text)}</p>;
}

/** Numbered clause sections — the appointment/confirmation style. */
export function Clauses({ items }: { items: { heading: string; body: React.ReactNode }[] }) {
  return (
    <div className="mb-4 space-y-3">
      {items.map((c, i) => (
        <div key={c.heading} className="flex gap-2">
          <span className="shrink-0 font-semibold text-neutral-900">{i + 1}.</span>
          <div>
            <span className="font-semibold">{c.heading}. </span>
            <span className="whitespace-pre-line">{typeof c.body === "string" ? fill(c.body) : c.body}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

/** Bulleted list section with an optional bold lead-in. */
export function BulletList({ items, lead }: { items: React.ReactNode[]; lead?: string }) {
  return (
    <div className="mb-4">
      {lead ? <p className="mb-1">{fill(lead)}</p> : null}
      <ul className="list-disc space-y-1 pl-6">
        {items.map((it, i) => (
          <li key={i}>{typeof it === "string" ? fill(it) : it}</li>
        ))}
      </ul>
    </div>
  );
}

/** Two-column bordered particulars table (label → value). */
export function Particulars({ rows, cols = 2 }: { rows: [string, React.ReactNode][]; cols?: 1 | 2 }) {
  return (
    <table className="mb-4 w-full border-collapse text-[12px]">
      <tbody>
        {rows.map(([k, v]) => (
          <tr key={k}>
            <td className="w-[45%] border border-neutral-300 bg-neutral-50 px-3 py-1.5 font-semibold text-neutral-700 align-top">
              {k}
            </td>
            <td className="border border-neutral-300 px-3 py-1.5 align-top">{v}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/** Bordered italic block for free-text descriptions (misconduct, allegations). */
export function BorderedText({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-4 rounded border border-neutral-300 bg-neutral-50 px-3 py-2 italic text-neutral-700">
      {children}
    </div>
  );
}

export function SectionHeading({ children }: { children: React.ReactNode }) {
  return <div className="mb-1 mt-4 text-[11px] font-bold uppercase tracking-wide text-neutral-700">{children}</div>;
}

/** Right-aligned signatory block: "Yours faithfully" / For {COMPANY} / rule / name. */
export function SignBlock({
  letter,
  closing = "Yours faithfully,",
  designation,
}: {
  letter: HRLetter;
  closing?: string;
  designation?: string;
}) {
  const s = signatory(letter);
  return (
    <div className="mt-8 ml-auto w-[70mm] text-left">
      <p>{closing}</p>
      <p className="font-semibold">{COMPANY}</p>
      <div className="mt-10" />
      <Rule className="bg-neutral-400" />
      <p className="mt-1 font-medium">{s.name}</p>
      <p className="text-neutral-600">{designation ?? s.designation}</p>
    </div>
  );
}

/** Left "Employee Acknowledgement" block with Name / ID / Date rules. */
export function AckBlock({
  letter,
  title = "Employee Acknowledgement",
}: {
  letter: HRLetter;
  title?: string;
}) {
  const line = (label: string, value?: string) => (
    <div className="mb-5">
      <div className="h-px w-[60mm] bg-neutral-400" />
      <div className="mt-1 text-[11px] text-neutral-500">
        {label}
        {value ? <span className="ml-2 font-medium text-neutral-700">{value}</span> : null}
      </div>
    </div>
  );
  return (
    <div className="mt-10 w-fit">
      <p className="mb-3 font-semibold">{title}</p>
      {line("Name", letter.employeeName)}
      {line("Employee ID", letter.employeeIdCode)}
      {line("Date")}
    </div>
  );
}

/** Section caption in the reference's blue clause-heading style. */
export function H3({ children }: { children: React.ReactNode }) {
  return <h3 className="mb-1 mt-4 text-[12px] font-bold text-blue-700">{children}</h3>;
}

/** Two-column "Particular / Details" bordered table (offer, confirmation, …). */
export function KVTable({ rows }: { rows: [string, React.ReactNode][] }) {
  return (
    <table className="mb-4 w-full border-collapse text-[12px]">
      <thead>
        <tr className="bg-neutral-50">
          <th className="w-1/3 border border-neutral-300 px-2 py-1.5 text-left font-bold text-neutral-800">Particular</th>
          <th className="border border-neutral-300 px-2 py-1.5 text-left font-bold text-neutral-800">Details</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(([k, v]) => (
          <tr key={k}>
            <td className="border border-neutral-300 bg-neutral-50/60 px-2 py-1.5 font-semibold text-neutral-700">{k}</td>
            <td className="border border-neutral-300 px-2 py-1.5">{v}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/** Three-column "Particular / Current / Revised" bordered table (promotion, salary). */
export function CmpTable({
  cols,
  rows,
}: {
  cols: [string, string, string];
  rows: { label: string; a: React.ReactNode; b: React.ReactNode; bold?: boolean }[];
}) {
  return (
    <table className="mb-4 w-full border-collapse text-[12px]">
      <thead>
        <tr className="bg-neutral-50">
          <th className="w-1/3 border border-neutral-300 px-2 py-1.5 text-left font-bold text-neutral-800">{cols[0]}</th>
          <th className="border border-neutral-300 px-2 py-1.5 text-left font-bold text-neutral-800">{cols[1]}</th>
          <th className="border border-neutral-300 px-2 py-1.5 text-left font-bold text-neutral-800">{cols[2]}</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.label} className={r.bold ? "bg-neutral-50 font-bold" : undefined}>
            <td className="border border-neutral-300 px-2 py-1.5 font-semibold text-neutral-700">{r.label}</td>
            <td className="border border-neutral-300 px-2 py-1.5">{r.a}</td>
            <td className="border border-neutral-300 px-2 py-1.5">{r.b}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/** Footer note shown at the very bottom of a letter. */
export function FootNote({ children }: { children: React.ReactNode }) {
  return <p className="mt-8 text-[10.5px] text-neutral-400">{children}</p>;
}
