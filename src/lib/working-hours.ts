// ============================================================================
// Working-hours binding layer — glues the mock masters (Holiday Lists, Shift
// Types, Shift/Holiday-List Assignments, HR Settings) to the pure resolvers in
// `@/lib/holidays`. Screens import from here so every surface resolves the
// office window, weekly off and public holidays the same way Frappe HR does.
// ============================================================================
import { company, employees, leaveTypes } from "@/lib/mock/data";
import {
  holidayLists,
  workingHoursSettings,
} from "@/lib/mock/data-2";
import { holidayListAssignments } from "@/lib/mock/data-4";
import {
  addDays,
  addWeeklyOffHolidays,
  addHolidayRange,
  groupPublicHolidays,
  holidayOn,
  holidayRowsFor,
  isHalfHoliday,
  publicHolidays,
  removeHolidayRowsByDates,
  toMinutes,
  totalHolidays,
  totalLeaveDays,
  weekdayName,
  weeklyOffDates,
  WEEK_DAYS,
  type HolidayAssignmentLike,
  type HolidayOccurrence,
  type HolidayRow,
  type WeekDay,
} from "@/lib/holidays";

/** Assignment rows typed against the pure resolver's structural contract. */
const assignments: HolidayAssignmentLike[] = holidayListAssignments;

/** Company used when an employee record doesn't override it. */
const companyName = company.name;

/** Resolve the holiday rows that apply to an employee on a date. */
export function employeeHolidayRows(employeeName: string, asOn: string): HolidayRow[] {
  const emp = employees.find((e) => e.name === employeeName);
  return holidayRowsFor({
    employee: employeeName,
    company: emp?.company ?? companyName,
    asOn,
    assignments,
    lists: holidayLists,
    // Employee.holidayList mirrors the legacy default; HR Settings is the fallback.
    defaultHolidayList: emp?.holidayList || workingHoursSettings.defaultHolidayList,
  });
}

/** Office start/end for the organization's single general shift. */
export function officeWindow(asOn?: string, employeeName?: string): { start: string; end: string; hours: number; holidayList?: string } {
  return {
    start: workingHoursSettings.startTime,
    end: workingHoursSettings.endTime,
    hours: workingHoursSettings.standardWorkingHours,
    holidayList: workingHoursSettings.defaultHolidayList,
  };
}

export type DayKind = "working" | "weeklyOff" | "holiday" | "halfHoliday";

/** Classify a single day for an employee using their resolved holiday list. */
export function dayState(employeeName: string, date: string): { kind: DayKind; label: string } {
  const rows = employeeHolidayRows(employeeName, date);
  const row = holidayOn(rows, date);
  if (row) {
    if (row.halfDay) return { kind: "halfHoliday", label: row.description };
    return { kind: row.weeklyOff ? "weeklyOff" : "holiday", label: row.description };
  }
  return { kind: "working", label: weekdayName(date) };
}

/** The seven days of the week containing `weekStartMonday` (Mon → Sun), ISO dates. */
export function weekDates(weekStartMonday: string): string[] {
  return Array.from({ length: 7 }, (_, i) => addDays(weekStartMonday, i));
}

/** Upcoming public holidays (weekly offs excluded) from a date, soonest first. */
export function upcomingHolidays(employeeName: string, from: string, count = 5): HolidayRow[] {
  const rows = employeeHolidayRows(employeeName, from);
  return publicHolidays(rows)
    .filter((r) => r.date >= from)
    .sort((a, b) => (a.date < b.date ? -1 : 1))
    .slice(0, count);
}

/**
 * Holiday-aware net leave days — mirrors Leave Application's
 * `calculate_total_leave_days` (holidays subtracted unless the Leave Type has
 * `include_holiday`). Falls back to including nothing when the type is unknown.
 */
export function netLeaveDays(
  employeeName: string,
  leaveTypeName: string,
  from: string,
  to: string,
  opts: { halfDay?: boolean; halfDayDate?: string } = {},
): { days: number; holidays: HolidayRow[] } {
  const type = leaveTypes.find((t) => t.name === leaveTypeName);
  // Leave Type carries `include_holiday` in Frappe; optional on the mock master.
  const includeHolidays = !!(type as { includeHoliday?: boolean } | undefined)?.includeHoliday;
  return totalLeaveDays({
    from,
    to,
    rows: employeeHolidayRows(employeeName, from),
    includeHolidays,
    halfDay: opts.halfDay,
    halfDayDate: opts.halfDayDate,
  });
}

/** Is the date a non-working day (full holiday / weekly off) for the employee? */
export function isNonWorkingDay(employeeName: string, date: string): boolean {
  const s = dayState(employeeName, date).kind;
  return s === "holiday" || s === "weeklyOff";
}

/* -------------------------------------------------------------------------- */
/* Weekly-off control (Holiday List `weekly_off` + "Add to Holidays")          */
/* The weekly holiday lives on the Holiday List, not HR Settings — same as     */
/* Frappe HR. These helpers let /settings read & change the DEFAULT list's     */
/* weekly-off day while keeping the list as the single source of truth.        */
/* -------------------------------------------------------------------------- */

/**
 * Weekly-off weekdays of a holiday list (defaults to the company default list).
 * Derived from the generated weekly-off rows (the true source `dayState` reads),
 * ordered Sunday→Saturday. Falls back to the single `weekly_off` field when the
 * list has no generated rows yet.
 */
export function getWeeklyOff(listName?: string): string[] {
  const name = listName || workingHoursSettings.defaultHolidayList;
  const list = holidayLists.find((l) => l.name === name);
  if (!list) return [];
  const days = new Set(
    list.holidays.filter((r) => r.weeklyOff && r.date).map((r) => weekdayName(r.date) as string),
  );
  const ordered = WEEK_DAYS.filter((d) => days.has(d));
  if (ordered.length) return [...ordered];
  return list.weeklyOff ? [list.weeklyOff] : [];
}

/**
 * Set the weekly-off day(s) on a holiday list and regenerate its weekly-off
 * rows, preserving public holidays. Mirrors Holiday List's `weekly_off` field +
 * `get_weekly_off_dates` ("Add to Holidays"), but allows multiple off days.
 * Mutates the in-memory master so roster / attendance / leave resolve the new
 * weekly offs within the session. `list.weeklyOff` keeps the first picked day
 * so the single-select Holiday List form still renders sanely.
 */
export function setWeeklyOff(days: string[], listName?: string): void {
  const name = listName || workingHoursSettings.defaultHolidayList;
  const list = holidayLists.find((l) => l.name === name);
  if (!list) return;
  const picked: string[] = WEEK_DAYS.filter((d) => days.includes(d));
  list.weeklyOff = picked[0] ?? "";
  let rows = list.holidays.filter((r) => !r.weeklyOff);
  for (const d of picked) {
    rows = addWeeklyOffHolidays(rows, { from: list.from, to: list.to, weeklyOff: d });
  }
  list.holidays = rows;
  list.totalHolidays = totalHolidays(rows);
}

/** Upcoming weekly-off dates for a set of weekday names, from a start date. */
export function nextWeeklyOffDates(days: string[], from: string, count = 4): string[] {
  if (!days.length) return [];
  const to = addDays(from, 60);
  const set = new Set<string>();
  for (const d of days) for (const x of weeklyOffDates(from, to, d)) set.add(x);
  return [...set].sort().slice(0, count);
}

/* -------------------------------------------------------------------------- */
/* Public/government holiday authoring for the simple Holiday Manager          */
/* Operates on the company DEFAULT list; stores one `Holiday` row per day but   */
/* presents them grouped by occasion so a "Durga Puja · 17→20 Oct" is one item. */
/* -------------------------------------------------------------------------- */

/** The holiday list the manager edits (company default unless a name is given). */
export function holidayList(listName?: string) {
  return holidayLists.find((l) => l.name === (listName || workingHoursSettings.defaultHolidayList));
}

/** Public/national holiday occasions on the default list, grouped by name. */
export function holidayOccasions(listName?: string): HolidayOccurrence[] {
  return groupPublicHolidays(holidayList(listName)?.holidays ?? []);
}

/** Add a government/public holiday occasion — a date range sharing one name. */
export function addHolidayOccasion(description: string, from: string, to?: string, halfDay = false, listName?: string): boolean {
  const list = holidayList(listName);
  if (!list || !description.trim() || !from) return false;
  list.holidays = addHolidayRange(list.holidays, { from, to, description: description.trim(), halfDay });
  list.totalHolidays = totalHolidays(list.holidays);
  return true;
}

/** Remove every row belonging to an occasion (matched by its description). */
export function removeHolidayOccasion(description: string, listName?: string): void {
  const list = holidayList(listName);
  if (!list) return;
  const dates = new Set(list.holidays.filter((r) => !r.weeklyOff && r.description === description).map((r) => r.date));
  list.holidays = removeHolidayRowsByDates(list.holidays, dates);
  list.totalHolidays = totalHolidays(list.holidays);
}

export { WEEK_DAYS, weekdayName, isHalfHoliday, toMinutes, publicHolidays, totalHolidays };
export { workingHoursSettings };
