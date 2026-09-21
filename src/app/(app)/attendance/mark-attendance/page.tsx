"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SearchSelect } from "@/components/shared/search-select";
import { CalendarCheck } from "lucide-react";
import { employees } from "@/lib/mock/data";

const STATUSES = ["Present", "Absent", "Leave", "Week Off", "Half Day"];
const list = employees.slice(0, 8);

export default function AttendanceToolPage() {
  const [date, setDate] = useState("2026-09-21");
  const [marks, setMarks] = useState<Record<string, string>>({});

  return (
    <>
      <PageHeader
        title="Mark Attendance"
        description="Bulk-create attendance records for a single date."
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
          {list.map((e) => (
            <div
              key={e.id}
              className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{e.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {e.designation} · {e.department}
                </p>
              </div>
              <SearchSelect
                value={marks[e.id] ?? "Present"}
                onChange={(val) => setMarks((m) => ({ ...m, [e.id]: val }))}
                options={STATUSES}
                className="w-40"
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="mt-5 flex items-center gap-3">
        <Button>
          <CalendarCheck className="size-4" />
          Create Attendance Entries
        </Button>
        <span className="text-sm text-muted-foreground">For {date}</span>
      </div>
    </>
  );
}
