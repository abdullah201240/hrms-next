"use client";

import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { shiftAssignments } from "@/lib/mock/data-2";
import { rosterWeek, officeWindow, type DayKind } from "@/lib/working-hours";

// Week containing "today" (mock clock 2026-09-21, a Monday).
const WEEK_START = "2026-09-21";
const HEADER = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// Flat bg-tint swatches per day state (no borders — shadcn flat UI rule).
const CELL: Record<DayKind, string> = {
  working: "bg-emerald-100 dark:bg-emerald-950",
  weeklyOff: "bg-muted",
  holiday: "bg-rose-100 dark:bg-rose-950",
  halfHoliday: "bg-amber-100 dark:bg-amber-950",
};
const TITLE: Record<DayKind, string> = {
  working: "Working",
  weeklyOff: "Weekly off",
  holiday: "Holiday",
  halfHoliday: "Half-day holiday",
};

export default function RosterPage() {
  const window = officeWindow(WEEK_START);

  return (
    <>
      <PageHeader
        title="Shift Roster"
        description={`Weekly shift view · office window ${window.start}–${window.end} (${window.hours}h)`}
        backHref="/attendance"
        backLabel="Back to Attendance"
        showExport
        exportWhat="shift roster"
      />
      <Card>
        <CardContent className="p-0">
          <div className="w-full overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/40">
                  <th className="p-3 text-left font-medium">Employee</th>
                  <th className="p-3 text-left font-medium">Shift</th>
                  {HEADER.map((d) => (
                    <th key={d} className="p-3 text-center font-medium">
                      {d}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {shiftAssignments.map((a) => {
                  const days = rosterWeek(a.employee, WEEK_START);
                  return (
                    <tr key={a.id}>
                      <td className="p-3 font-medium whitespace-nowrap">{a.employee}</td>
                      <td className="p-3">
                        <Badge variant="secondary">{a.shiftType}</Badge>
                      </td>
                      {days.map((day) => (
                        <td key={day.date} className="p-3 text-center">
                          <span
                            className={`inline-block size-6 ${CELL[day.state.kind]}`}
                            title={`${TITLE[day.state.kind]}${day.state.label ? ` · ${day.state.label}` : ""}`}
                          />
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-2">
          <span className="inline-block size-3 bg-emerald-100 dark:bg-emerald-950" /> Working
        </span>
        <span className="flex items-center gap-2">
          <span className="inline-block size-3 bg-muted" /> Weekly off
        </span>
        <span className="flex items-center gap-2">
          <span className="inline-block size-3 bg-rose-100 dark:bg-rose-950" /> Holiday
        </span>
        <span className="flex items-center gap-2">
          <span className="inline-block size-3 bg-amber-100 dark:bg-amber-950" /> Half-day holiday
        </span>
      </div>
    </>
  );
}
