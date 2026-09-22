"use client";

import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SearchSelect } from "@/components/shared/search-select";
import { CalendarCheck } from "lucide-react";
import { employees } from "@/lib/mock/data";
import { dayState } from "@/lib/working-hours";

// Attendance.doctype status options — there is no "Week Off" status; a holiday
// is recorded by leaving the employee unmarked (or Present when they worked).
const STATUSES = ["Present", "Absent", "On Leave", "Half Day", "Work From Home"];
const list = employees.slice(0, 8);

export default function AttendanceToolPage() {
  const [date, setDate] = useState("2026-09-21");
  const [marks, setMarks] = useState<Record<string, string>>({});

  return (
    <>
      <PageHeader
        title="Mark Attendance"
        description="Bulk-create attendance records for a single date."
        backHref="/attendance"
        backLabel="Back to Attendance"
      />
      <Card className="mb-5">
        <CardContent className="flex flex-wrap items-end gap-4 p-5">
          <div className="space-y-1.5">
            <Label htmlFor="att-date">Attendance Date</Label>
            <Input
              id="att-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-48"
            />
          </div>
          <p className="text-sm text-muted-foreground">
            Set a status per employee, then save to generate records.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {list.map((e) => {
            const state = dayState(e.name, date);
            const off = state.kind === "holiday" || state.kind === "weeklyOff";
            return (
              <div
                key={e.id}
                className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{e.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {e.designation} · {e.department}
                  </p>
                  {off && (
                    <Badge variant="secondary" className="mt-1">
                      {state.kind === "weeklyOff" ? "Weekly off" : "Holiday"}
                      {state.label ? ` · ${state.label}` : ""}
                    </Badge>
                  )}
                </div>
                <SearchSelect
                  value={marks[e.id] ?? (off ? "Absent" : "Present")}
                  onChange={(val) => setMarks((m) => ({ ...m, [e.id]: val }))}
                  options={STATUSES}
                  className="w-40"
                />
              </div>
            );
          })}
        </CardContent>
      </Card>

      <div className="mt-5 flex items-center gap-3">
        <Button onClick={() => toast.success(`Attendance entries created for ${date}`)}>
          <CalendarCheck className="size-4" />
          Create Attendance Entries
        </Button>
        <span className="text-sm text-muted-foreground">For {date}</span>
      </div>
    </>
  );
}
