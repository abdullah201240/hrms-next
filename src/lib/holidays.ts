// ============================================================================
// Working hours & holidays domain logic — the hrms-next counterpart of
//   erpnext/setup/doctype/holiday_list/holiday_list.py  (Holiday List)
//   hrms/utils/holiday_list.py                          (assignment resolution)
//   hrms/hr/doctype/leave_application/leave_application.py (holiday-aware days)
// Pure functions only (no mock-data value imports) so both the mock builders and
// the screens share one implementation, exactly like Frappe shares these helpers.
// ============================================================================

/** One `Holiday` child row (erpnext `Holiday` doctype: holiday_date/description/weekly_off/is_half_day). */
export type HolidayRow = {
  date: string; // ISO yyyy-mm-dd — `holiday_date`
  description: string;
  weeklyOff: boolean; // auto-generated weekly off, not a public holiday
  halfDay: boolean; // `is_half_day` — weighs 0.5 in the total
};

/** Minimal structural view of a `Holiday List` record. */
export type HolidayListLike = {
  name: string;
  from: string;
  to: string;
  weeklyOff: string;
  holidays: HolidayRow[];
};

/** Minimal structural view of a `Holiday List Assignment` (submittable). */
export type HolidayAssignmentLike = {
  holidayList: string;
  assignedTo: string; // Employee name or Company name, per `applicable_for`
  applicableFor: "Employee" | "Company";
  fromDate: string; // `from_date` — "Assignment Starts From"
  docStatus: "Draft" | "Submitted"; // only docstatus 1 participates
};

export const WEEK_DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] as const;
export type WeekDay = (typeof WEEK_DAYS)[number];

/* -------------------------------------------------------------------------- */
/* Date helpers — parsed as calendar dates (UTC) so weekday maths never drifts */
/* -------------------------------------------------------------------------- */

/** "2026-03-26" → epoch-day-based Date. Frappe's `getdate`. */
export function toDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, (m || 1) - 1, d || 1));
}

/** Date → "yyyy-mm-dd" (Frappe's `formatdate` in ISO form). */
export function toISO(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function addDays(iso: string, n: number): string {
  const d = toDate(iso);
  d.setUTCDate(d.getUTCDate() + n);
  return toISO(d);
}

/** Day name of an ISO date — "Sunday" … "Saturday". */
export function weekdayName(iso: string): WeekDay {
  return WEEK_DAYS[toDate(iso).getUTCDay()];
}

/** Inclusive calendar-day count between two dates (Frappe's `date_diff(a,b)+1`). */
export function daysBetween(from: string, to: string): number {
  if (!from || !to) return 0;
  const a = toDate(from).getTime();
  const b = toDate(to).getTime();
  if (Number.isNaN(a) || Number.isNaN(b) || b < a) return 0;
  return Math.round((b - a) / 86_400_000) + 1;
}

/* -------------------------------------------------------------------------- */
/* Holiday List — child-table maths (Holiday List.validate / get_weekly_off_dates) */
/* -------------------------------------------------------------------------- */

/**
 * Every date from `from` to `to` that falls on the weekly-off day.
 * Mirrors `HolidayList.get_weekly_off_date_list` (first matching weekday, then +7 days).
 */
export function weeklyOffDates(from: string, to: string, day: string): string[] {
  if (!from || !to || !day || toDate(from) > toDate(to)) return [];
  const target = WEEK_DAYS.indexOf(day as WeekDay);
  if (target < 0) return [];
  const out: string[] = [];
  const cursor = toDate(from);
  cursor.setUTCDate(cursor.getUTCDate() + ((target - cursor.getUTCDay() + 7) % 7));
  while (toISO(cursor) <= to) {
    out.push(toISO(cursor));
    cursor.setUTCDate(cursor.getUTCDate() + 7);
  }
  return out;
}

/**
 * "Add to Holidays" button action — appends the weekly-off dates that are not
 * already listed, carrying the list-level half-day flag.
 * Mirrors `HolidayList.get_weekly_off_dates`.
 */
export function addWeeklyOffHolidays(
  rows: HolidayRow[],
  opts: { from: string; to: string; weeklyOff: string; halfDay?: boolean },
): HolidayRow[] {
  if (!opts.weeklyOff) return rows;
  const existing = new Set(rows.map((r) => r.date));
  const added = weeklyOffDates(opts.from, opts.to, opts.weeklyOff)
    .filter((d) => !existing.has(d))
    .map<HolidayRow>((d) => ({
      date: d,
      description: opts.weeklyOff, // Frappe uses the day name as the description
      weeklyOff: true,
      halfDay: !!opts.halfDay,
    }));
  return sortHolidayRows([...rows, ...added]);
}

/** "Clear Table" button action — `HolidayList.clear_table`. */
export function clearHolidayRows(): HolidayRow[] {
  return [];
}

/** Rows are always stored date-ascending — `HolidayList.sort_holidays`. */
export function sortHolidayRows(rows: HolidayRow[]): HolidayRow[] {
  return [...rows].sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
}

/**
 * `total_holidays` — a half day weighs 0.5, everything else 1.
 * Mirrors `HolidayList.update_total_holidays`.
 */
export function totalHolidays(rows: HolidayRow[]): number {
  return rows.reduce((n, r) => n + (r.halfDay ? 0.5 : 1), 0);
}

/** Public (non weekly-off) rows — `get_holidays(..., skip_weekly_offs=True)`. */
export function publicHolidays(rows: HolidayRow[]): HolidayRow[] {
  return rows.filter((r) => !r.weeklyOff);
}

/**
 * Save-time validations — `HolidayList.validate_days` + `validate_duplicate_date`.
 * Returns human-readable errors; empty array means the record is submittable.
 */
export function validateHolidayList(list: { from: string; to: string; rows: HolidayRow[] }): string[] {
  const errors: string[] = [];
  if (!list.from || !list.to) {
    errors.push("From Date and To Date are required.");
    return errors;
  }
  if (toDate(list.from) > toDate(list.to)) errors.push("To Date cannot be before From Date");
  for (const r of list.rows) {
    if (!r.date) continue;
    if (toDate(r.date) < toDate(list.from) || toDate(r.date) > toDate(list.to)) {
      errors.push(`The holiday on ${r.date} is not between From Date and To Date`);
    }
  }
  const seen = new Set<string>();
  for (const r of list.rows) {
    if (r.date && seen.has(r.date)) errors.push(`Holiday Date ${r.date} added multiple times`);
    seen.add(r.date);
  }
  return [...new Set(errors)];
}

/* -------------------------------------------------------------------------- */
/* Holiday lookups — erpnext `is_holiday` / `is_half_holiday`, hrms utils       */
/* -------------------------------------------------------------------------- */

/** Full-day holiday on that date (half days excluded) — `is_holiday`. */
export function isHoliday(rows: HolidayRow[], date: string): boolean {
  return !!date && rows.some((r) => r.date === date && !r.halfDay);
}

/** Half holiday on that date — `is_half_holiday`. */
export function isHalfHoliday(rows: HolidayRow[], date: string): boolean {
  return !!date && rows.some((r) => r.date === date && r.halfDay);
}

/** The row covering a date, if any. */
export function holidayOn(rows: HolidayRow[], date: string): HolidayRow | undefined {
  return rows.find((r) => r.date === date);
}

/** Holidays inside a range — `get_holiday_dates_between` (+ `skip_weekly_offs`). */
export function holidaysBetween(rows: HolidayRow[], from: string, to: string, opts: { skipWeeklyOffs?: boolean } = {}): HolidayRow[] {
  return sortHolidayRows(
    rows.filter((r) => {
      if (!r.date || r.date < from || r.date > to) return false;
      return opts.skipWeeklyOffs ? !r.weeklyOff : true;
    }),
  );
}

/* -------------------------------------------------------------------------- */
/* Public-holiday authoring — "add an occasion" (range) + grouping by name      */
/* Lets HR file "Durga Puja · 17→20 Oct" as one action instead of four rows,   */
/* while still storing one `Holiday` row per day (Frappe's shape).             */
/* -------------------------------------------------------------------------- */

/**
 * Add a public/national holiday that spans a date range — one row per day, all
 * sharing the occasion `description`. Duplicate dates are skipped (a weekly off
 * or an existing holiday on that day wins).
 */
export function addHolidayRange(
  rows: HolidayRow[],
  opts: { from: string; to?: string; description: string; halfDay?: boolean },
): HolidayRow[] {
  if (!opts.from || !opts.description) return rows;
  const to = opts.to && opts.to >= opts.from ? opts.to : opts.from;
  const existing = new Set(rows.map((r) => r.date));
  const added: HolidayRow[] = [];
  let cursor = opts.from;
  for (let guard = 0; guard <= 400 && cursor <= to; guard++) {
    if (!existing.has(cursor)) {
      added.push({ date: cursor, description: opts.description, weeklyOff: false, halfDay: !!opts.halfDay });
    }
    cursor = addDays(cursor, 1);
  }
  return sortHolidayRows([...rows, ...added]);
}

/** Remove rows whose date is in `dates` — deleting an occasion or a stray day. */
export function removeHolidayRowsByDates(rows: HolidayRow[], dates: Set<string>): HolidayRow[] {
  return rows.filter((r) => !dates.has(r.date));
}

/** A grouped public-holiday occasion: one name covering one or more dates. */
export type HolidayOccurrence = { description: string; dates: string[]; halfDay: boolean };

/**
 * Group public (non weekly-off) rows into occasions keyed by description, so a
 * multi-day "Durga Puja" stored as 4 rows surfaces as a single item.
 */
export function groupPublicHolidays(rows: HolidayRow[]): HolidayOccurrence[] {
  const map = new Map<string, HolidayOccurrence>();
  for (const r of publicHolidays(rows)) {
    if (!r.description) continue;
    const g = map.get(r.description) ?? { description: r.description, dates: [], halfDay: false };
    g.dates.push(r.date);
    g.halfDay = g.halfDay || r.halfDay;
    map.set(r.description, g);
  }
  return [...map.values()]
    .map((g) => ({ ...g, dates: [...new Set(g.dates)].sort() }))
    .sort((a, b) => (a.dates[0] < b.dates[0] ? -1 : 1));
}

/* -------------------------------------------------------------------------- */
/* Assignment resolution — hrms/utils/holiday_list.py                          */
/* -------------------------------------------------------------------------- */

/**
 * `get_assigned_holiday_list`: newest **submitted** assignment whose start date
 * has already passed for that employee-or-company.
 */
export function assignedHolidayList(assignments: HolidayAssignmentLike[], assignedTo: string, asOn: string): string | undefined {
  return assignments
    .filter((a) => a.assignedTo === assignedTo && a.docStatus === "Submitted" && a.fromDate <= asOn)
    .sort((a, b) => (a.fromDate < b.fromDate ? 1 : -1))[0]?.holidayList;
}

/**
 * `get_holiday_list_for_employee` chain: employee assignment → company assignment
 * (which is what `Company.default_holiday_list` becomes in v16) → nothing.
 */
export function holidayListFor(
  opts: {
    employee: string;
    company?: string;
    asOn: string;
    assignments: HolidayAssignmentLike[];
    /** Fallback used when no assignment exists — mirrors `Company.default_holiday_list`. */
    defaultHolidayList?: string;
  },
): string | undefined {
  const byEmployee = assignedHolidayList(opts.assignments, opts.employee, opts.asOn);
  if (byEmployee) return byEmployee;
  if (opts.company) {
    const byCompany = assignedHolidayList(opts.assignments, opts.company, opts.asOn);
    if (byCompany) return byCompany;
  }
  return opts.defaultHolidayList || undefined;
}

/**
 * Holiday rows that apply to an employee on a date, resolved through the
 * assignment chain. Returns [] when no list applies (Frappe raises in that case;
 * the portal degrades quietly and just shows no holiday).
 */
export function holidayRowsFor(
  opts: { employee: string; company?: string; asOn: string; assignments: HolidayAssignmentLike[]; lists: HolidayListLike[]; defaultHolidayList?: string },
): HolidayRow[] {
  const name = holidayListFor(opts);
  if (!name) return [];
  return opts.lists.find((l) => l.name === name)?.holidays ?? [];
}

/* -------------------------------------------------------------------------- */
/* Leave maths — leave_application.calculate_total_leave_days                   */
/* -------------------------------------------------------------------------- */

/**
 * Net leave days — verbatim port of `calculate_total_leave_days`: half-day
 * handling first, then holidays are subtracted unless the Leave Type has
 * `include_holiday`. The result is intentionally unclamped (a period that is
 * entirely holidays nets to 0 or less, which is what Frappe validates against).
 */
export function totalLeaveDays(opts: {
  from: string;
  to: string;
  rows: HolidayRow[];
  includeHolidays: boolean;
  halfDay?: boolean;
  halfDayDate?: string;
}): { days: number; holidays: HolidayRow[] } {
  let days: number;
  if (opts.halfDay) {
    if (opts.from === opts.to) days = 0.5;
    else if (opts.halfDayDate && opts.from <= opts.halfDayDate && opts.halfDayDate <= opts.to) {
      days = daysBetween(opts.from, opts.to) - 1 + 0.5; // date_diff(to, from) + 0.5
    } else days = daysBetween(opts.from, opts.to);
  } else days = daysBetween(opts.from, opts.to);
  const holidays = opts.includeHolidays ? [] : holidaysBetween(opts.rows, opts.from, opts.to);
  return { days: Math.round((days - holidays.length) * 100) / 100, holidays };
}

/* -------------------------------------------------------------------------- */
/* Shift Type maths                                                            */
/* -------------------------------------------------------------------------- */

/** "09:00" → minutes from midnight. */
export function toMinutes(time: string): number {
  const [h, m] = (time || "0:0").split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}

/** Shift span in hours, wrapping past midnight (night shifts). */
export function shiftHours(start: string, end: string): number {
  const s = toMinutes(start);
  const e = toMinutes(end);
  const mins = e >= s ? e - s : 24 * 60 - s + e;
  return Math.round((mins / 60) * 10) / 10;
}

/**
 * Late-entry / early-exit flags — Shift Type's grace periods
 * (`late_entry_grace_period`, `early_exit_grace_period`).
 */
export function attendanceFlags(opts: { start: string; end: string; lateGrace: number; earlyGrace: number; checkIn?: string; checkOut?: string }) {
  const inMin = opts.checkIn ? toMinutes(opts.checkIn.slice(11) || opts.checkIn) : undefined;
  const outMin = opts.checkOut ? toMinutes(opts.checkOut.slice(11) || opts.checkOut) : undefined;
  return {
    isLateEntry: inMin !== undefined && inMin > toMinutes(opts.start) + opts.lateGrace,
    isEarlyExit: outMin !== undefined && outMin < toMinutes(opts.end) - opts.earlyGrace,
  };
}
