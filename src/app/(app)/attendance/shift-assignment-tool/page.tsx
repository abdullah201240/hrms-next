"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserCog } from "lucide-react";
import { employees } from "@/lib/mock/data";
import { shiftTypes } from "@/lib/mock/data-2";

const list = employees.slice(0, 8);

export default function ShiftAssignmentToolPage() {
  const [shift, setShift] = useState(shiftTypes[0]?.name ?? "");
  const [from, setFrom] = useState("2026-10-01");
  const [to, setTo] = useState("2026-12-31");
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  const count = Object.values(selected).filter(Boolean).length;

  return (
    <>
      <PageHeader
        title="Shift Assignment Tool"
        description="Assign a shift to multiple employees at once."
      />
      <Card className="mb-5">
        <CardContent className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label>Shift Type</Label>
            <Select value={shift} onValueChange={(v) => v && setShift(v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select shift" />
              </SelectTrigger>
              <SelectContent>
                {shiftTypes.map((s) => (
                  <SelectItem key={s.id} value={s.name}>
                    {s.name} ({s.start}–{s.end})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="sa-from">From Date</Label>
            <Input id="sa-from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="sa-to">To Date</Label>
            <Input id="sa-to" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {list.map((e) => (
            <label
              key={e.id}
              className="flex cursor-pointer items-center gap-3 p-4 hover:bg-muted/40"
            >
              <Checkbox
                checked={!!selected[e.id]}
                onCheckedChange={(c) =>
                  setSelected((s) => ({ ...s, [e.id]: c === true }))
                }
              />
              <span className="text-sm font-medium">{e.name}</span>
              <span className="text-xs text-muted-foreground">
                {e.designation} · {e.department}
              </span>
            </label>
          ))}
        </CardContent>
      </Card>

      <div className="mt-5 flex items-center gap-3">
        <Button disabled={count === 0}>
          <UserCog className="size-4" />
          Assign to {count} {count === 1 ? "employee" : "employees"}
        </Button>
        <span className="text-sm text-muted-foreground">
          {shift} · {from} → {to}
        </span>
      </div>
    </>
  );
}
