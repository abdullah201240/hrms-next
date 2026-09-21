import type { LeavePrint, ExpensePrint, EmployeePrint, GenericPrint } from "@/lib/print/print";
import { PrintSheet, SheetHeader, Rule, MetaGrid, SectionTitle, SignFooter, pm, pdate } from "./sheet";

/**
 * Document-style print formats — the hrms-next counterparts of Frappe HR's
 * letter-like prints (Leave Application approval letter, Expense Claim
 * standard print, Employee detail/"ID" print and the generic Standard format
 * that every doctype gets via the print builder).
 */

/* ── Leave Application — approval letter, like Frappe's standard print ── */
export function LeaveApplicationStandard({ data }: { data: LeavePrint }) {
  const a = data.app;
  return (
    <PrintSheet>
      <SheetHeader title="Leave Application" docName={data.name} status={a.status} date={a.appliedOn} />
      <MetaGrid
        items={[
          ["Employee", `${a.employeeName} (${a.employeeId})`],
          ["Approving Level / Approver", a.approver],
          ["Applied On", pdate(a.appliedOn)],
          ["Leave Type", a.leaveType],
        ]}
        cols={2}
      />
      <Rule />
      <div className="my-4 leading-7">
        <p>Dear <b>{a.approver}</b>,</p>
        <p className="mt-2">
          <b>{a.employeeName}</b> has applied for <b>{a.leaveType}</b> from{" "}
          <b>{pdate(a.from)}</b> to <b>{pdate(a.to)}</b> (<b>{a.days}</b>{" "}
          {a.days === 1 ? "day" : "days"}) for the reason stated below.
        </p>
        <div className="mt-3 bg-neutral-50 px-3 py-2">
          <div className="text-[10.5px] font-semibold uppercase tracking-wide text-neutral-500">Reason</div>
          <div>{a.reason}</div>
        </div>
      </div>
      <MetaGrid
        items={[
          ["From Date", pdate(a.from)],
          ["To Date", pdate(a.to)],
          ["Total Days", a.days],
          ["Status", a.status],
        ]}
        cols={4}
      />
      <div className="mt-8 grid grid-cols-2 gap-10">
        <div className="text-center">
          <div className="mb-8">{a.status === "Approved" ? <span className="inline-block bg-emerald-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-emerald-800">Approved</span> : a.status === "Rejected" ? <span className="inline-block bg-red-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-red-800">Rejected</span> : <span className="inline-block bg-amber-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-amber-800">Pending</span>}</div>
          <div className="mx-auto h-px w-[45mm] bg-neutral-400" />
          <div className="mt-1 text-[10.5px] text-neutral-500">Leave Approver</div>
        </div>
        <div className="text-center">
          <div className="mb-8" />
          <div className="mx-auto h-px w-[45mm] bg-neutral-400" />
          <div className="mt-1 text-[10.5px] text-neutral-500">Employee Signature</div>
        </div>
      </div>
      <SignFooter note="Approved leave applications are reflected in the employee's leave ledger automatically." />
    </PrintSheet>
  );
}

/* ── Expense Claim — claim items table + sanctioned totals ── */
export function ExpenseClaimStandard({ data }: { data: ExpensePrint }) {
  const c = data.claim;
  return (
    <PrintSheet>
      <SheetHeader title="Expense Claim" docName={c.claimId} status={c.status} date={c.date} />
      <MetaGrid
        items={[
          ["Employee", `${c.employeeName} (${c.employeeId})`],
          ["Approver", c.approver],
          ["Claim Date", pdate(c.date)],
          ["Currency", c.currency],
        ]}
        cols={2}
      />
      <Rule />
      <SectionTitle>Claimed Expenses</SectionTitle>
      <table className="w-full text-left">
        <thead>
          <tr className="text-[10.5px] uppercase tracking-wide text-neutral-500">
            <th className="py-1 font-semibold">Expense Date</th>
            <th className="py-1 font-semibold">Category</th>
            <th className="py-1 font-semibold">Description</th>
            <th className="py-1 text-right font-semibold">Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="py-1.5">{pdate(c.date)}</td>
            <td className="py-1.5">{c.category}</td>
            <td className="py-1.5 text-neutral-500">{c.description}</td>
            <td className="py-1.5 text-right tabular-nums">{pm(c.amount)}</td>
          </tr>
          <tr className="bg-neutral-100 font-semibold">
            <td className="py-1.5" colSpan={3}>Sanctioned / Approved Amount</td>
            <td className="py-1.5 text-right tabular-nums">{c.status === "Rejected" ? pm(0) : pm(c.amount)}</td>
          </tr>
        </tbody>
      </table>
      <div className="mt-4 grid gap-x-10 sm:grid-cols-2">
        <MetaGrid items={[["Total Claimed Amount", pm(c.amount)], ["Total Sanctioned Amount", c.status === "Rejected" ? pm(0) : pm(c.amount)]]} cols={1} />
        <MetaGrid items={[["Reimbursed Amount", c.status === "Paid" ? pm(c.amount) : pm(0)], ["Status", c.status]]} cols={1} />
      </div>
      <SignFooter note="Payments are processed against the sanctioned amount via Payment Entry." />
    </PrintSheet>
  );
}

/* ── Employee — profile print (personal + employment summary) ── */
export function EmployeeStandard({ data }: { data: EmployeePrint }) {
  const e = data.row;
  return (
    <PrintSheet>
      <SheetHeader title="Employee" docName={e.employeeId ?? data.name} status={e.status} date={e.joinDate} />
      <div className="mb-4 flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center bg-neutral-900 text-lg font-bold text-white">
          {String(e.name ?? "?").split(" ").map((w: string) => w[0]).slice(0, 2).join("")}
        </div>
        <div>
          <div className="text-base font-semibold">{e.name}</div>
          <div className="text-neutral-500">{e.designation} · {e.department}</div>
        </div>
      </div>
      <SectionTitle>Employment</SectionTitle>
      <MetaGrid
        items={[
          ["Employee ID", e.employeeId],
          ["Date of Joining", pdate(e.joinDate)],
          ["Department", e.department],
          ["Designation", e.designation],
          ["Reports To", e.reportsTo],
          ["Work Location", e.workLocation],
          ["Employment Status", e.status],
          ["Company", data.company],
        ]}
        cols={2}
      />
      <Rule />
      <SectionTitle>Personal</SectionTitle>
      <MetaGrid
        items={[
          ["Email", e.email],
          ["Phone", e.phone],
          ...(e.gender ? [["Gender", e.gender] as [string, string]] : []),
          ...(e.dateOfBirth ? [["Date of Birth", pdate(e.dateOfBirth)] as [string, string]] : []),
          ...(e.currentAddress ? [["Current Address", e.currentAddress] as [string, string]] : []),
          ...(e.bankName ? [["Bank", e.bankName] as [string, string]] : []),
          ...(e.bankAccountNo ? [["Account No.", e.bankAccountNo] as [string, string]] : []),
        ]}
        cols={2}
      />
      <SignFooter />
    </PrintSheet>
  );
}

/* ── Generic "Standard" — mirrors Frappe's builder-generated standard print
   for any doctype row: heading, key/value fields, optional notes. ── */
export function GenericStandard({ data }: { data: GenericPrint }) {
  return (
    <PrintSheet>
      <SheetHeader title={data.doctype} docName={data.name} date={new Date().toISOString()} />
      <div className="mb-2 text-sm font-medium text-neutral-500">{data.title}</div>
      <Rule />
      <MetaGrid items={data.extra?.map(([k, v]) => [k, v] as [string, React.ReactNode]) ?? []} cols={2} />
      <SignFooter note={`Printed from the ${data.company} HR portal — ${data.doctype} standard format.`} />
    </PrintSheet>
  );
}
