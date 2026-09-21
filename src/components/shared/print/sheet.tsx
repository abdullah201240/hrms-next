import { company } from "@/lib/mock/data";
import { fmtMoney } from "@/lib/mock/data";
import type { Money } from "@/lib/print/print";

/**
 * Print-sheet primitives — recreate the look of Frappe HR's printed documents
 * (letterhead header, right-aligned doc name, key/value sections, striped
 * component tables, totals block, signature footer). Flat by design: tone +
 * horizontal rules only, no borders/shadows (site-wide flat UI policy).
 */

export const pm = (n: number) => fmtMoney(n);

export const pdate = (iso?: string) => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

/** One A4 sheet. PrintDialog portals a print-only copy (#print-portal). */
export function PrintSheet({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-[210mm] bg-white px-[12mm] py-[10mm] text-[12.5px] leading-relaxed text-neutral-900">
      {children}
    </div>
  );
}

/** Frappe letterhead-style header: company block left, doc title/name right. */
export function SheetHeader({ title, docName, status, date }: { title: string; docName: string; status?: string; date?: string }) {
  return (
    <header className="mb-6 flex items-start justify-between gap-8">
      <div>
        <div className="text-lg font-bold uppercase tracking-wide">{company.name}</div>
        <div className="text-[11px] text-neutral-500">{company.address}</div>
        <div className="text-[11px] text-neutral-500">{company.email} · {company.phone}</div>
      </div>
      <div className="text-right">
        <div className="text-base font-semibold">{title}</div>
        <div className="font-mono text-[11px] text-neutral-500">{docName}</div>
        {date && <div className="text-[11px] text-neutral-500">{pdate(date)}</div>}
        {status && (
          <div className="mt-1 inline-block bg-neutral-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-neutral-600">
            {status}
          </div>
        )}
      </div>
    </header>
  );
}

export function Rule({ strong = false }: { strong?: boolean }) {
  return <div className={`my-3 h-px ${strong ? "bg-neutral-800" : "bg-neutral-300"}`} />;
}

/** Two-column key/value meta grid, like Frappe's field sections. */
const GRID_COLS = { 1: "sm:grid-cols-1", 2: "sm:grid-cols-2", 3: "sm:grid-cols-3", 4: "sm:grid-cols-4" } as const;
export function MetaGrid({ items, cols = 2 }: { items: [string, React.ReactNode][]; cols?: 1 | 2 | 3 | 4 }) {
  return (
    <dl className={`mb-4 grid gap-x-8 gap-y-1.5 ${GRID_COLS[cols]}`}>
      {items.map(([k, v]) => (
        <div key={k} className="flex justify-between gap-4 sm:block">
          <dt className="text-[10.5px] font-semibold uppercase tracking-wide text-neutral-500">{k}</dt>
          <dd className="font-medium sm:text-right">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Section caption on a tinted bar (Frappe section-heading look, no borders). */
export function SectionTitle({ children }: { children: React.ReactNode }) {
  return <div className="mb-1 bg-neutral-100 px-2 py-1 text-[11px] font-bold uppercase tracking-wide text-neutral-700">{children}</div>;
}

/** Earnings/Deductions-style table: component rows + tinted total row. */
export function ItemsTable({
  caption,
  rows,
  totalLabel,
  total,
  extraCol,
}: {
  caption: string;
  rows: Money[];
  totalLabel: string;
  total: number;
  extraCol?: { header: string; value: (r: Money) => React.ReactNode };
}) {
  return (
    <div>
      <SectionTitle>{caption}</SectionTitle>
      <table className="w-full text-left">
        <thead>
          <tr className="text-[10.5px] uppercase tracking-wide text-neutral-500">
            <th className="py-1 font-semibold">Salary Component</th>
            {extraCol && <th className="py-1 text-center font-semibold">{extraCol.header}</th>}
            <th className="py-1 text-right font-semibold">Amount</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.label} className={i % 2 ? "bg-neutral-50" : undefined}>
              <td className="py-1.5">{r.label}</td>
              {extraCol && <td className="py-1.5 text-center text-neutral-500">{extraCol.value(r)}</td>}
              <td className="py-1.5 text-right tabular-nums">{pm(r.amount)}</td>
            </tr>
          ))}
          <tr className="bg-neutral-100 font-semibold">
            <td className="py-1.5">{totalLabel}</td>
            {extraCol && <td />}
            <td className="py-1.5 text-right tabular-nums">{pm(total)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

/** Right-aligned summary stack (Gross / Total Deduction / Net / Rounded). */
export function TotalsBlock({ rows, emphasize }: { rows: [string, number][]; emphasize?: number }) {
  return (
    <div className="ml-auto w-full max-w-[70mm] space-y-0.5">
      {rows.map(([label, val], i) => (
        <div
          key={label}
          className={`flex justify-between px-2 py-1 ${i === emphasize ? "bg-neutral-900 font-bold text-white" : i % 2 === 0 ? "bg-neutral-100" : ""}`}
        >
          <span>{label}</span>
          <span className="tabular-nums">{pm(val)}</span>
        </div>
      ))}
    </div>
  );
}

export function InWords({ text }: { text: string }) {
  return (
    <div className="mt-3 bg-neutral-50 px-2 py-1.5">
      <span className="text-[10.5px] font-semibold uppercase tracking-wide text-neutral-500">Net Pay in Words: </span>
      <span className="font-medium italic">{text}</span>
    </div>
  );
}

/** Signature footer, as in Frappe HR's standard print view. */
export function SignFooter({ note }: { note?: string }) {
  return (
    <footer className="mt-10 flex items-end justify-between">
      <div className="max-w-[60%] text-[10.5px] text-neutral-500">
        {note ?? "This is a computer-generated document."}
      </div>
      <div className="text-center">
        <div className="mb-6" />
        <div className="h-px w-[45mm] bg-neutral-400" />
        <div className="mt-1 text-[10.5px] text-neutral-500">Authorised Signatory</div>
      </div>
    </footer>
  );
}
