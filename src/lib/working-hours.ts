// ============================================================================
// Working-hours binding layer — glues the mock masters (Holiday Lists, Shift
// Types, Shift/Holiday-List Assignments, HR Settings) to the pure resolvers in
// `@/lib/holidays`. Screens import from here so every surface resolves the
// office window, weekly off and public holidays the same way Frappe HR does.
// ============================================================================
import { company, employees, leaveTypes } from "@/lib/mock/data";
import {
  holidayLists,
  shiftTypes,
  shiftAssignments,
  workingHoursSettings,
  type ShiftType,
} from "@/lib/mock/data-2";
import { holidayListAssignments } from "@/lib/mock/data-4";
import {
  addDays,
  addWeeklyOffHolidays,
  holidayOn,
  holidayRowsFor,
  isHalfHoliday,
  publicHolidays,
  toMinutes,
  totalLeaveDays,
  weekdayName,
  weeklyOffDates,
  WEEK_DAYS,
  type HolidayAssignmentLike,
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

/** The Shift Type that applies to an employee on a date (their active assignment, else the default). */
export function employeeShift(employeeName: string, asOn: string): ShiftType | undefined {
  const active = shiftAssignments.find(
    (a) => a.employee === employeeName && a.status === "Active" && a.fromDate <= asOn && asOn <= a.toDate,
  );
  const name = active?.shiftType || workingHoursSettings.defaultShift;
  return shiftTypes.find((s) => s.name === name);
}

/** Office start/end for a date — the default shift unless an employee is given. */
export function officeWindow(asOn: string, employeeName?: string): { start: string; end: string; hours: number; holidayList?: string } {
  const shift = employeeName ? employeeShift(employeeName, asOn) : shiftTypes.find((s) => s.name === workingHoursSettings.defaultShift);
  if (!shift) return { start: "09:00", end: "17:00", hours: workingHoursSettings.standardWorkingHours };
  return { start: shift.start, end: shift.end, hours: shift.hours, holidayList: shift.holidayList };
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

/** Roster row for one employee across a week — replaces the old hardcoded `i < 5`. */
export function rosterWeek(employeeName: string, weekStartMonday: string): { date: string; weekday: WeekDay; state: { kind: DayKind; label: string } }[] {
  return weekDates(weekStartMonday).map((date) => ({
    date,
    weekday: weekdayName(date),
    state: dayState(employeeName, date),
  }));
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

/** Weekly-off weekday of a holiday list (defaults to the company default list). */
export function getWeeklyOff(listName?: string): string {
  const name = listName || workingHoursSettings.defaultHolidayList;
  return holidayLists.find((l) => l.name === name)?.weeklyOff ?? "";
}

/**
 * Set the weekly-off day on a holiday list and regenerate its weekly-off rows,
 * preserving public holidays. Mirrors Holiday List's `weekly_off` field +
 * `get_weekly_off_dates` ("Add to Holidays"). Mutates the in-memory master so
 * roster / attendance / leave resolve the new weekly off within the session.
 */
export function setWeeklyOff(day: string, listName?: string): void {
  const name = listName || workingHoursSettings.defaultHolidayList;
  const list = holidayLists.find((l) => l.name === name);
  if (!list) return;
  list.weeklyOff = day;
  const publicRows = list.holidays.filter((r) => !r.weeklyOff);
  list.holidays = addWeeklyOffHolidays(publicRows, {
    from: list.from,
    to: list.to,
    weeklyOff: day,
  });
}

/** Upcoming weekly-off dates for a weekday name, from a start date. */
export function nextWeeklyOffDates(day: string, from: string, count = 4): string[] {
  if (!day) return [];
  return weeklyOffDates(from, addDays(from, 60), day).slice(0, count);
}

export { WEEK_DAYS, weekdayName, isHalfHoliday, toMinutes, publicHolidays };
export { workingHoursSettings };
