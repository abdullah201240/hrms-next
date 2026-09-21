import type { SalarySlipPrint, Money } from "@/lib/print/print";
import { PrintSheet, SheetHeader, Rule, MetaGrid, SectionTitle, ItemsTable, TotalsBlock, InWords, SignFooter, pm, pdate } from "./sheet";

/**
 * Salary Slip print formats — one-to-one counterparts of the six built-in
 * Frappe HR print formats (hrms/payroll/print_format/*): Standard, Classic,
 * Compact, Detailed, With Year To Date, Based On Timesheet.
 */

type P = { data: SalarySlipPrint };

const empMeta = (d: SalarySlipPrint): [string, React.ReactNode][] => [
  ["Employee", d.employeeName],
  ["Employee ID", d.employeeId],
  ["Department", d.department],
  ["Designation", d.designation],
  ["Branch", d.branch],
  ["Company", d.company],
];

const periodMeta = (d: SalarySlipPrint): [string, React.ReactNode][] => [
  ["Start Date", pdate(d.startDate)],
  ["End Date", pdate(d.endDate)],
  ["Drawing/Payment Date", pdate(d.drawingDate)],
  ["Working Days", d.workingDays],
  ["Leave Without Pay", d.lwp],
  ["Payment Days", d.paymentDays],
];

/* ── Salary Slip Standard — two meta columns, side-by-side earnings/deductions ── */
export function SalarySlipStandard({ data: d }: P) {
  return (
    <PrintSheet>
      <SheetHeader title="Salary Slip" docName={d.name} status={d.slip.status} date={d.drawingDate} />
      <div className="mb-4 grid gap-x-10 sm:grid-cols-2">
        <MetaGrid items={empMeta(d)} cols={1} />
        <MetaGrid items={periodMeta(d)} cols={1} />
      </div>
      <Rule />
      <div className="grid gap-8 sm:grid-cols-2">
        <ItemsTable caption="Earnings" rows={d.earnings} totalLabel="Gross Pay" total={d.gross} />
        <ItemsTable
          caption="Deductions"
          rows={d.deductions}
          totalLabel="Total Deduction"
          total={d.totalDeduction}
          extraCol={{ header: "Pro-rata", value: () => "Yes" }}
        />
      </div>
      <Rule />
      <TotalsBlock rows={[["Gross Pay", d.gross], ["Total Deduction", d.totalDeduction], ["Net Pay", d.net], ["Rounded Total", d.rounded]]} emphasize={2} />
      <InWords text={d.inWords} />
      <MetaGrid items={[["Bank", d.bankName], ["Account No.", d.accountNo]]} />
      <SignFooter />
    </PrintSheet>
  );
}

/* ── Salary Slip Classic — centred heading, stacked sections ── */
export function SalarySlipClassic({ data: d }: P) {
  return (
    <PrintSheet>
      <div className="mb-4 text-center">
        <div className="text-xl font-bold uppercase tracking-widest">{d.company}</div>
        <div className="text-sm uppercase tracking-[0.3em] text-neutral-500">Salary Slip — {d.slip.month}</div>
      </div>
      <Rule strong />
      <MetaGrid items={[...empMeta(d).slice(0, 4), ["Pay Period", `${pdate(d.startDate)} — ${pdate(d.endDate)}`], ["Net Pay", <span className="font-bold">{pm(d.net)}</span>]]} cols={3} />
      <div className="space-y-4">
        <ItemsTable caption="Earnings" rows={d.earnings} totalLabel="Gross Pay" total={d.gross} />
        <ItemsTable caption="Deductions" rows={d.deductions} totalLabel="Total Deduction" total={d.totalDeduction} />
      </div>
      <Rule />
      <TotalsBlock rows={[["Total Earnings", d.gross], ["Total Deductions", d.totalDeduction], ["Net Pay (Rounded)", d.rounded]]} emphasize={2} />
      <InWords text={d.inWords} />
      <SignFooter />
    </PrintSheet>
  );
}

/* ── Salary Slip Compact — dense single-strip payslip ── */
export function SalarySlipCompact({ data: d }: P) {
  const Row = ({ label, value, tone }: { label: string; value: string; tone?: "bad" | "good" }) => (
    <div className="flex justify-between px-2 py-1">
      <span className="text-neutral-500">{label}</span>
      <span className={`tabular-nums font-medium ${tone === "good" ? "text-emerald-700" : tone === "bad" ? "text-red-700" : ""}`}>{value}</span>
    </div>
  );
  return (
    <PrintSheet>
      <SheetHeader title="Salary Slip (Compact)" docName={d.name} status={d.slip.status} date={d.drawingDate} />
      <MetaGrid items={[["Employee", `${d.employeeName} (${d.employeeId})`], ["Designation", d.designation], ["Pay Period", `${pdate(d.startDate)} — ${pdate(d.endDate)}`], ["Payment Days", d.paymentDays]]} cols={2} />
      <Rule />
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="bg-neutral-50 py-1">
          <Row label="Gross Earnings" value={pm(d.gross)} />
          {d.earnings.map((e) => <Row key={e.label} label={e.label} value={pm(e.amount)} />)}
        </div>
        <div className="bg-neutral-50 py-1">
          <Row label="Total Deductions" value={pm(d.totalDeduction)} />
          {d.deductions.map((e) => <Row key={e.label} label={e.label} value={pm(e.amount)} />)}
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between bg-neutral-900 px-3 py-2 text-white">
        <span className="font-semibold uppercase tracking-wide">Net Pay</span>
        <span className="text-base font-bold tabular-nums">{pm(d.rounded)}</span>
      </div>
      <div className="mt-2 text-[10.5px] italic text-neutral-500">{d.inWords}</div>
      <SignFooter />
    </PrintSheet>
  );
}

/* ── Salary Slip Detailed — descriptions + per-component context ── */
export function SalarySlipDetailed({ data: d }: P) {
  const desc: Record<string, string> = {
    "Basic Salary": "Fixed monthly base as per salary structure",
    "House Rent Allowance": "Housing benefit — 50% of basic",
    "Conveyance Allowance": "Transport reimbursement, flat rate",
    "Medical Allowance": "Monthly medical allowance",
    "Special Allowance": "Balance amount decided by management",
    "Provident Fund": "10% of basic contributed by employee",
    "Income Tax": "Deducted at source per annual TDS",
    "Social Security": "Statutory social security contribution",
    "Health Insurance": "Group health insurance premium",
  };
  const rows: (Money & { note: string; depends: string })[] = [
    ...d.earnings.map((e) => ({ ...e, note: desc[e.label] ?? "—", depends: "Yes" })),
    ...d.deductions.map((e) => ({ ...e, note: desc[e.label] ?? "—", depends: e.label === "Income Tax" ? "No" : "Yes" })),
  ];
  return (
    <PrintSheet>
      <SheetHeader title="Salary Slip — Detailed" docName={d.name} status={d.slip.status} date={d.drawingDate} />
      <div className="mb-4 grid gap-x-10 sm:grid-cols-2">
        <MetaGrid items={empMeta(d)} cols={1} />
        <MetaGrid items={periodMeta(d)} cols={1} />
      </div>
      <SectionTitle>Salary Components</SectionTitle>
      <table className="w-full text-left">
        <thead>
          <tr className="text-[10.5px] uppercase tracking-wide text-neutral-500">
            <th className="py-1 font-semibold">Component</th>
            <th className="py-1 font-semibold">Description</th>
            <th className="py-1 text-center font-semibold">Type</th>
            <th className="py-1 text-right font-semibold">Amount</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.label} className={i % 2 ? "bg-neutral-50" : undefined}>
              <td className="py-1.5 font-medium">{r.label}</td>
              <td className="py-1.5 text-neutral-500">{r.note}</td>
              <td className="py-1.5 text-center text-[10.5px] uppercase text-neutral-500">{i < d.earnings.length ? "Earning" : "Deduction"}</td>
              <td className={`py-1.5 text-right tabular-nums ${i < d.earnings.length ? "" : "text-red-700"}`}>{i < d.earnings.length ? pm(r.amount) : `−${pm(r.amount)}`}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <Rule />
      <TotalsBlock rows={[["Gross Pay", d.gross], ["Total Deduction", d.totalDeduction], ["Net Pay", d.net], ["Rounded Total", d.rounded]]} emphasize={3} />
      <InWords text={d.inWords} />
      <MetaGrid items={[["Bank", d.bankName], ["Account No.", d.accountNo], ["Working Days", `${d.workingDays} (LWP ${d.lwp})`], ["Payment Days", d.paymentDays]]} cols={2} />
      <SignFooter />
    </PrintSheet>
  );
}

/* ── Salary Slip With Year To Date ── */
export function SalarySlipYtd({ data: d }: P) {
  const ytd = d.ytd!;
  const ytdRow = (r: Money, i: number, cur: number) => (
    <tr key={r.label} className={i % 2 ? "bg-neutral-50" : undefined}>
      <td className="py-1.5">{r.label}</td>
      <td className="py-1.5 text-right tabular-nums">{pm(cur)}</td>
      <td className="py-1.5 text-right tabular-nums text-neutral-500">{pm(r.amount)}</td>
    </tr>
  );
  return (
    <PrintSheet>
      <SheetHeader title="Salary Slip" docName={d.name} status={d.slip.status} date={d.drawingDate} />
      <div className="mb-4 text-center text-sm font-semibold uppercase tracking-wide text-neutral-500">
        {d.employeeName} · {d.slip.month} · Fiscal Year to Date
      </div>
      <SectionTitle>Earnings</SectionTitle>
      <table className="w-full mb-4 text-left">
        <thead>
          <tr className="text-[10.5px] uppercase tracking-wide text-neutral-500">
            <th className="py-1 font-semibold">Component</th>
            <th className="py-1 text-right font-semibold">This Month</th>
            <th className="py-1 text-right font-semibold">Year to Date</th>
          </tr>
        </thead>
        <tbody>
          {d.earnings.map((e, i) => ytdRow(e, i, e.amount))}
          <tr className="bg-neutral-100 font-semibold">
            <td className="py-1.5">Gross Pay</td>
            <td className="py-1.5 text-right tabular-nums">{pm(d.gross)}</td>
            <td className="py-1.5 text-right tabular-nums">{pm(ytd.gross)}</td>
          </tr>
        </tbody>
      </table>
      <SectionTitle>Deductions</SectionTitle>
      <table className="w-full text-left">
        <thead>
          <tr className="text-[10.5px] uppercase tracking-wide text-neutral-500">
            <th className="py-1 font-semibold">Component</th>
            <th className="py-1 text-right font-semibold">This Month</th>
            <th className="py-1 text-right font-semibold">Year to Date</th>
          </tr>
        </thead>
        <tbody>
          {d.deductions.map((e, i) => ytdRow(e, i, e.amount))}
          <tr className="bg-neutral-100 font-semibold">
            <td className="py-1.5">Total Deduction</td>
            <td className="py-1.5 text-right tabular-nums">{pm(d.totalDeduction)}</td>
            <td className="py-1.5 text-right tabular-nums">{pm(ytd.deduction)}</td>
          </tr>
        </tbody>
      </table>
      <Rule />
      <TotalsBlock
        rows={[
          ["Net Pay (This Month)", d.net],
          ["Rounded Total (This Month)", d.rounded],
          ["Net Pay (Year to Date)", ytd.net],
        ]}
        emphasize={2}
      />
      <InWords text={d.inWords} />
      <SignFooter />
    </PrintSheet>
  );
}

/* ── Salary Slip Based On Timesheet ── */
export function SalarySlipTimesheet({ data: d }: P) {
  const sessions: Money[] = d.earnings.slice(0, 3);
  const hours = [62.5, 48, 36];
  return (
    <PrintSheet>
      <SheetHeader title="Salary Slip Based On Timesheet" docName={d.name} status={d.slip.status} date={d.drawingDate} />
      <MetaGrid items={[["Employee", d.employeeName], ["Employee ID", d.employeeId], ["From Date", pdate(d.startDate)], ["To Date", pdate(d.endDate)]]} cols={2} />
      <SectionTitle>Timesheet Summary</SectionTitle>
      <table className="w-full mb-4 text-left">
        <thead>
          <tr className="text-[10.5px] uppercase tracking-wide text-neutral-500">
            <th className="py-1 font-semibold">Activity / Project</th>
            <th className="py-1 text-center font-semibold">Hours</th>
            <th className="py-1 text-right font-semibold">Amount</th>
          </tr>
        </thead>
        <tbody>
          {sessions.map((s, i) => (
            <tr key={s.label} className={i % 2 ? "bg-neutral-50" : undefined}>
              <td className="py-1.5">{s.label}</td>
              <td className="py-1.5 text-center tabular-nums">{hours[i]}</td>
              <td className="py-1.5 text-right tabular-nums">{pm(s.amount)}</td>
            </tr>
          ))}
          <tr className="bg-neutral-100 font-semibold">
            <td className="py-1.5">Gross Pay</td>
            <td className="py-1.5 text-center tabular-nums">{hours.reduce((a, b) => a + b, 0)}</td>
            <td className="py-1.5 text-right tabular-nums">{pm(d.gross)}</td>
          </tr>
        </tbody>
      </table>
      <ItemsTable caption="Deductions" rows={d.deductions} totalLabel="Total Deduction" total={d.totalDeduction} />
      <Rule />
      <TotalsBlock rows={[["Gross Pay", d.gross], ["Total Deduction", d.totalDeduction], ["Net Pay", d.rounded]]} emphasize={2} />
      <InWords text={d.inWords} />
      <SignFooter />
    </PrintSheet>
  );
}
